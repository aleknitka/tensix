import { db } from '../db/index';
import { sessions, personas, messages, documents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { getProviderAdapter } from '../orchestrator';
import { Message } from '../providers/types';

export type RefinementStatus = 'refining' | 'active' | 'completed';

export class RefinementService {
  /**
   * Transition a session from 'refining' to 'active' and store the refined prompt.
   */
  static async confirmRefinement(sessionId: string, refinedPrompt: string) {
    await db.update(sessions)
      .set({ 
        status: 'active',
        refinedPrompt,
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId));
    
    return { success: true, status: 'active' };
  }

  /**
   * Skip the refinement process and mark the session as 'active'.
   * The original prompt will be used as-is.
   */
  static async skipRefinement(sessionId: string) {
    await db.update(sessions)
      .set({ 
        status: 'active',
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId));
    
    return { success: true, status: 'active' };
  }

  /**
   * Implement runRefinement generator for Phase 12 Wave 2.
   * This handles the actual LLM-driven Socratic dialogue.
   */
  static async *runRefinement(sessionId: string) {
    // 1. Get Refiner persona
    const [refiner] = await db.select().from(personas).where(eq(personas.name, 'Refiner')).limit(1);
    if (!refiner || !refiner.providerId || !refiner.modelId) {
      yield { type: 'error', message: 'Refiner persona not configured correctly' };
      return;
    }

    const adapter = await getProviderAdapter(refiner.providerId);
    if (!adapter) {
      yield { type: 'error', message: 'Provider adapter not found' };
      return;
    }

    // 2. Get session history and documents
    const history = await db.select().from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.timestamp));

    const sessionDocs = await db.select().from(documents).where(eq(documents.sessionId, sessionId));
    const docContext = sessionDocs.length > 0 
      ? `ATTACHED DOCUMENTS:\n${sessionDocs.map(d => `--- ${d.name} ---\n${d.content}`).join('\n\n')}\n\n`
      : '';

    const msgContext: Message[] = [
      { role: 'system', content: refiner.systemPrompt + (docContext ? `\n\n${docContext}` : '') },
      ...history.map(m => ({ role: m.role as any, content: m.content }))
    ];

    // 3. Generate streaming response
    try {
      let fullText = '';
      for await (const chunk of adapter.generate(refiner.modelId, msgContext)) {
        if (chunk.text) {
          fullText += chunk.text;
          yield { type: 'text', text: chunk.text };

          // Extract refined prompt if tag is found
          const match = fullText.match(/<refined_prompt>([\s\S]*?)<\/refined_prompt>/i);
          if (match && match[1]) {
            yield { type: 'refined_prompt', prompt: match[1].trim() };
          }
        }
      }
    } catch (err) {
      yield { type: 'error', message: `Refinement failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
}
