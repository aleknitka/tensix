# Roadmap: Tensix

This roadmap outlines the development of Tensix, a local-first multi-LLM round-table evaluation tool. It follows a goal-backward structure derived from v1 requirements and research findings, focusing on resource-efficient orchestration (Serial Expert Queue) and structured reasoning (Six Thinking Hats).

## Milestones

- [x] **v1.0 MVP** - Established foundation, connectivity, core orchestration, tools, roles, and onboarding.

## Phases

(No active phases. Plan next milestone to add phases.)

## Phase Details

(No active phases.)

### Phase 999.2: Separate Tab for Team Building
**Goal**: Move team building functionality to a separate tab to improve session chat history readability.
**Depends on**: Phase 3, Phase 4
**Requirements**: 999.2-TAB-01, 999.2-TAB-02, 999.2-TAB-03, 999.2-TAB-04
**Success Criteria**:
  1. Right sidebar features a tabbed navigation (Team, Docs, Branches, Settings, Tools).
  2. Chat history horizontal space is preserved or improved by logical grouping.
  3. Session settings (export, orchestration) are consolidated in a dedicated tab.
**Plans**: 2 plans
- [x] 999.2-01-PLAN.md — Tabbed Sidebar Foundation (Wave 1)
- [x] 999.2-02-PLAN.md — Content Migration & Refactoring (Wave 2)
**UI hint**: yes

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation | 3/3 | Completed | 2024-05-24 |
| 2. Connectivity & Discovery | 2/2 | Completed | 2024-05-24 |
| 3. Core Orchestration | 3/3 | Completed | 2024-05-24 |
| 4. Persona Management & Moderation | 3/3 | Completed | 2024-05-25 |
| 5. Context & Reporting | 3/3 | Completed | 2026-03-30 |
| 6. Tool Use & External Knowledge | 3/3 | Completed | 2026-03-30 |
| 7. Advanced Orchestration & Branching | 3/3 | Completed | 2026-03-30 |
| 8. Markdown Rendering in Chat | 3/3 | Completed | 2026-03-30 |
| 9. More Customisation role | 3/3 | Completed | 2026-03-30 |
| 10. Role Refinement & Expansion | 3/3 | Completed | 2026-03-30 |
| 11. Add Other Roles | 4/4 | Completed | 2026-04-01 |
| 12. Onboarding Agent | 3/3 | Completed | 2026-04-01 |
| 999.2. Separate Tab for Team Building | 2/2 | Completed | 2026-04-01 |

## Backlog

### Phase 999.3: Run as Docker Container (BACKLOG)
**Goal:** Provide Docker support for easier deployment and containerized execution of the backend and frontend.

### Phase 999.5: Ability to Add Files for Discussion (BACKLOG)
**Goal:** Allow users to upload and attach files/documents to a session to provide extra context.

### Phase 999.7: Add Hugging Face Inference Endpoint (BACKLOG)
**Goal:** Integrate Hugging Face Inference Endpoints as a provider option.

### Phase 999.8: Enable Auto Summarisation with a Model (BACKLOG)
**Goal:** Allow users to specify a specific model to be used exclusively for automated session summarization.

### Phase 999.9: .env Config Ingestion for Containers (BACKLOG)
**Goal:** Implement support for ingesting LLM endpoint configurations and API keys via .env files.
