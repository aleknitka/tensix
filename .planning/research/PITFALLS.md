# Domain Pitfalls: Tensix (Local-First Multi-LLM Round-Table)

**Domain:** Local AI Orchestration
**Researched:** 2024-05-24

## Critical Pitfalls

Mistakes that cause system instability or complete failure.

### Pitfall 1: VRAM Fragmentation and Memory Spill
**What goes wrong:** Loading multiple LLMs in sequence doesn't always "cleanly" free VRAM. Some models might leave artifacts, causing the next model to spill into System RAM (CPU/RAM).
**Why it happens:** Inefficient garbage collection or delayed unload signals in Ollama/LM Studio.
**Consequences:** Massive performance drop (10x-30x slower token generation).
**Prevention:** Implement explicit "Wait for Unload" logic. In Ollama, use `keep_alive: 0` and wait for a confirmation signal before loading the next model.
**Detection:** Monitor generation speed (tokens per second) and warn the user if it drops below a "System RAM" threshold (e.g., < 2 t/s).

### Pitfall 2: Context Window Overflow in Round-Table
**What goes wrong:** As the round-table progresses, the "Context" string grows. By the 5th or 6th expert, the previous experts' conversation may exceed the model's context limit.
**Why it happens:** Multi-turn conversation logic without truncation.
**Consequences:** The LLM "forgets" the initial prompt or the results of the first expert.
**Prevention:** Implement a sliding context window or summarize previous rounds periodically.

## Moderate Pitfalls

### Pitfall 1: Provider Port Conflicts
**What goes wrong:** Ollama and LM Studio might use the same default ports or be unavailable when the app starts.
**Prevention:** Add a connectivity "Health Check" at startup to verify providers are active.

### Pitfall 2: Model Name Mismatch
**What goes wrong:** The app tries to load "llama3" but the user only has "llama3:latest" or a custom "llama3-8b-instruct" in Ollama.
**Prevention:** Always pull the full list of available models from the provider and use exact model IDs.

## Minor Pitfalls

### Pitfall 1: Local File System Access (Tauri)
**What goes wrong:** Inability to read model files or save SQLite databases due to lack of Tauri permissions.
**Prevention:** Ensure correct `allowlist` configuration in `tauri.conf.json`.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 1: Connectivity** | Connection timeouts for large model loads. | Set high client timeouts (>120s) for initial load. |
| **Phase 2: Orchestration** | Infinite loops in agent debates. | Set a maximum "Round Limit" (e.g., max 3 rounds of debate). |
| **Phase 3: VRAM Optimizer** | Inaccurate VRAM reporting. | Allow users to manually configure their "VRAM Budget". |

## Sources

- [LM Studio Hardware Optimization Guide](https://lmstudio.ai/docs/advanced/hardware)
- [Ollama FAQ - Performance Issues](https://ollama.com/blog/performance-tuning)
- [Common Agentic Patterns (Debates)](https://www.promptengineering.org/multi-agent-collaboration-and-debates/)
