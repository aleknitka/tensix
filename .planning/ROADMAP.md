# Roadmap: Tensix

This roadmap outlines the development of Tensix, a local-first multi-LLM round-table evaluation tool. It follows a goal-backward structure derived from v1 requirements and research findings, focusing on resource-efficient orchestration (Serial Expert Queue) and structured reasoning (Six Thinking Hats).

## Phases

- [ ] **Phase 1: Project Foundation** - Establish the Tauri/Next.js/Bun scaffold and SQLite persistence layer.
- [ ] **Phase 2: Connectivity & Discovery** - Connect the application to local (Ollama/LM Studio) and cloud (OpenRouter) providers.
- [ ] **Phase 3: Core Orchestration (The Round Table)** - Implement the Serial Expert Queue (SEQ) for sequential multi-persona reasoning.
- [ ] **Phase 4: Persona Management & Moderation** - Add interactive human-in-the-loop controls and custom persona creation.
- [ ] **Phase 5: Context & Reporting** - Finalize reporting features and handle long-running session context via summarization.

## Phase Details

### Phase 1: Project Foundation
**Goal**: Set up the technical foundation and persistence layer.
**Depends on**: Nothing
**Requirements**: API-01, ORCH-04, UI-03
**Success Criteria**:
  1. User can launch the application and see a persistent session history sidebar.
  2. System can create, save, and reload a session record from SQLite.
  3. User can see the application version and backend API status.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Connectivity & Discovery
**Goal**: Establish reliable connections to LLM providers and detect model capabilities.
**Depends on**: Phase 1
**Requirements**: CONN-01, CONN-02, CONN-03, CONN-04
**Success Criteria**:
  1. User can verify a connection to a local Ollama or LM Studio instance from the settings UI.
  2. User can select from a dynamically updated list of available models for each provider.
  3. System provides immediate feedback if a connection fails or a model is incompatible.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Core Orchestration (The Round Table)
**Goal**: Implement the Serial Expert Queue (SEQ) for multi-persona reasoning.
**Depends on**: Phase 2
**Requirements**: PERS-01, PERS-03, ORCH-01, UI-01
**Success Criteria**:
  1. User can start a round-table session using "Six Thinking Hats" templates.
  2. The UI streams each agent's response in real-time as they take turns.
  3. Models are loaded and unloaded sequentially to ensure VRAM limits are respected.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Persona Management & Moderation
**Goal**: Enable custom persona creation and Human-in-the-Loop (HITL) moderation.
**Depends on**: Phase 3
**Requirements**: PERS-02, UI-02, ORCH-02
**Success Criteria**:
  1. User can create and save custom personas with specific system prompts and assigned models.
  2. User can manually pause the debate and intervene (edit messages or force specific turns).
  3. User can moderate the flow of conversation via the "Blue Hat" dashboard.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Context & Reporting
**Goal**: Finalize session longevity features and structured output generation.
**Depends on**: Phase 4
**Requirements**: ORCH-03, UI-04, API-02
**Success Criteria**:
  1. System automatically manages LLM context windows through periodic summarization.
  2. User can export a structured "Final Audit Report" as Markdown or PDF.
  3. External tools can retrieve session history via the REST API for further processing.
**Plans**: TBD
**UI hint**: yes

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation | 0/1 | Not started | - |
| 2. Connectivity & Discovery | 0/1 | Not started | - |
| 3. Core Orchestration | 0/1 | Not started | - |
| 4. Persona Management & Moderation | 0/1 | Not started | - |
| 5. Context & Reporting | 0/1 | Not started | - |
