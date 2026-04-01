import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './db/index'
import { sessions, messages, providers, personas as personaTable, documents } from './db/schema'
import { eq, desc, asc, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { OllamaProvider } from './providers/ollama'
import { LMStudioProvider } from './providers/lmstudio'
import { OpenRouterProvider } from './providers/openrouter'
import { Message } from './providers/types'
import { stream } from 'hono/streaming'
import { runRoundTable, getProviderAdapter, applyChattinessConstraint } from './orchestrator'
import { seedThinkingHats } from './db/seeds/personas'
import { syncRoles } from './services/role-sync'
import { RefinementService } from './services/refinement-service'

const app = new Hono()

// Run role sync on startup
syncRoles().catch(err => console.error('Initial role sync failed:', err))

app.use('/*', cors())

app.get('/status', (c) => {
  return c.json({
    status: 'ok',
    version: '0.1.0',
    platform: process.platform,
    timestamp: new Date().toISOString()
  })
})

// Provider routes
app.get('/providers', async (c) => {
  const result = await db.select().from(providers)
  return c.json(result)
})

app.post('/providers', async (c) => {
  const data = await c.req.json()
  const id = uuidv4()
  const now = new Date()
  await db.insert(providers).values({
    id,
    ...data,
    createdAt: now,
    updatedAt: now
  })
  return c.json({ id })
})

app.delete('/providers/:id', async (c) => {
  const id = c.req.param('id')
  await db.delete(providers).where(eq(providers.id, id))
  return c.json({ success: true })
})

// Model discovery
app.get('/models', async (c) => {
  const allProviders = await db.select().from(providers).where(eq(providers.isEnabled, true))
  let allModels: any[] = []

  for (const p of allProviders) {
    let adapter;
    if (p.type === 'ollama') adapter = new OllamaProvider(p.baseUrl || undefined)
    else if (p.type === 'lmstudio') adapter = new LMStudioProvider(p.baseUrl || undefined)
    else if (p.type === 'openrouter') adapter = new OpenRouterProvider(p.apiKey || '')

    if (adapter) {
      const models = await adapter.listModels()
      allModels = [...allModels, ...models.map(m => ({ ...m, providerId: p.id, providerName: p.name }))]
    }
  }

  return c.json(allModels)
})

app.get('/providers/:id/check', async (c) => {
  const id = c.req.param('id')
  const [p] = await db.select().from(providers).where(eq(providers.id, id))
  if (!p) return c.json({ error: 'Provider not found' }, 404)

  let adapter;
  if (p.type === 'ollama') adapter = new OllamaProvider(p.baseUrl || undefined)
  else if (p.type === 'lmstudio') adapter = new LMStudioProvider(p.baseUrl || undefined)
  else if (p.type === 'openrouter') adapter = new OpenRouterProvider(p.apiKey || '')

  if (adapter) {
    const isOk = await adapter.checkStatus()
    return c.json({ status: isOk ? 'ok' : 'error' })
  }
  return c.json({ status: 'error' })
})

// Session routes
app.get('/sessions', async (c) => {
  const result = await db.select().from(sessions).orderBy(desc(sessions.updatedAt))
  return c.json(result)
})

app.get('/sessions/:id', async (c) => {
  const id = c.req.param('id')
  const [result] = await db.select().from(sessions).where(eq(sessions.id, id))
  if (!result) return c.json({ error: 'Session not found' }, 404)
  return c.json(result)
})

app.post('/sessions', async (c) => {
  const { title } = await c.req.json()
  const id = uuidv4()
  const now = new Date()
  await db.insert(sessions).values({
    id,
    title: title || 'New Session',
    status: 'refining',
    createdAt: now,
    updatedAt: now
  })
  return c.json({ id, title, status: 'refining' })
})

app.get('/sessions/:id/refine', async (c) => {
  const id = c.req.param('id')
  
  c.header('Content-Type', 'text/event-stream')
  c.header('Cache-Control', 'no-cache')
  c.header('Connection', 'keep-alive')

  return stream(c, async (stream) => {
    for await (const chunk of RefinementService.runRefinement(id)) {
      await stream.write(`data: ${JSON.stringify(chunk)}\n\n`)
    }
  })
})

app.post('/sessions/:id/refine/confirm', async (c) => {
  const id = c.req.param('id')
  const { refinedPrompt } = await c.req.json()
  const result = await RefinementService.confirmRefinement(id, refinedPrompt)
  return c.json(result)
})

app.post('/sessions/:id/refine/skip', async (c) => {
  const id = c.req.param('id')
  const result = await RefinementService.skipRefinement(id)
  return c.json(result)
})

app.put('/sessions/:id', async (c) => {
  const id = c.req.param('id')
  const { title } = await c.req.json()
  await db.update(sessions).set({ title, updatedAt: new Date() }).where(eq(sessions.id, id))
  return c.json({ success: true })
})

app.delete('/sessions/:id', async (c) => {
  const id = c.req.param('id')
  await db.delete(sessions).where(eq(sessions.id, id))
  return c.json({ success: true })
})

// Document routes
app.get('/api/sessions/:id/documents', async (c) => {
  const sessionId = c.req.param('id')
  const result = await db.select().from(documents).where(eq(documents.sessionId, sessionId))
  return c.json(result)
})

app.post('/api/sessions/:id/documents', async (c) => {
  const sessionId = c.req.param('id')
  const { name, content, type } = await c.req.json()
  const id = uuidv4()
  await db.insert(documents).values({
    id,
    sessionId,
    name,
    content,
    type,
    createdAt: new Date()
  })
  return c.json({ id })
})

app.delete('/api/documents/:id', async (c) => {
  const id = c.req.param('id')
  await db.delete(documents).where(eq(documents.id, id))
  return c.json({ success: true })
})

app.post('/sessions/:id/fork', async (c) => {
  const originalId = c.req.param('id')
  const { messageId } = await c.req.json()

  const [parent] = await db.select().from(sessions).where(eq(sessions.id, originalId))
  if (!parent) return c.json({ error: 'Parent session not found' }, 404)

  const newSessionId = uuidv4()
  const now = new Date()

  // 1. Create new session
  await db.insert(sessions).values({
    id: newSessionId,
    title: `Fork: ${parent.title}`,
    parentId: originalId,
    createdAt: now,
    updatedAt: now
  })

  // 2. Clone history
  const history = await db.select().from(messages)
    .where(eq(messages.sessionId, originalId))
    .orderBy(asc(messages.timestamp))

  const forkPointIndex = history.findIndex(m => m.id === messageId)
  if (forkPointIndex === -1 && messageId) {
    return c.json({ error: 'Fork point message not found' }, 404)
  }

  const messagesToClone = messageId ? history.slice(0, forkPointIndex + 1) : history

  for (const m of messagesToClone) {
    await db.insert(messages).values({
      ...m,
      id: uuidv4(),
      sessionId: newSessionId
    })
  }

  return c.json({ id: newSessionId })
})

// System routes
app.post('/system/reset', async (c) => {
  await db.delete(messages)
  await db.delete(sessions)
  await db.delete(personaTable)
  await db.delete(providers)
  return c.json({ success: true })
})

app.get('/sessions/:id/messages', async (c) => {
  const id = c.req.param('id')
  const result = await db.select({
    id: messages.id,
    role: messages.role,
    content: messages.content,
    personaId: messages.personaId,
    timestamp: messages.timestamp,
    metadata: messages.metadata,
    personaName: personaTable.name,
    personaIcon: personaTable.icon_id,
    personaColor: personaTable.color_accent
  })
  .from(messages)
  .leftJoin(personaTable, eq(messages.personaId, personaTable.id))
  .where(eq(messages.sessionId, id))
  .orderBy(desc(messages.timestamp))
  
  return c.json(result)
})

app.post('/sessions/:id/messages', async (c) => {
  const sessionId = c.req.param('id')
  const { content, role } = await c.req.json()
  const id = uuidv4()
  await db.insert(messages).values({
    id,
    sessionId,
    role: role || 'user',
    content,
    timestamp: new Date()
  })
  return c.json({ id })
})

app.put('/messages/:id', async (c) => {
  const id = c.req.param('id')
  const { content } = await c.req.json()
  await db.update(messages).set({ content }).where(eq(messages.id, id))
  return c.json({ success: true })
})

app.delete('/messages/:id', async (c) => {
  const id = c.req.param('id')
  await db.delete(messages).where(eq(messages.id, id))
  return c.json({ success: true })
})

// Persona routes
app.get('/personas', async (c) => {
  const result = await db.select().from(personaTable)
  return c.json(result)
})

app.post('/personas', async (c) => {
  const data = await c.req.json()
  const id = uuidv4()
  await db.insert(personaTable).values({
    id,
    ...data
  })
  return c.json({ id })
})

app.put('/personas/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  await db.update(personaTable).set(data).where(eq(personaTable.id, id))
  return c.json({ success: true })
})

