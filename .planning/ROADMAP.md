# Roadmap: Tensix

This roadmap outlines the development of Tensix, a local-first multi-LLM round-table evaluation tool. It follows a goal-backward structure derived from v1 requirements and research findings, focusing on resource-efficient orchestration (Serial Expert Queue) and structured reasoning (Six Thinking Hats).

## Phases

- [x] **Phase 1: Project Foundation** - Establish the Tauri/Next.js/Bun scaffold and SQLite persistence layer.
- [x] **Phase 2: Connectivity & Discovery** - Connect the application to local (Ollama/LM Studio) and cloud (OpenRouter) providers.
- [x] **Phase 3: Core Orchestration (The Round Table)** - Implement the Serial Expert Queue (SEQ) for sequential multi-persona reasoning.
- [x] **Phase 4: Persona Management & Moderation** - Add interactive human-in-the-loop controls and custom persona creation.
- [x] **Phase 5: Context & Reporting** - Finalize reporting features and handle long-running session context via summarization.
- [x] **Phase 6: Tool Use & External Knowledge** - Implement function calling for personas and a RAG-lite knowledge base.
- [x] **Phase 7: Advanced Orchestration & Branching** - Add dynamic turn suggestion, consensus modes, and session forking.
- [x] **Phase 8: Markdown Rendering in Chat** - Proper display of formatted text, lists, and tables in the UI.
- [x] **Phase 9: More Customisation when defining the role** - Enhanced persona definition options.
- [x] **Phase 10: Role Refinement & Expansion** - Design specialized roles and tailor existing ones for better roleplay.
- [ ] **Phase 11: Add Other Roles** - Expand template library beyond Six Thinking Hats.
- [ ] **Phase 12: Onboarding Agent for Problem Refinement** - Guided initial problem definition for users.

## Phase Details

### Phase 1: Project Foundation
**Goal**: Set up the technical foundation and persistence layer.
**Depends on**: Nothing
**Requirements**: API-01, ORCH-04, UI-03
**Success Criteria**:
  1. User can launch the application and see a persistent session history sidebar.
  2. System can create, save, and reload a session record from SQLite.
  3. User can see the application version and backend API status.
**Plans**:
- [x] 01-01-PLAN.md — Core Scaffolding (Next.js, Tauri v2, Hono)
- [x] 01-02-PLAN.md — Persistence Layer (Drizzle, SQLite)
- [x] 01-03-PLAN.md — UI Foundation & Sidebar
**UI hint**: yes

### Phase 2: Connectivity & Discovery
**Goal**: Establish reliable connections to LLM providers and detect model capabilities.
**Depends on**: Phase 1
**Requirements**: CONN-01, CONN-02, CONN-03, CONN-04
**Success Criteria**:
  1. User can verify a connection to a local Ollama or LM Studio instance from the settings UI.
  2. User can select from a dynamically updated list of available models for each provider.
  3. System provides immediate feedback if a connection fails or a model is incompatible.
**Plans**:
- [x] 02-01-PLAN.md — Core Providers & Persistence
- [x] 02-02-PLAN.md — Settings UI & Connection Feedback
**UI hint**: yes

### Phase 3: Core Orchestration (The Round Table)
**Goal**: Implement the Serial Expert Queue (SEQ) for multi-persona reasoning.
**Depends on**: Phase 2
**Requirements**: PERS-01, PERS-03, ORCH-01, UI-01
**Success Criteria**:
  1. User can start a round-table session using "Six Thinking Hats" templates.
  2. The UI streams each agent's response in real-time as they take turns.
  3. Models are loaded and unloaded sequentially to ensure VRAM limits are respected.
**Plans**:
- [x] 03-01-PLAN.md — Orchestration Core & Provider Upgrades
- [x] 03-02-PLAN.md — Persona Templates & Streaming API
- [x] 03-03-PLAN.md — Round Table UI Integration
**UI hint**: yes

### Phase 4: Persona Management & Moderation
**Goal**: Enable custom persona creation and Human-in-the-Loop (HITL) moderation.
**Depends on**: Phase 3
**Requirements**: PERS-02, UI-02, ORCH-02
**Success Criteria**:
  1. User can create and save custom personas with specific system prompts and assigned models.
  2. User can manually pause the debate and intervene (edit messages or force specific turns).
  3. User can moderate the flow of conversation via the "Blue Hat" dashboard.
**Plans**:
- [x] 04-01-PLAN.md — Persona Management CRUD
- [x] 04-02-PLAN.md — Message-Level Moderation
- [x] 04-03-PLAN.md — Orchestration & HITL Control
**UI hint**: yes

### Phase 5: Context & Reporting
**Goal**: Finalize session longevity features and structured output generation.
**Depends on**: Phase 4
**Requirements**: ORCH-03, UI-04, API-02
**Success Criteria**:
  1. System automatically manages LLM context windows through periodic summarization.
  2. User can export a structured "Final Audit Report" as Markdown or PDF.
  3. External tools can retrieve session history via the REST API for further processing.
**Plans**:
- [x] 05-01-PLAN.md — Context Management & Summarization
- [x] 05-02-PLAN.md — Structured Reporting & Synthesis
- [x] 05-03-PLAN.md — History Export & Final Polish
**UI hint**: yes

