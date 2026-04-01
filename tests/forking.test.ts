import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/server/db/index';
import { sessions, messages } from '../src/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

describe('Session Forking Logic', () => {
  let parentId: string;
  let msg1Id: string;
  let msg2Id: string;

  beforeEach(async () => {
    // Cleanup
    await db.delete(messages);
    await db.delete(sessions);

    parentId = uuidv4();
    msg1Id = uuidv4();
    msg2Id = uuidv4();

    await db.insert(sessions).values({
      id: parentId,
      title: 'Parent Session',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(messages).values([
      {
        id: msg1Id,
        sessionId: parentId,
        role: 'user',
        content: 'First message',
        timestamp: new Date(Date.now() - 10000),
      },
      {
        id: msg2Id,
        sessionId: parentId,
        role: 'assistant',
        content: 'Second message',
        timestamp: new Date(Date.now() - 5000),
      },
    ]);
  });

  it('should clone session and history up to a point', async () => {
    // Simulating the logic from index.ts
    const originalId = parentId;
    const messageId = msg1Id;

    const [parent] = await db.select().from(sessions).where(eq(sessions.id, originalId));
    const newSessionId = uuidv4();
    
    await db.insert(sessions).values({
      ...parent,
      id: newSessionId,
      parentId: originalId,
      title: `Fork: ${parent?.title}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const history = await db.select().from(messages)
      .where(eq(messages.sessionId, originalId))
      .orderBy(asc(messages.timestamp));

    const forkPointIndex = history.findIndex(m => m.id === messageId);
    const messagesToClone = history.slice(0, forkPointIndex + 1);

    for (const m of messagesToClone) {
      await db.insert(messages).values({
        ...m,
        id: uuidv4(),
        sessionId: newSessionId,
      });
    }

    const forkMessages = await db.select().from(messages).where(eq(messages.sessionId, newSessionId));
    expect(forkMessages.length).toBe(1);
    expect(forkMessages[0].content).toBe('First message');
    expect(forkMessages[0].id).not.toBe(msg1Id);
  });
});