app.delete('/personas/:id', async (c) => {
  const id = c.req.param('id')
  await db.delete(personaTable).where(eq(personaTable.id, id))
  return c.json({ success: true })
})

app.post('/personas/test', async (c) => {
  const { persona, prompt } = await c.req.json()
  
  if (!persona.providerId || !persona.modelId) {
    return c.json({ error: 'Provider and Model are required for testing' }, 400)
  }

  const adapter = await getProviderAdapter(persona.providerId)
  if (!adapter) return c.json({ error: 'Adapter not found' }, 500)

  const constrainedPrompt = applyChattinessConstraint(persona, persona.systemPrompt)
  const messages: Message[] = [
    { role: 'system', content: constrainedPrompt },
    { role: 'user', content: prompt }
  ]

  const options = {
    temperature: persona.temperature,
    top_p: persona.top_p,
    max_tokens: persona.max_tokens,
    presence_penalty: persona.presence_penalty,
    frequency_penalty: persona.frequency_penalty
  }

  c.header('Content-Type', 'text/event-stream')
  c.header('Cache-Control', 'no-cache')
  c.header('Connection', 'keep-alive')

  return stream(c, async (stream) => {
    try {
      for await (const chunk of adapter.generate(persona.modelId, messages, [], options)) {
        await stream.write(`data: ${JSON.stringify({ text: chunk.text || '' })}\n\n`)
      }
    } catch (err) {
      await stream.write(`data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`)
    }
  })
})

