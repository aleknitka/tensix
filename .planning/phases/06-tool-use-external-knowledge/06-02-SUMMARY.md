# Summary: 06-02 Core: Orchestrator Tool Loop & Initial Tools

## Objective
Upgrade the orchestration loop to support tool use and implement initial core tools with security sandboxing.

## Changes
### src/server/providers/types.ts
- Updated `Message` interface to include `tool_calls` and `tool_call_id`.
- Added `ToolCall` and `GenerateChunk` interfaces.
- Updated `BaseProvider.generate` signature to support tools and return an async iterable of `GenerateChunk`.

### src/server/providers/ollama.ts, src/server/providers/openrouter.ts, src/server/providers/lmstudio.ts
- Updated all provider implementations to handle the new `generate` signature.
- Added tool call parsing logic for Ollama and OpenRouter.

### src/server/orchestrator.ts
- Implemented recursive tool call loop in `runRoundTable`.
- Added fetching and concatenation of session documents.
- Implemented full context injection of documents into the persona context.
- Added logic to store tool interaction metadata in the `messages` table.

### src/server/tools/implementations.ts
- Implemented `read_file` tool with strict project-root sandboxing.
- Implemented `calculator` tool using a safe execution method.
- Registered core tools in the `ToolRegistry`.

## Verification
- `runRoundTable` contains the `while (!isPersonaDone)` loop for recursive tool handling.
- `read_file` implementation includes path validation.
- All provider adapters conform to the new streaming interface.

## Success Criteria
- [x] `runRoundTable` supports recursive tool calls.
- [x] `read_file` tool rejects paths outside project root.
- [x] `calculator` tool correctly handles expressions.
- [x] Documents are successfully injected into the system prompt.
