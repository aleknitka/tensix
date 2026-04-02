# Summary: 07-02 Orchestrator Logic Upgrade

## Objective
Upgrade the `runRoundTable` orchestrator to support intelligent turn selection (Conductor mode) and consensus detection.

## Changes
### src/server/orchestrator.ts
- Updated `OrchestrationStep` interface to support `suggestion` types and `suggestedPersonaId`.
- Rewrote `runRoundTable` to support three modes: `sequential`, `auto` (Conductor-led), and `hitl` (Human-in-the-Loop suggestions).
- Implemented **Blue Hat Conductor** logic:
  - Dynamically prompts the Blue Hat to select the next speaker from available experts.
  - Constrains conductor output to personaIds or `[CONSENSUS_REACHED]`.
- Implemented **Consensus Detection**:
  - The loop terminates autonomously if the conductor emits the consensus token.
- Implemented **Safety Valve**:
  - Added a `maxTurns` limit to prevent infinite loops in automated modes.
- Added `type` field to all yielded steps (`text`, `suggestion`, `system`) for better frontend handling.

### src/server/index.ts
- Updated `/evaluate` endpoint to accept `mode` and `maxTurns` query parameters.

### tests/orchestrator.test.ts
- Created basic test cases for parsing conductor output and detecting consensus tokens.

## Verification
- Verified code structure and loop logic via manual review.
- Verified API parameter handling.
- Automated tests for parsing logic passed.

## Success Criteria
- [x] Orchestrator can intelligently pick the next speaker based on conversation context.
- [x] Consensus reached signal terminates the round-table session.
- [x] Turn limits prevent infinite loops in automated mode.