app.post('/personas/seed', async (c) => {
  const { providerId, modelId } = await c.req.json()
  await seedThinkingHats(providerId, modelId)
  return c.json({ success: true })
})

app.get('/sessions/:id/export/json', async (c) => {
  const id = c.req.param('id')
  const [session] = await db.select().from(sessions).where(eq(sessions.id, id))
  const history = await db.select().from(messages)
    .where(eq(messages.sessionId, id))
    .orderBy(asc(messages.timestamp))

  const exportData = {
    session,
    messages: history
  }

  c.header('Content-Type', 'application/json')
  c.header('Content-Disposition', `attachment; filename="session-${id}.json"`)
  return c.json(exportData)
})

app.get('/sessions/:id/export/markdown', async (c) => {
  const id = c.req.param('id')
  const [session] = await db.select().from(sessions).where(eq(sessions.id, id))
  const history = await db.select().from(messages)
    .where(eq(messages.sessionId, id))
    .orderBy(asc(messages.timestamp))

  if (!session) return c.json({ error: 'Session not found' }, 404)

  const allPersonas = await db.select().from(personaTable)
  const personaMap = new Map(allPersonas.map(p => [p.id, p.name]))

  let md = `# Session: ${session.title}\n`
  md += `ID: ${session.id}\n`
  md += `Date: ${session.createdAt.toLocaleString()}\n\n`

  if (session.summary) {
    md += `## Summary\n${session.summary}\n\n`
  }

  md += `--- \n\n`

  for (const m of history) {
    const name = m.role === 'user' ? 'Proponent' : (m.personaId ? personaMap.get(m.personaId) : 'Assistant')
    const time = m.timestamp.toLocaleString()

    md += `### ${name} (${time})\n`
    md += `${m.content}\n\n`
  }

  c.header('Content-Type', 'text/markdown')
  c.header('Content-Disposition', `attachment; filename="session-${id}.md"`)
  return c.text(md)
})

