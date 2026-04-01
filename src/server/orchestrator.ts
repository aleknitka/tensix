import { db } from './db/index';
import { providers, personas, messages, sessions, documents } from './db/schema';
import { eq, asc } from 'drizzle-orm';
import { OllamaProvider } from './providers/ollama';
import { LMStudioProvider } from './providers/lmstudio';
import { OpenRouterProvider } from './providers/openrouter';
import { BaseProvider, Message, ToolCall } from './providers/types';
import { v4 as uuidv4 } from 'uuid';
import { toolRegistry } from './tools/registry';
import { initializeTools } from './tools/implementations';

// Ensure tools are registered
initializeTools();

export function applyChattinessConstraint(persona: any, prompt: string): string {
  let suffix = "";
  
  if (persona.chattiness_limit) {
    suffix = `\n\nConstraint: Your response must be under ${persona.chattiness_limit} sentences.`;
  } else if (persona.role_type !== 'researcher' && persona.role_type !== 'summarizer') {
    suffix = "\n\nKeep your response extremely concise (max 3-4 sentences) unless your role is 'researcher' or 'summarizer'.";
  }

  return prompt + suffix;
}

export async function getProviderAdapter(providerId: string): Promise<BaseProvider | null> {
  const [p] = await db.select().from(providers).where(eq(providers.id, providerId));
  if (!p) return null;

  if (p.type === 'ollama') return new OllamaProvider(p.baseUrl || undefined);
  if (p.type === 'lmstudio') return new LMStudioProvider(p.baseUrl || undefined);
  if (p.type === 'openrouter') return new OpenRouterProvider(p.apiKey || '');
  return null;
}

export interface OrchestrationStep {
  personaId: string;
  content: string;
  isDone: boolean;
  type?: 'text' | 'suggestion' | 'system';
  suggestedPersonaId?: string;
}

export async function summarizeMessages(msgs: Message[]): Promise<string> {
  // 1. Identify "Blue Hat" persona or fallback
  const [blueHat] = await db.select().from(personas).where(eq(personas.name, 'Blue Hat')).limit(1);
  
  const systemPrompt = blueHat?.systemPrompt || "You are the Blue Hat. Your job is to summarize the conversation so far, capturing the main ideas and different perspectives. Keep it concise.";
  const providerId = blueHat?.providerId;
  const modelId = blueHat?.modelId;

  let adapter: BaseProvider | null = null;
  let targetModelId = modelId || '';

  if (providerId) {
    adapter = await getProviderAdapter(providerId);
  }

  // Fallback: use first enabled provider if Blue Hat's provider is missing or invalid
  if (!adapter) {
    const [firstProvider] = await db.select().from(providers).where(eq(providers.isEnabled, true)).limit(1);
    if (firstProvider) {
      adapter = await getProviderAdapter(firstProvider.id);
      if (!targetModelId) {
        const [anyPersona] = await db.select().from(personas).limit(1);
        targetModelId = anyPersona?.modelId || 'default';
      }
    }
  }

  if (!adapter) throw new Error("No provider available for summarization");

  const prompt = "Please provide a concise summary of the discussion so far. Keep it under 200 words.";
  const msgContext: Message[] = [
    { role: 'system', content: systemPrompt },
    ...msgs,
    { role: 'user', content: prompt }
  ];

  let summary = '';
  try {
    for await (const chunk of adapter.generate(targetModelId, msgContext)) {
      summary += chunk.text || '';
    }
    return summary.trim();
  } catch (err) {
    console.error('Summarization failed:', err);
    return "Summary unavailable due to an error.";
  }
}

export async function summarizeSession(sessionId: string, adapter: BaseProvider, modelId: string): Promise<string | null> {
  const history = await db.select().from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.timestamp));

  if (history.length < 5) return null;

  const prompt = "Please provide a concise summary of the discussion so far, capturing the main ideas and the different perspectives (hats) shared. Keep it under 200 words.";
  const msgContext: Message[] = history.map(m => ({
    role: m.role as any,
    content: m.content
  }));
  msgContext.push({ role: 'user', content: prompt });

  let summary = '';
  try {
    for await (const chunk of adapter.generate(modelId, msgContext)) {
      summary += chunk.text || '';
    }
    await db.update(sessions).set({ summary }).where(eq(sessions.id, sessionId));
    return summary;
  } catch (err) {
    console.error('Summarization failed:', err);
    return null;
  }
}

