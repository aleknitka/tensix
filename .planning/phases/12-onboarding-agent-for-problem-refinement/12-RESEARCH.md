# Phase 12: Onboarding Agent for Problem Refinement - Research

**Researched:** 2026-03-30
**Domain:** LLM Agent Orchestration & Guided Prompt Engineering
**Confidence:** HIGH

## Summary

Phase 12 focuses on improving the quality of round-table evaluations by ensuring the initial problem statement or idea is well-defined. An "Onboarding Agent" (Refiner) will interact with the user in a Socratic-style dialogue to clarify goals, constraints, and context before the "Six Thinking Hats" or other expert personas begin their analysis.

**Primary recommendation:** Implement a dedicated "Refinement Phase" for sessions using a `status` field in the `sessions` table. Use a specialized "Refiner" persona to facilitate the dialogue and store the final output in a `refinedPrompt` field, which then serves as the primary context for the round-table.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Hono | 4.12.9 | API Framework | Existing project core; supports SSE for streaming agent responses. |
| Drizzle ORM | 0.45.2 | Persistence | Existing project core; used for schema migrations and data access. |
| React / Next.js | 16.2.1 | UI Framework | Existing project core. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | 1.7.0 | UI Icons | For "Refiner" agent branding and phase indicators. |
| UUID | 4.x | ID Generation | For new messages and session tracking. |

**Installation:**
```bash
# No new packages required; using existing stack.
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── server/
│   ├── services/
│   │   └── refinement-service.ts  # Logic for the refinement loop
│   └── db/
│       └── seeds/
│           └── personas.ts        # Seed for the Refiner persona
└── components/
    └── RefinementIndicator.tsx    # Visual feedback for the refinement phase
```

### Pattern: State-Driven Phase Management
The session lifecycle will transition through explicit states:
1. **`refining`**: User interacts with the Refiner agent. Round-table controls are disabled/hidden.
2. **`active`**: Refinement is complete. The `refinedPrompt` is locked. Round-table orchestration begins.
3. **`completed`**: Round-table has concluded or consensus was reached.

### Anti-Patterns to Avoid
- **Context Pollution:** Passing the entire refinement chat history to the Six Hats personas can consume valuable context window and distract them with meta-discussion. 
- **Solution:** Only pass the final `refinedPrompt` and a brief summary of the refinement goals to the round-table experts.
- **Mandatory Friction:** Forcing expert users through a long refinement loop every time.
- **Solution:** Provide a "Skip Refinement" or "Use As Is" button.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming Responses | Custom SSE logic | Hono `stream` helper | Robust, handles backpressure and aborts. |
| Persona Orchestration | New loop logic | `BaseProvider.generate` | Consistency with existing expert personas. |
| Markdown Rendering | Custom parser | `react-markdown` | Already integrated in Phase 8. |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `sessions` table | Add `status` (text) and `refinedPrompt` (text) columns. |
| Live service config | None — verified by architecture audit. | N/A |
| OS-registered state | None — verified by architecture audit. | N/A |
| Secrets/env vars | None — verified by architecture audit. | N/A |
| Build artifacts | None — verified by architecture audit. | N/A |

## Common Pitfalls

### Pitfall 1: Endless Socratic Loop
**What goes wrong:** The Refiner agent keeps asking questions and never offers to start the session.
**How to avoid:** Implement a system prompt that encourages the agent to summarize and offer a "Final Version" after 2-3 turns, and ensure the UI provides a manual override ("Start Audit Now").

### Pitfall 2: Missing Model Configuration
**What goes wrong:** New users create a session but haven't configured a model for the Refiner.
**How to avoid:** Default the Refiner to use the same model as the "Blue Hat" or the first available enabled model from the providers list.

### Pitfall 3: Loss of Original Intent
**What goes wrong:** The refined prompt drifts too far from the user's original idea.
**How to avoid:** Always allow the user to edit the `refinedPrompt` manually before confirming.

## Code Examples

### Refiner Persona Definition
```typescript
{
  name: 'Refiner',
  role: 'Facilitator',
  systemPrompt: `You are the Tensix Onboarding Agent. 
  Your goal is to help the user refine their problem statement before it is audited by experts.
  1. Ask clarifying questions about goals, target audience, and constraints.
  2. Be concise and Socratic.
  3. Once the idea is clear, provide a 'REFINED PROMPT' block summarizing the idea.
  4. Ask the user for confirmation or further edits.`,
  icon_id: 'bot',
  color_accent: 'indigo'
}
```

### Transition Logic (Pseudo-code)
```typescript
async function confirmRefinement(sessionId: string, finalPrompt: string) {
  await db.update(sessions)
    .set({ 
      status: 'active', 
      refinedPrompt: finalPrompt,
      updatedAt: new Date() 
    })
    .where(eq(sessions.id, sessionId));
    
  // Trigger first round of SEQ using refinedPrompt
}
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| SQLite | Persistence | ✓ | 3.x | — |
| Hono | API | ✓ | 4.12.9 | — |
| Ollama/Cloud LLM | Agent Logic | ✓ | — | Manual prompt entry |

**Missing dependencies with no fallback:**
- None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-12.1 | Refiner Persona Seeded | Unit | `npx vitest tests/roles.test.ts` | ✅ |
| REQ-12.2 | Session Status Transition | Integration | `npx vitest tests/refinement.test.ts` | ❌ Wave 0 |
| REQ-12.3 | Refined Prompt Injection | Integration | `npx vitest tests/orchestrator.test.ts` | ✅ |

### Wave 0 Gaps
- [ ] `tests/refinement.test.ts` — New test suite for the refinement state machine.
- [ ] `src/server/db/seeds/onboarding.ts` — Seed for the Refiner persona.

## Sources

### Primary (HIGH confidence)
- `src/server/db/schema.ts` - Existing session and message structure.
- `src/server/orchestrator.ts` - Existing SEQ implementation.
- `src/app/sessions/page.tsx` - Existing session UI flow.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing, proven libraries.
- Architecture: HIGH - Phase management via DB state is a standard pattern.
- Pitfalls: MEDIUM - Agent behavior can be unpredictable; needs careful prompt engineering.

**Research date:** 2026-03-30
**Valid until:** 2026-04-30