app.post('/sessions/:id/report', async (c) => {

  const sessionId = c.req.param('id')
  const history = await db.select().from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.timestamp))
  
  if (history.length === 0) return c.json({ error: 'No messages to summarize' }, 400)

  // Use the Blue Hat (or first available persona) to synthesize
  const [blueHat] = await db.select().from(personaTable).where(eq(personaTable.name, 'Blue Hat')).limit(1)
  const [fallbackPersona] = await db.select().from(personaTable).limit(1)
  const persona = blueHat || fallbackPersona

  if (!persona || !persona.providerId) return c.json({ error: 'No synthesis persona available' }, 500)

  const adapter = await getProviderAdapter(persona.providerId)
  if (!adapter) return c.json({ error: 'Adapter not found' }, 500)

  const prompt = `Please provide a comprehensive Final Audit Report of this round-table discussion. 
  Use Markdown format. Include the following sections: 
  - Executive Summary
  - Key Facts (White Hat Perspective)
  - Key Risks & Cautions (Black Hat Perspective)
  - Benefits & Opportunities (Yellow Hat Perspective)
  - Creative Alternatives & Growth (Green Hat Perspective)
  - Final Recommendation (Blue Hat Perspective)
  
  Use a professional, objective tone. Ensure the output is well-structured and uses appropriate Markdown headers.`
  
  const msgContext: Message[] = [
    { role: 'system', content: persona.systemPrompt },
    ...history.map(m => ({ role: m.role as any, content: m.content })),
    { role: 'user', content: prompt }
  ]

  if (!persona.modelId) return c.json({ error: 'No model assigned to synthesis persona' }, 500)

  let report = ''
  try {
    for await (const chunk of adapter.generate(persona.modelId, msgContext)) {
      if (typeof chunk === 'string') {
        report += chunk
      } else if (chunk.text) {
        report += chunk.text
      }
    }

    // Save report to database
    const reportId = uuidv4()
    await db.insert(messages).values({
      id: reportId,
      sessionId,
      personaId: persona.id,
      role: 'assistant',
      content: report,
      timestamp: new Date()
    })

    return c.json({ report, id: reportId })
  } catch (err) {
    console.error('Report generation failed:', err)
    return c.json({ error: 'Report generation failed' }, 500)
  }
})

// Evaluation route (SSE)
app.get('/sessions/:id/evaluate', async (c) => {
  const sessionId = c.req.param('id')
  const personaIds = c.req.query('personaIds')?.split(',') || []
  const mode = (c.req.query('mode') as any) || 'sequential'
  const maxTurns = parseInt(c.req.query('maxTurns') || '10')

  if (personaIds.length === 0) {
    return c.json({ error: 'No personas selected' }, 400)
  }

  c.header('Content-Type', 'text/event-stream')
  c.header('Cache-Control', 'no-cache')
  c.header('Connection', 'keep-alive')

  return stream(c, async (stream) => {
    let aborted = false;
    c.req.raw.signal.addEventListener('abort', () => {
      aborted = true;
    });

    for await (const step of runRoundTable(sessionId, personaIds, mode, maxTurns)) {
      if (aborted) break;
      await stream.write(`data: ${JSON.stringify(step)}\n\n`)
    }
  })
})

const port = 3001
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
