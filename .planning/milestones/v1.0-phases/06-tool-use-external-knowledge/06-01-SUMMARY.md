# Phase 06, Plan 01 Summary: Foundation: Database, Schema & Tool Registry

Established the foundational data structures and registry for tool use and document-based knowledge.

## Accomplishments
- **Database Schema Update**: 
  - Added `documents` table to SQLite schema for session-based file storage.
  - Added `metadata` column to `messages` table for storing JSON tool call details.
  - Successfully applied changes using `drizzle-kit push`.
- **ToolRegistry Implementation**:
  - Created `src/server/tools/registry.ts`.
  - Defined `Tool` interface and `ToolRegistry` class.
  - Implemented methods for tool registration, lookup, and definition formatting (compatible with Ollama/OpenRouter).
- **Document CRUD API**:
  - Added Hono routes in `src/server/index.ts` for document management:
    - `POST /api/sessions/:id/documents`: Upload/Save a document.
    - `GET /api/sessions/:id/documents`: List documents for a session.
    - `DELETE /api/documents/:id`: Remove a document.

## Verification Results
- `npx drizzle-kit check` passed successfully.
- `src/server/tools/registry.ts` created and exports `toolRegistry` singleton.
- API endpoints added to `src/server/index.ts` with `/api` prefix for document operations.

## Next Steps
- Implement specific tools in the next plan (e.g., `web_search`, `read_document`).
- Integrate ToolRegistry into the orchestrator logic to enable LLMs to call tools.
