# Context: Phase 7 — Advanced Orchestration & Branching

## Goal
Transition Tensix from a static sequential queue to an intelligent, adaptive round-table system with branching conversation support.

## Decisions

### 1. Intelligent Orchestration (Turn Suggestion)
- **Mechanism**: The Blue Hat acts as the "Conductor."
- **Modes**:
  - **Full Auto**: The orchestrator automatically executes the persona suggested by the Blue Hat.
  - **HITL (Human-in-the-Loop)**: The orchestrator pauses and prompts the user to approve or change the suggested next turn.
- **Logic**: Prompt the Blue Hat with conversation state and available personas to pick the next most relevant expert.

### 2. Consensus Mode
- **Termination**:
  - **Autonomous**: Blue Hat evaluates agreement and emits a `[CONSENSUS_REACHED]` token to stop the loop.
  - **Safety Valve**: A user-defined `max_turns` limit will terminate the loop regardless of Blue Hat's assessment.
- **Loop**: Sequential turns followed by a Blue Hat "Consensus Check" turn.

### 3. Session Branching (Forking)
- **Mechanism**: "Total Clone" strategy. When forking from a message, create a new session record and duplicate all messages in the parent session up to and including that specific point.
- **Schema**: Add `parentId` to `sessions` table to track the lineage.
- **Visuals**: A visual "Tree" component to navigate between the main trunk and its various forks.

### 4. UI/UX
- **Fork Trigger**: A "Fork" action button on every message in the chat history.
- **Branch Navigator**: A visual tree sidebar or dedicated view showing the hierarchy of forks for the current root session.
- **Toggle**: A setting to switch between "Auto-Advance" and "Ask before Suggestion" for turn-taking.

## Success Criteria
- [ ] User can fork a session from any message and continue the discussion independently.
- [ ] Blue Hat successfully identifies and suggests the next logical speaker.
- [ ] Consensus mode terminates automatically when agreement is reached or turn limit hit.
- [ ] Visual tree allows clear navigation between multiple conversation paths.
