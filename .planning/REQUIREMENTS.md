# Requirements: Tensix

**Defined:** 2026-03-30
**Core Value:** Users can evaluate and refine ideas through a structured, multi-perspective LLM dialogue that reduces bias and surfaces hidden risks or opportunities.

## v1 Requirements

Requirements for initial release, focusing on local-first round-table evaluations with the "Six Thinking Hats" method.

### Model Connectivity

- [ ] **CONN-01**: Connect to a local Ollama instance with health checks.
- [ ] **CONN-02**: Connect to a local LM Studio instance (OpenAI-compatible).
- [ ] **CONN-03**: Configure custom OpenAI-compatible endpoints (e.g., OpenRouter).
- [ ] **CONN-04**: Automatic model capability detection (checking if the model supports the required prompt format).

### Persona Management

- [ ] **PERS-01**: Pre-built "Six Thinking Hats" templates with optimized system prompts.
- [ ] **PERS-02**: User can create, edit, and save custom personas with specific system prompts.
- [ ] **PERS-03**: Assign specific LLM models to specific personas in the round-table.

### Orchestration

- [ ] **ORCH-01**: Implement **Serial Expert Queue (SEQ)**: sequential model execution with explicit loading/unloading to manage GPU VRAM.
- [ ] **ORCH-02**: Moderator-led turn-taking: a "Blue Hat" LLM or human moderator decides who speaks next.
- [ ] **ORCH-03**: Automated context management: summarization or rolling window to prevent context overflow.
- [ ] **ORCH-04**: Session persistence: save and reload round-table discussions from SQLite.

### User Interface

- [ ] **UI-01**: Real-time "Debate" view showing participants and their responses in a stream.
- [ ] **UI-02**: "Moderator Dashboard" for the user to trigger turns, edit messages, or override participant responses.
- [ ] **UI-03**: Model & Connection status indicators for local backends.
- [ ] **UI-04**: "Final Report" generation: synthesis of the discussion into a structured audit document.

### API & Integration

- [ ] **API-01**: Reusable REST API for starting a round-table evaluation from external scripts.
- [ ] **API-02**: Export discussion history to JSON/Markdown for further analysis.

## v2 Requirements

### Advanced Logic

- **ADV-01**: Blind Peer Review: agents critique each other without knowing who sent the message (reduces sycophancy).
- **ADV-02**: Reasoning Trees: explore multiple branching paths for a single idea evaluation.
- **ADV-03**: Multi-GPU support: parallelize the round-table if hardware permits.

### Media & Collaborative

- **COLL-01**: Multi-user collaboration on a single "round-table" session.
- **MEDIA-01**: Voice synthesis for participants during the debate.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Image Generation | Outside core reasoning scope for v1. |
| Web Scraping | High complexity, rely on user provided text or external tools first. |
| Non-OpenAI-Compatible APIs | High maintenance cost; focus on standard local/cloud interfaces. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONN-01 | Phase 1 | Pending |
| CONN-02 | Phase 1 | Pending |
| CONN-03 | Phase 1 | Pending |
| CONN-04 | Phase 1 | Pending |
| PERS-01 | Phase 2 | Pending |
| PERS-02 | Phase 2 | Pending |
| PERS-03 | Phase 2 | Pending |
| ORCH-01 | Phase 2 | Pending |
| ORCH-02 | Phase 3 | Pending |
| ORCH-03 | Phase 4 | Pending |
| ORCH-04 | Phase 1 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 1 | Pending |
| UI-04 | Phase 4 | Pending |
| API-01 | Phase 1 | Pending |
| API-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 after initialization*
