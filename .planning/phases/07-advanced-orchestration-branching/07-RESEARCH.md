# Phase 7: Advanced Orchestration & Branching - Research

**Researched:** 2024-05-24
**Domain:** Multi-agent orchestration, session forking, tree visualization.
**Confidence:** HIGH

## Summary

This phase transitions Tensix from a static sequential queue to an intelligent, adaptive round-table system with branching conversation support. The core challenges involve implementing a "Conductor" (Blue Hat) that can intelligently select the next expert or identify consensus, and building a robust session forking mechanism that allows users to explore alternative conversation paths without losing progress.

**Primary recommendation:** Use a custom SVG-based Tree component for visual branching to maintain the existing minimalist aesthetic, and implement the "Blue Hat Conductor" using a strict output formatting prompt (personaId or `[CONSENSUS_REACHED]`) to ensure reliability.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Intelligent Orchestration (Turn Suggestion)**: Blue Hat acts as the "Conductor."
- **Modes**: Full Auto (auto-execute) and HITL (pause for user approval).
- **Consensus Mode**: Blue Hat evaluates agreement and emits a `[CONSENSUS_REACHED]` token to stop the loop.
- **Safety Valve**: A user-defined `max_turns` limit will terminate the loop.
- **Session Branching (Forking)**: "Total Clone" strategy. Add `parentId` to `sessions` table.
- **UI/UX**: Fork trigger on every message, visual tree navigator, and Auto-Advance toggle.

### the agent's Discretion
- **Tree Visualization**: Recommended libraries (e.g., react-flow or simpler SVG-based custom component).
- **Forking Logic**: Handling ID collisions and cloning sequence.
- **HITL Management**: How to pause/resume the SSE stream.

### Deferred Ideas (OUT OF SCOPE)
- None mentioned.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-01 | Session Forking (Backend) | Logic for cloning messages and handling IDs identified. |
| REQ-02 | Blue Hat Conductor (Prompt) | Prompt engineering pattern for persona selection and consensus. |
| REQ-03 | HITL Orchestration (State) | SSE-based pause/resume strategy documented. |
| REQ-04 | Tree Visualization (UI) | Evaluation of React Flow vs. Custom SVG. |
| REQ-05 | SQLite Schema Update | Drizzle-based `parentId` implementation. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `drizzle-kit` | 0.31.10 | Schema migrations | Handles SQLite schema updates for `parentId`. |
| `uuid` | 13.0.0 | ID Generation | Reliable UUID v4 for avoiding collisions during cloning. |
| `react-flow` | 11.x | Tree Visualization | (Optional) Standard for interactive graphs if custom SVG is insufficient. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | 1.7.0 | Icons | Fork and Tree navigator icons. |
| `dagre` | 0.8.5 | Auto-layout | If using `react-flow`, needed for automatic tree organization. |

**Installation:**
```bash
# If using react-flow
npm install @xyflow/react dagre
```

## Architecture Patterns

### Session Forking Logic (Backend)
To fork a session from message `M_X` in session `S_PARENT`:
1.  **Clone Session**: Create new record `S_FORK` with `parentId = S_PARENT.id`.
2.  **Fetch History**: Get all messages from `S_PARENT` where `timestamp <= M_X.timestamp`.
3.  **Clone Messages**: For each message:
    -   Generate a NEW `uuid`.
    -   Set `sessionId = S_FORK.id`.
    -   Preserve `personaId`, `role`, `content`.
    -   Preserve original `timestamp` (essential for maintaining logical order in the fork).

### Conductor Prompt Pattern
Use a "Selector" prompt for the Blue Hat:
```markdown
You are the Blue Hat Conductor.
Goal: Select the next most relevant persona OR identify consensus.

Available Personas:
[List of personaId: Name - Description]

Conversation Context:
[Latest messages]

Output Rules:
1. If consensus reached: Output [CONSENSUS_REACHED]
2. Else: Output ONLY the personaId of the next speaker.
```

### HITL Turn Management (SSE)
Current `runRoundTable` is a generator.
- **Pause**: When `mode === 'hitl'`, the server yields a `SUGGESTION` event and then stops the stream.
- **Resume**: User clicks "Approve" (or selects a different persona). The client sends a new `evaluate` request with `personaIds=[selectedId]` and `autoResume=true`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Graph Layout | Manual coordinate math | `dagre` or `d3-hierarchy` | Managing tree branching coordinates (X/Y) is complex. |
| UUID Generation | Simple random strings | `uuid` v4 | Prevents collisions in deep-cloned message sets. |

## Common Pitfalls

### Pitfall 1: Message Ordering in Forks
**What goes wrong:** If timestamps are not handled correctly, the cloned messages might interleave with new messages in the UI.
**How to avoid:** Always use the original timestamps for cloned messages and ensure the UI sorts strictly by `timestamp`.

### Pitfall 2: Infinite Conductor Loops
**What goes wrong:** The Blue Hat keeps picking the same persona or fails to reach consensus.
**How to avoid:** Implement a `max_turns` limit (e.g., 5-10 turns) in the orchestrator logic regardless of the Blue Hat's output.

### Pitfall 3: SSE Connection Timeout
**What goes wrong:** Long-running turns (especially with tool calls) can cause browser timeouts.
**How to avoid:** Send "keep-alive" comments during processing if no content is being yielded.

## Code Examples

### Drizzle Schema Update
```typescript
// src/server/db/schema.ts
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  parentId: text('parent_id').references((): any => sessions.id),
  // ... other fields
});
```

### Cloning Algorithm (Draft)
```typescript
async function forkSession(originalId: string, messageId: string) {
  const [parent] = await db.select().from(sessions).where(eq(sessions.id, originalId));
  const newSessionId = uuidv4();
  
  await db.insert(sessions).values({
    ...parent,
    id: newSessionId,
    parentId: originalId,
    title: `Fork: ${parent.title}`
  });

  const history = await db.select().from(messages).where(eq(messages.sessionId, originalId)).orderBy(asc(messages.timestamp));
  const forkPoint = history.findIndex(m => m.id === messageId);
  const clones = history.slice(0, forkPoint + 1);

  for (const m of clones) {
    await db.insert(messages).values({
      ...m,
      id: uuidv4(),
      sessionId: newSessionId
    });
  }
  return newSessionId;
}
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `drizzle-kit` | DB Migrations | ✓ | 0.31.10 | — |
| `uuid` | Forking | ✓ | 13.0.0 | — |
| `react-flow` | Tree Visuals | ✗ | — | Custom SVG or `npm install` |

**Missing dependencies with no fallback:**
- None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-01 | Fork logic clones up to point | Unit | `npm test tests/forking.test.ts` | ❌ Wave 0 |
| REQ-02 | Blue Hat picks personaId | Integration | `npm test tests/orchestrator.test.ts` | ❌ Wave 0 |
| REQ-05 | DB Schema includes parentId | Unit | `npx drizzle-kit check` | ✅ |

### Wave 0 Gaps
- [ ] `tests/forking.test.ts` — covers REQ-01 (deep clone logic)
- [ ] `tests/orchestrator.test.ts` — expansion for Conductor mode

## Sources

### Primary (HIGH confidence)
- `drizzle-orm` docs for self-referencing tables.
- `vitest` docs for async generator testing.
- `react-flow` vs custom SVG research (web).

### Secondary (MEDIUM confidence)
- Multi-agent conductor prompt patterns (web search).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: MEDIUM

**Research date:** 2024-05-24
**Valid until:** 2024-06-24
