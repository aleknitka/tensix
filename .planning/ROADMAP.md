# Roadmap: Tensix

This roadmap outlines the development of Tensix, a local-first multi-LLM round-table evaluation tool.

## Milestones

- [x] **v1.0 MVP** - Established foundation, connectivity, core orchestration, tools, roles, and onboarding.
- [ ] **UI Refinements & Docker** - Polishing the interface, improving safety, and enabling containerized deployment.

## Phases

### Phase 13: Data Safety & Bulk Deletion Refactoring
**Goal**: Split system reset into "Clear Chats" and "Full Reset", and protect critical data from bulk deletion.
**Status**: Pending

### Phase 14: Layout Expansion & Contrast Audit
**Goal**: Increase chat window real estate and improve text legibility across the app.
**Status**: Pending

### Phase 15: Workflow Protection (Refiner Locking)
**Goal**: Ensure AI-generated refinements are preserved as intended by making them read-only.
**Status**: Pending

### Phase 16: Dockerization & Deployment Strategy
**Goal**: Provide Docker support for easier deployment and containerized execution of the backend and frontend.
**Status**: Pending

## Phase Details

### Phase 13: Data Safety & Bulk Deletion Refactoring
- **T-UI-01**: Implement `/system/clear-chats` endpoint.
- **T-UI-02**: Update Settings UI to distinguish between clearing history and resetting the system.
- **T-UI-03**: Ensure personas/providers cannot be deleted in bulk.

### Phase 14: Layout Expansion & Contrast Audit
- **T-UI-04**: Refactor `DebateView.tsx` for expanded width.
- **T-UI-05**: Global color audit and adjustment for contrast.

### Phase 15: Workflow Protection (Refiner Locking)
- **T-UI-06**: Modify `RefinementView.tsx` to remove editing capabilities for the refined prompt.

### Phase 16: Dockerization & Deployment Strategy
- **T-OPS-01**: Multi-stage Dockerfile for Next.js.
- **T-OPS-02**: Dockerfile for Backend.
- **T-OPS-03**: docker-compose.yml configuration.
- **T-OPS-04**: Environment variable ingestion logic.

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1-12. v1.0 Milestone | 38/38 | Completed | 2026-04-01 |
| 13. Data Safety | 1/1 | Completed | 2026-04-02 |
| 14. Layout & Contrast | 1/1 | Completed | 2026-04-02 |
| 15. Workflow Protection | 1/1 | Completed | 2026-04-02 |
| 16. Dockerization | 1/1 | Completed | 2026-04-02 |
