# Tensix

## What This Is

A web-based tool and reusable API for conducting multi-LLM evaluations through a "round-table" discussion. It implements the Six Thinking Hats method alongside custom personas to provide deep, balanced audits of user ideas.

## Core Value

Users can evaluate and refine ideas through a structured, multi-perspective LLM dialogue that reduces bias and surfaces hidden risks or opportunities.

## Requirements

### Active (Milestone 2: Intelligent Orchestration & Tools)

- [ ] **RND-06**: Implement tool-use (function calling) for personas (e.g., web search, file access).
- [ ] **RND-07**: Add "Dynamic Hat Selection" — the system can automatically suggest which hat should speak next.
- [ ] **RND-08**: Support "Multi-Round Consensus" workflows where agents iterate until a conclusion is reached.
- [ ] **RND-09**: Implement "Expert Knowledge Base" — allow users to upload documents for personas to reference.
- [ ] **RND-10**: Support for "Branching Discussions" — allow the user to fork a session from any message.

### Validated (Milestone 1: Foundation & SEQ)

- [x] **RND-01**: User can add/remove "Six Hats" and custom personas to a round-table session.
- [x] **RND-02**: Support for local LLM backends (Ollama, LM Studio) via configurable endpoints.
- [x] **RND-03**: Support for cloud-based LLM providers (OpenRouter/OpenAI API compatible).
- [x] **RND-04**: Reusable API for external tools to trigger and consume round-table evaluations.
- [x] **RND-05**: Web UI for real-time observation and interaction with the participants.

### Out of Scope

- [Advanced Audio/Video] — Focus on text-based reasoning first.
- [Multi-user Collaboration] — Initial version is for a single user's evaluations.

## Context

- The project is named "Tensix" (likely a play on "Six Hats" and "Reasoning").
- Target audience is likely developers or researchers using local hardware.
- The system must handle sequential execution to accommodate VRAM limitations for local models.

## Constraints

- **Backend**: Must be compatible with Ollama and LM Studio (OpenAI-compatible local endpoints).
- **Architecture**: Web UI must be backed by a clean, reusable API.
- **Resource Management**: Must handle model loading/unloading or sequential polling if resources are constrained.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-First | Priority on privacy and utilizing local hardware (Ollama/LM Studio). | — Pending |
| Balanced Audit Goal | Focus on holistic evaluation rather than just ideation or risk. | — Pending |

---
*Last updated: 2026-03-30 after initialization*
