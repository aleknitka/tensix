# Phase 7 Validation: Advanced Orchestration & Branching

This document maps the success criteria from `07-CONTEXT.md` to specific automated tests and human verification steps.

## Success Criteria Mapping

| Success Criterion | Verification Method | Type | Tool/Command |
|-------------------|---------------------|------|--------------|
| **Session Forking**: User can fork from any message and continue independently. | `tests/forking.test.ts` | Automated | `npx vitest tests/forking.test.ts` |
| **Blue Hat Conductor**: Blue Hat successfully suggests the next logical speaker. | `tests/orchestrator.test.ts` | Automated | `npx vitest tests/orchestrator.test.ts` |
| **Consensus Termination**: Loop terminates on agreement or `max_turns`. | `tests/orchestrator.test.ts` | Automated | `npx vitest tests/orchestrator.test.ts` |
| **Visual Tree**: Navigator allows clear movement between conversation paths. | Visual UI Check | Human | Manual Inspection |

---

## 1. Automated Testing (Regression & Logic)

### 1.1 Session Forking (Backend)
**File:** `tests/forking.test.ts`
- **Test Case 1: Deep Clone Logic**
  - **Goal:** Verify `forkSession` creates a new session and clones messages up to the fork point.
  - **Expectation:** New session ID != old session ID; `parentId` is set correctly; message count in fork matches parent count at fork point; content/timestamps preserved.
- **Test Case 2: ID Collision Prevention**
  - **Goal:** Verify cloned messages receive fresh UUIDs.
  - **Expectation:** Message IDs in the fork session do not exist in the parent session.

### 1.2 Orchestrator Conductor Mode
**File:** `tests/orchestrator.test.ts`
- **Test Case 3: Next Speaker Suggestion**
  - **Goal:** Verify Blue Hat output is correctly parsed into a `personaId`.
  - **Expectation:** Orchestrator yields a `SUGGESTION` event with the correct `personaId` when in Conductor mode.
- **Test Case 4: Consensus Detection**
  - **Goal:** Verify `[CONSENSUS_REACHED]` terminates the loop.
  - **Expectation:** Orchestrator stops yielding content and emits a completion signal upon detecting the token.
- **Test Case 5: Safety Valve (Max Turns)**
  - **Goal:** Verify `maxTurns` terminates a potentially infinite loop.
  - **Expectation:** Orchestrator stops after exactly `N` turns even if no consensus is reached.

---

## 2. Human Verification (UI/UX)

### 2.1 Branching User Flow
1. **Trigger Fork**:
   - Open an existing session with at least 3 messages.
   - Hover over the 2nd message and click the **GitFork** icon.
   - **Verification**: UI should navigate to a new session URL. The chat history should show exactly 2 messages.
2. **Independent Progress**:
   - In the newly forked session, send a message.
   - **Verification**: Message is added to the fork.
   - Switch back to the parent session via the sidebar.
   - **Verification**: Parent session remains unchanged (no new message from fork).

### 2.2 Visual Tree Navigation
1. **Tree Rendering**:
   - Create 2-3 forks from different points in a session.
   - Open the **Branch Navigator** in the sidebar.
   - **Verification**: A tree/nested list should visualize the relationship between the root and forks.
2. **Navigation**:
   - Click a different node in the tree.
   - **Verification**: UI switches to the selected session immediately.

### 2.3 HITL Orchestration
1. **Turn Approval**:
   - Set "Orchestration Mode" to **Conductor HITL**.
   - Trigger a Round Table execution.
   - **Verification**: Blue Hat should process, then the UI should show a "Suggested Next Speaker" prompt.
2. **Resume/Override**:
   - Click **Approve**.
   - **Verification**: Orchestrator continues with the suggested persona.
   - Repeat, but click **Change** and select a different persona.
   - **Verification**: Orchestrator executes the user-selected persona instead.

---

## 3. Database Integrity Check
Run the following SQL commands to verify schema health:
```sql
-- Check for parent_id column
PRAGMA table_info(sessions);

-- Verify lineage of a specific fork
SELECT id, parent_id, title FROM sessions WHERE parent_id IS NOT NULL LIMIT 5;
```