export async function* runRoundTable(
  sessionId: string, 
  personaIds: string[],
  mode: 'sequential' | 'auto' | 'hitl' = 'sequential',
  maxTurns: number = 10
): AsyncIterable<OrchestrationStep> {
  // 1. Get session details and history
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  const history = await db.select().from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.timestamp));

  // Fetch session documents for context injection
  const sessionDocs = await db.select().from(documents).where(eq(documents.sessionId, sessionId));
  const docContext = sessionDocs.length > 0 
    ? `ATTACHED DOCUMENTS:\n${sessionDocs.map(d => `--- ${d.name} ---\n${d.content}`).join('\n\n')}\n\n`
    : '';

  let baseMessages: Message[] = [];
  
  const rawMessages: Message[] = history.map(m => ({
    role: m.role as any,
    content: m.content
  }));

  // Inject refined prompt if it exists
  if (session?.refinedPrompt) {
    baseMessages.push({
      role: 'system',
      content: `[REFINED CONTEXT]: ${session.refinedPrompt}`
    });
  }

  // Automatic Summarization Trigger
  const MAX_MESSAGES = 10;
  if (rawMessages.length > MAX_MESSAGES) {
    const summaryText = await summarizeMessages(rawMessages);
    
    // Save summary to database as a system/summarizer message
    const [blueHat] = await db.select().from(personas).where(eq(personas.name, 'Blue Hat')).limit(1);
    const summaryId = uuidv4();
    await db.insert(messages).values({
      id: summaryId,
      sessionId,
      personaId: blueHat?.id || null,
      role: 'system',
      content: `[AUTOMATIC SUMMARY]: ${summaryText}`,
      timestamp: new Date()
    });

    // Use ONLY the summary for the next round
    baseMessages = [{
      role: 'system',
      content: `SUMMARY OF DISCUSSION SO FAR: ${summaryText}`
    }];
  } else {
    // If not summarizing, include session summary if it exists, then raw history
    if (session?.summary) {
      baseMessages.push({ 
        role: 'system', 
        content: `SUMMARY OF DISCUSSION SO FAR: ${session.summary}` 
      });
    }
    baseMessages.push(...rawMessages);
  }

  // Inject document context if present
  if (docContext) {
    baseMessages.unshift({ role: 'system', content: docContext });
  }

  const toolDefinitions = toolRegistry.getToolDefinitions();
  let currentTurn = 0;
  let activePersonaIds = [...personaIds];

  // Identify Conductor (Blue Hat)
  const [blueHat] = await db.select().from(personas).where(eq(personas.name, 'Blue Hat')).limit(1);

  // 2. Loop through turns
  while (currentTurn < maxTurns) {
    let nextPersonaId: string | null = null;

    if (mode === 'sequential') {
      nextPersonaId = activePersonaIds[currentTurn % activePersonaIds.length];
      if (currentTurn >= activePersonaIds.length) break; 
    } else {
      // Conductor Mode
      if (!blueHat || !blueHat.providerId || !blueHat.modelId) {
        nextPersonaId = activePersonaIds[currentTurn % activePersonaIds.length];
      } else {
        const conductorAdapter = await getProviderAdapter(blueHat.providerId);
        if (!conductorAdapter) {
          nextPersonaId = activePersonaIds[currentTurn % activePersonaIds.length];
        } else {
          const availablePersonas = await db.select().from(personas);
          const personaListStr = availablePersonas
            .filter(p => activePersonaIds.includes(p.id))
            .map(p => `- ${p.id}: ${p.name} (${p.role}) - ${p.description || ''}`)
            .join('\n');

          const conductorPrompt = `You are the Blue Hat Conductor. Your goal is to select the next most relevant expert to speak OR identify if consensus has been reached.

Available Experts:
${personaListStr}

Conversation Context:
${baseMessages.slice(-5).map(m => `[${m.role}]: ${m.content.slice(0, 200)}...`).join('\n')}

Output Rules:
1. If you believe enough perspectives have been shared and a conclusion can be drawn: Output ONLY "[CONSENSUS_REACHED]".
2. Otherwise: Output ONLY the personaId of the next expert who should speak.
3. Choose from the provided list of IDs.`;

          let conductorDecision = '';
          for await (const chunk of conductorAdapter.generate(blueHat.modelId, [{ role: 'system', content: conductorPrompt }])) {
            conductorDecision += chunk.text || '';
          }

          if (conductorDecision.includes('[CONSENSUS_REACHED]')) {
            yield { personaId: 'SYSTEM', content: 'Consensus reached. Ending round table.', isDone: true, type: 'system' };
            break;
          }

          nextPersonaId = activePersonaIds.find(id => conductorDecision.includes(id)) || activePersonaIds[0];

          if (mode === 'hitl') {
            yield { 
              personaId: blueHat.id, 
              content: `suggests ${nextPersonaId} speaks next.`, 
              isDone: false, 
              type: 'suggestion',
              suggestedPersonaId: nextPersonaId 
            };
            return; 
          }
        }
      }
    }

    if (!nextPersonaId) break;

    const [persona] = await db.select().from(personas).where(eq(personas.id, nextPersonaId));
    if (!persona || !persona.providerId || !persona.modelId) {
      currentTurn++;
      continue;
    }

    const adapter = await getProviderAdapter(persona.providerId);
    if (!adapter) {
      currentTurn++;
      continue;
    }

    const constrainedSystemPrompt = applyChattinessConstraint(persona, persona.systemPrompt);
    const personaMessages: Message[] = [
      { role: 'system', content: constrainedSystemPrompt },
      ...baseMessages
    ];

    let isPersonaDone = false;
    let fullResponse = '';

    while (!isPersonaDone) {
      let pendingToolCalls: ToolCall[] = [];
      try {
        for await (const chunk of adapter.generate(persona.modelId, personaMessages, toolDefinitions)) {
          if (chunk.toolCalls) pendingToolCalls.push(...chunk.toolCalls);
          if (chunk.text) {
            fullResponse += chunk.text;
            yield { personaId: persona.id, content: chunk.text, isDone: false, type: 'text' };
          }
        }

        if (pendingToolCalls.length > 0) {
          personaMessages.push({ role: 'assistant', content: fullResponse, tool_calls: pendingToolCalls });
          for (const tc of pendingToolCalls) {
            const tool = toolRegistry.getTool(tc.function.name);
            let result = '';
            try {
              if (!tool) throw new Error(`Tool ${tc.function.name} not found`);
              const args = JSON.parse(tc.function.arguments);
              yield { personaId: persona.id, content: ` [Using ${tc.function.name}...] `, isDone: false, type: 'system' };
              result = await tool.execute(args);
            } catch (err) {
              result = `Error executing tool: ${err instanceof Error ? err.message : String(err)}`;
            }
            await db.insert(messages).values({
              id: uuidv4(),
              sessionId,
              personaId: persona.id,
              role: 'assistant',
              content: `Used tool: ${tc.function.name}`,
              metadata: JSON.stringify({ toolCall: tc, result }),
              timestamp: new Date()
            });
            personaMessages.push({ role: 'tool', tool_call_id: tc.id, content: result });
          }
        } else {
          isPersonaDone = true;
          await db.insert(messages).values({
            id: uuidv4(),
            sessionId,
            personaId: persona.id,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date()
          });
          baseMessages.push({ role: 'assistant', content: fullResponse });
          yield { personaId: persona.id, content: '', isDone: true, type: 'text' };
        }
      } catch (error) {
        yield { personaId: persona.id, content: ` [Error: ${error instanceof Error ? error.message : String(error)}]`, isDone: true, type: 'system' };
        isPersonaDone = true;
      }
    }

    currentTurn++;
    await adapter.unload(persona.modelId);
  }

  // Final completion signal
  yield {
    personaId: 'SYSTEM',
    content: '',
    isDone: true,
    type: 'system'
  };
}