### Phase 6: Tool Use & External Knowledge
**Goal**: Enable personas to interact with the world and reference user documents.
**Depends on**: Phase 5
**Requirements**: TOOL-01, TOOL-02, TOOL-03, KNOW-01, KNOW-02, UI-05
**Success Criteria**:
  1. User can define a tool (e.g., Google Search) and assign it to the "White Hat".
  2. Persona successfully executes the tool and incorporates results into its turn.
  3. User can upload a text file that influences the hat responses.
**Plans**:
- [x] 06-01-PLAN.md — Foundation: Database, Schema & Tool Registry (Wave 1)
- [x] 06-02-PLAN.md — Core: Orchestrator Loop & Initial Tools (Wave 2)
- [x] 06-03-PLAN.md — UI: Document Management & Tool Visibility (Wave 3)
**UI hint**: yes

### Phase 7: Advanced Orchestration & Branching
**Goal**: Transition from static turn-taking to intelligent, adaptive round-tables.
**Depends on**: Phase 6
**Requirements**: ORCH-05, ORCH-06, ORCH-07, UI-06, RND-07, RND-08, RND-10
**Success Criteria**:
  1. The "Blue Hat" can suggest the next speaker based on current gaps in the discussion.
  2. Consensus mode terminates automatically when agreement is reached or turn limit hit.
  3. User can fork a session from a past message and continue it independently.
  4. Visual tree allows clear navigation between multiple conversation paths.
**Plans**:
- [x] 07-01-PLAN.md — Database & Backend Foundation (Wave 1)
- [x] 07-02-PLAN.md — Orchestrator Logic Upgrade (Wave 2)
- [x] 07-03-PLAN.md — UI Integration (Wave 3)
**UI hint**: yes

### Phase 8: Markdown Rendering in Chat
**Goal**: Implement markdown support for messages in the chat UI (e.g., using react-markdown) to properly display formatted text, lists, and tables.
**Depends on**: Phase 3
**Requirements**: REND-01, REND-02, REND-03
**Success Criteria**:
  1. Messages correctly render Markdown elements (headers, bold, italics).
  2. Tables are rendered cleanly using GFM syntax.
  3. Code blocks show syntax highlighting and a "Copy" button.
**Plans**:
- [x] 08-01-PLAN.md — Foundation & Dependencies (Wave 1)
- [x] 08-02-PLAN.md — Markdown Component Implementation (Wave 2)
- [x] 08-03-PLAN.md — Integration & Verification (Wave 3)
**UI hint**: yes

### Phase 9: More Customisation when defining the role
**Goal**: Enhance the persona system with granular controls, visual identity, and live testing capabilities.
**Depends on**: Phase 4
**Requirements**: PERS-04, PERS-05, API-03, UI-07, UI-08, UI-09, UI-10
**Success Criteria**:
  1. Users can configure temperature and other model-specific parameters.
  2. Personas can be assigned custom icons and color accents.
  3. The editor includes a working sandbox for immediate persona feedback.
  4. Reasoning templates can be easily inserted into system prompts.
**Plans**:
- [x] 09-01-PLAN.md — Database & Backend Updates (Wave 1)
- [x] 09-02-PLAN.md — UI Enhancements Part 1: Parameters & Visuals (Wave 2)
- [x] 09-03-PLAN.md — UI Enhancements Part 2: Sandbox & Templates (Wave 3)
**UI hint**: yes

### Phase 10: Role Refinement & Expansion
**Goal**: Design specialized roles and tailor existing ones to be less chatty and improve role-play quality.
**Depends on**: Phase 4
**Requirements**: ROLE-01, ROLE-02, ROLE-03, CHAT-01
**Success Criteria**:
  1. User can select a role from a dropdown and add it to a session.
  2. Roles can be created/edited in a dedicated UI and saved as portable structures.
  3. LLM responses are noticeably shorter (few sentences) for standard roles.
  4. YAML export/import of a role profile works correctly.
**Plans**:
- [x] 10-01-PLAN.md — Foundation & Schema (Wave 1)
- [x] 10-02-PLAN.md — Sync & Orchestration (Wave 2)
- [x] 10-03-PLAN.md — UI & Library Management (Wave 3)
**UI hint**: yes

### Phase 11: Add Other Roles
**Goal**: Expand the template library beyond the initial Six Thinking Hats to include other cognitive frameworks and expert personas, organized in a hierarchical structure.
**Depends on**: Phase 10
**Requirements**: ROLE-SCAN, ROLE-SCHEMA, ROLE-CONTENT, ROLE-UI
**Plans**: 3 plans
- [ ] 11-01-PLAN.md — Schema and Sync Service
- [ ] 11-02-PLAN.md — Role Library Expansion
- [ ] 11-03-PLAN.md — Hierarchical UI

### Phase 12: Onboarding Agent for Problem Refinement
**Goal**: Implement an agent that interacts with the user to clarify and refine their initial prompt before the round-table begins.
**Depends on**: Phase 3
**Requirements**: TBD
**Plans**: 0 plans

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
| 11. Add Other Roles | 0/3 | In Progress | - |
| 12. Onboarding Agent | 0/0 | Not Started | - |

## Backlog

### Phase 999.2: Separate Tab for Team Building (BACKLOG)
**Goal:** Move team building functionality to a separate tab to improve session chat history readability.

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
