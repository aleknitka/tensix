import { db } from './db/index';
import { providers, personas, messages, sessions } from './db/schema';
import { eq, asc } from 'drizzle-orm';
import { OllamaProvider } from './providers/ollama';
import { LMStudioProvider } from './providers/lmstudio';
import { OpenRouterProvider } from './providers/openrouter';
import { BaseProvider, Message } from './providers/types';
import { v4 as uuidv4 } from 'uuid';

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
      // If we don't have a modelId, we might be in trouble, but let's assume we can find one or it's provided in some way.
      // For now, let's just try to find ANY persona's modelId if targetModelId is empty.
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
      summary += chunk;
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
      summary += chunk;
    }
    await db.update(sessions).set({ summary }).where(eq(sessions.id, sessionId));
    return summary;
  } catch (err) {
    console.error('Summarization failed:', err);
    return null;
  }
}

export async function* runRoundTable(sessionId: string, personaIds: string[]): AsyncIterable<OrchestrationStep> {
  // 1. Get session details and history
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  const history = await db.select().from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.timestamp));

  let baseMessages: Message[] = [];
  
  const rawMessages: Message[] = history.map(m => ({
    role: m.role as any,
    content: m.content
  }));

  // Task 2: Automatic Summarization Trigger
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

  // 2. Run each persona sequentially
  for (const personaId of personaIds) {
    const [persona] = await db.select().from(personas).where(eq(personas.id, personaId));
    if (!persona || !persona.providerId) continue;

    const adapter = await getProviderAdapter(persona.providerId);
    if (!adapter) continue;

    const personaMessages: Message[] = [
      { role: 'system', content: persona.systemPrompt },
      ...baseMessages
    ];

    let fullResponse = '';
    
    // Stream generation
    try {
      for await (const chunk of adapter.generate(persona.modelId, personaMessages)) {
        fullResponse += chunk;
        yield {
          personaId,
          content: chunk,
          isDone: false
        };
      }

      // Save message to DB
      const messageId = uuidv4();
      await db.insert(messages).values({
        id: messageId,
        sessionId,
        personaId,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      });

      // Update baseMessages for next persona
      baseMessages.push({ role: 'assistant', content: fullResponse });

      yield {
        personaId,
        content: '',
        isDone: true
      };

      // Periodic summarization (every 8 messages)
      const currentHistory = await db.select().from(messages).where(eq(messages.sessionId, sessionId));
      if (currentHistory.length % 8 === 0) {
        await summarizeSession(sessionId, adapter, persona.modelId);
      }

    } catch (error) {
      console.error(`Error during generation for persona ${persona.name}:`, error);
      yield {
        personaId,
        content: ` [Error: ${error instanceof Error ? error.message : String(error)}]`,
        isDone: true
      };
    } finally {
      // Always try to unload model to free VRAM
      await adapter.unload(persona.modelId);
    }
  }

  // Final completion signal
  yield {
    personaId: 'SYSTEM',
    content: '',
    isDone: true
  };
}
