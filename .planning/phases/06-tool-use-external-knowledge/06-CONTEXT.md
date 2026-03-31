# Context: Phase 6 — Tool Use & External Knowledge

## Goal
Evolve personas into capable agents that can interact with the system via hardcoded tools and reference user-uploaded documents.

## Decisions

### 1. Tool Orchestration
- **Mechanism**: Hardcoded server-side functions.
- **Registry**: A `ToolRegistry` will map tool names (JSON Schema) to TypeScript implementation functions.
- **Loop**: The orchestrator (`runRoundTable`) will be updated to handle the `call -> execute -> response` loop recursively until a final text response is produced.
- **Initial Tools**: `read_file` (sandboxed), `web_search` (mock or basic integration), `calculator`.

### 2. Knowledge Base (RAG-lite)
- **Approach**: Full Context Injection.
- **Storage**: Uploaded files will be stored in a `documents` table (id, sessionId, content, name).
- **Injection**: For a given session, all document contents will be concatenated and injected as a `system` message at the start of the round-table to provide shared context.

### 3. UI Visibility
- **Detail Level**: Show tool name and parameters.
- **Implementation**: The `messages` table will get a `metadata` JSON column. When a tool is called, a record will be saved. `DebateView` will render these as specialized "Tool Execution" cards (e.g., "White Hat: Using tool 'web_search' with params: { query: '...' }").

### 4. Security & Sandboxing
- **Constraint**: File-access tools (like `read_file`) MUST be strictly restricted to the project root or the temporary directory. Access outside these bounds must be rejected with an error.

## Success Criteria
- [ ] Orchestrator successfully handles at least one tool call loop.
- [ ] User can upload a text file and personas can answer questions about it.
- [ ] UI shows clear indicators when a tool is being invoked.
- [ ] Security boundaries for file tools are verified.
