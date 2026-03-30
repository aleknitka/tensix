# Tensix

## What This Is

A web-based tool and reusable API for conducting multi-LLM evaluations through a "round-table" discussion. It implements the Six Thinking Hats method alongside custom personas to provide deep, balanced audits of user ideas.

## Core Value

Users can evaluate and refine ideas through a structured, multi-perspective LLM dialogue that reduces bias and surfaces hidden risks or opportunities.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **RND-01**: User can add/remove "Six Hats" and custom personas to a round-table session.
- [ ] **RND-02**: Support for local LLM backends (Ollama, LM Studio) via configurable endpoints.
- [ ] **RND-03**: Support for cloud-based LLM providers (OpenRouter/OpenAI API compatible).
- [ ] **RND-04**: Reusable API for external tools to trigger and consume round-table evaluations.
- [ ] **RND-05**: Web UI for real-time observation and interaction with the participants.

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
