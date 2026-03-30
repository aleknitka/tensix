# Roadmap: Tensix

This roadmap outlines the development of Tensix, a local-first multi-LLM round-table evaluation tool. It follows a goal-backward structure derived from v1 requirements and research findings, focusing on resource-efficient orchestration (Serial Expert Queue) and structured reasoning (Six Thinking Hats).

## Phases

- [x] **Phase 1: Project Foundation** - Establish the Tauri/Next.js/Bun scaffold and SQLite persistence layer.
- [x] **Phase 2: Connectivity & Discovery** - Connect the application to local (Ollama/LM Studio) and cloud (OpenRouter) providers.
- [x] **Phase 3: Core Orchestration (The Round Table)** - Implement the Serial Expert Queue (SEQ) for sequential multi-persona reasoning.
- [x] **Phase 4: Persona Management & Moderation** - Add interactive human-in-the-loop controls and custom persona creation.
- [x] **Phase 5: Context & Reporting** - Finalize reporting features and handle long-running session context via summarization.
- [ ] **Phase 6: Tool Use & External Knowledge** - Implement function calling for personas and a RAG-lite knowledge base.
- [ ] **Phase 7: Advanced Orchestration & Branching** - Add dynamic turn suggestion, consensus modes, and session forking.

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

### Phase 7: Advanced Orchestration & Branching
**Goal**: Transition from static turn-taking to intelligent, adaptive round-tables.
**Depends on**: Phase 6
**Requirements**: ORCH-05, ORCH-06, ORCH-07, UI-06
**Success Criteria**:
  1. The "Blue Hat" can suggest the next speaker based on current gaps in the discussion.
  2. A "Consensus" round successfully terminates when agreement is reached.
  3. User can fork a session from a past message and continue it independently.

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation | 3/3 | Completed | 2024-05-24 |
| 2. Connectivity & Discovery | 2/2 | Completed | 2024-05-24 |
| 3. Core Orchestration | 3/3 | Completed | 2024-05-24 |
| 4. Persona Management & Moderation | 3/3 | Completed | 2024-05-25 |
| 5. Context & Reporting | 3/3 | Completed | 2026-03-30 |
| 6. Tool Use & External Knowledge | 0/3 | Not Started | - |
| 7. Advanced Orchestration & Branching | 0/3 | Not Started | - |

## Backlog

### Phase 999.1: Role Refinement & Expansion (BACKLOG)

**Goal:** Design more specialized roles and tailor existing ones to be less chatty and improve role-play quality.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)
