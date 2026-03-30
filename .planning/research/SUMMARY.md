# Research Summary: Tensix (Local-First Multi-LLM Round-Table)

**Project:** Tensix
**Last Updated:** 2024-05-24
**Status:** Synthesis Complete

## Executive Summary

Tensix is a professional-grade, local-first multi-LLM "round-table" tool designed to bring structured, multi-perspective reasoning to complex domains like security auditing and compliance. By leveraging the **Six Thinking Hats** framework, Tensix enables users to chain multiple specialized "Expert" personas (e.g., White Hat for facts, Black Hat for risks) into a coherent, sequential reasoning process. The product is built to run entirely on the user's local hardware, ensuring data privacy and reducing reliance on costly cloud APIs.

The core technical challenge identified is **VRAM management** for local LLMs (Ollama/LM Studio). To prevent performance degradation caused by memory spills into system RAM, the recommended architecture follows a **Serial Expert Queue (SEQ)** pattern. This ensures only one large model is loaded at a time, with explicit unloading logic before the next expert takes their turn. The choice of **Tauri** over Electron further minimizes OS-level memory overhead, leaving more resources for the inference engines.

To succeed, Tensix must prioritize a robust orchestration layer that handles sequential token streaming via **Server-Sent Events (SSE)** and provides high-level human-in-the-loop (HITL) controls. The roadmap focuses on establishing stable connectivity first, followed by the core "Six Hats" logic, and finally advanced state manipulation and VRAM optimization features.

## Key Findings

### Tech Stack (from STACK.md)
- **Frontend & Desktop:** **Next.js 14** (App Router) wrapped in **Tauri 2.0**. This combination provides a modern React UI with native performance and a small memory footprint.
- **Backend & Runtime:** **Bun 1.1.x** with **Hono**. Bun offers native SQLite support and extreme performance for local API orchestration.
- **AI Orchestration:** **Vercel AI SDK** with specialized adapters for **Ollama** and **LM Studio**. Explicit use of `ollama-js` and `lmstudio-js` for granular model/VRAM management.
- **Database:** **SQLite** (via Drizzle ORM) for persisting debate history, persona configurations, and system prompts.

### Feature Landscape (from FEATURES.md)
- **Table Stakes:** Six Thinking Hats framework, professional persona library (Security/Compliance), sequential reasoning chains, and basic human approval gates.
- **Differentiators:** **"Human-as-an-Agent"** nodes for delegating tasks to the user, **"Fork and Edit"** state manipulation to correct hallucinations, and automated framework mapping (GDPR/SOC2).
- **Anti-Features:** Avoid free-form chat and hidden reasoning. The focus is on structured, auditable "Whiteboard" states and explicit Chain of Thought.

### Architectural Blueprint (from ARCHITECTURE.md)
- **Pattern: Serial Expert Queue (SEQ):** Enforce strict one-at-a-time model execution to avoid GPU VRAM exhaustion.
- **Pattern: SSE Streaming:** Use Server-Sent Events to push multi-agent updates (thinking, typing, finished) to the UI in real-time.
- **Component Boundaries:** Clear separation between the UI (state display), Orchestrator (state machine & VRAM logic), and Inference Providers (Ollama/LM Studio).

### Critical Pitfalls (from PITFALLS.md)
- **VRAM Fragmentation:** Sequential loading can leave artifacts in VRAM. Mitigation: Use `keep_alive: 0` in Ollama and monitor tokens-per-second (TPS) to detect system RAM spills.
- **Context Overflow:** Long debates will eventually exceed LLM context windows. Mitigation: Implement sliding windows or periodic summarization of previous rounds.
- **Connectivity:** Timeouts during large model loads. Mitigation: High client-side timeouts (>120s) and startup health checks.

## Implications for Roadmap

### Suggested Phase Structure

1.  **Phase 1: Foundation & Connectivity (The "Bridge")**
    *   **Rationale:** Establish reliable communication with local providers before building complex logic.
    *   **Deliverables:** Tauri/Next/Bun boilerplate, provider health checks, model list discovery.
    *   **Key Pitfall:** Connection timeouts/Port conflicts.

2.  **Phase 2: Core Orchestration (The "Round Table")**
    *   **Rationale:** Implement the SEQ pattern to enable basic multi-persona reasoning.
    *   **Deliverables:** Serial Expert Queue logic, SSE streaming UI, Six Thinking Hats prompt templates.
    *   **Key Pitfall:** VRAM fragmentation (initial unload logic needed).

3.  **Phase 3: Human-in-the-Loop & Moderation (The "Blue Hat")**
    *   **Rationale:** Transition from automated chains to interactive, supervised audits.
    *   **Deliverables:** Human approval gates between turns, "Human-as-an-Agent" nodes, Moderator (Blue Hat) dashboard.
    *   **Key Pitfall:** Infinite loops in agent debates.

4.  **Phase 4: Advanced VRAM & State Mastery (The "Optimizer")**
    *   **Rationale:** Handle long-running, complex sessions with large context.
    *   **Deliverables:** "Fork and Edit" capability, context summarization logic, explicit VRAM budget settings.
    *   **Key Pitfall:** Context window overflow.

### Research Flags
- **Needs Research:** Phase 4 (State Manipulation/Forking) needs deeper research into how to snapshot and restore LLM contexts efficiently.
- **Standard Patterns:** Phase 1 and 2 follow well-documented patterns for Tauri and Vercel AI SDK.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Modern, well-supported technologies (Tauri, Next, Bun). |
| **Features** | HIGH | Based on established reasoning frameworks (Six Hats). |
| **Architecture** | MEDIUM/HIGH | SEQ pattern is sound, but real-world VRAM behavior across OSs varies. |
| **Pitfalls** | HIGH | Well-documented issues in the local LLM community. |

**Gaps to Address:**
- Real-world performance of `keep_alive: 0` across different GPU architectures (NVIDIA vs Mac M-series).
- Precise strategy for "summarizing" context in professional audits without losing critical security findings.

## Sources
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Ollama Model Management API](https://ollama.com/blog/model-management-api)
- [LM Studio SDK](https://github.com/lmstudio-ai/lmstudio-js)
- [Tauri v2 Docs](https://v2.tauri.app/)
- de Bono, E. (1985). *Six Thinking Hats*.
- OWASP Top 10 / NIST Cybersecurity Framework.
- LangGraph Multi-agent HITL patterns.
