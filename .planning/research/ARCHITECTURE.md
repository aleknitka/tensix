# Architecture Patterns: Tensix (Local-First Multi-LLM Round-Table)

**Domain:** Local AI Orchestration
**Researched:** 2024-05-24

## Recommended Architecture

Tensix uses a **Client-Server Architecture** locally, wrapped in **Tauri**.

- **Frontend (UI Layer):** Next.js (running inside Tauri WebView).
- **Backend (Orchestration Layer):** Hono on Bun (running as a sidecar or main process in Tauri).
- **Inference Engines (External):** Ollama and LM Studio (running as separate local services).

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **UI (React)** | State display, streaming output, user input. | Orchestrator (via HTTP/SSE/WebSockets). |
| **Orchestrator (Hono/Bun)** | State machine (who's turn is it?), VRAM management logic. | Ollama/LM Studio APIs, SQLite. |
| **SQLite (Drizzle)** | Storage of past debates, configured "experts", and system prompts. | Orchestrator. |
| **Provider Adapter** | Abstracts away API differences between Ollama and LM Studio. | Ollama/LM Studio. |

### Data Flow

1. User sends a prompt to the **Orchestrator**.
2. **Orchestrator** identifies the first "Expert" model.
3. **Orchestrator** calls **Provider Adapter** to load/check the model.
4. If VRAM is full, **Orchestrator** unloads old models via the adapter.
5. First model streams tokens back to **UI** via **Orchestrator** (using SSE).
6. Once first model is done, **Orchestrator** repeats for the next Expert in the "Round Table".
7. Final **Moderator** pass synthesizes the results.

## Patterns to Follow

### Pattern 1: Serial Expert Queue (SEQ)
To avoid VRAM exhaustion, all LLM calls are queued and executed one at a time. This ensures that only one large model is loaded in memory at once.

**Example Pseudo-Code:**
```typescript
async function runRoundTable(experts: Expert[]) {
  let context = "";
  for (const expert of experts) {
    // Explicitly unload current model if necessary
    await unloadOtherModels(expert.modelId);
    
    // Execute expert pass
    const response = await expert.provider.generate({
      model: expert.modelId,
      prompt: `${expert.systemPrompt}\nContext: ${context}`
    });
    
    context += `\n${expert.name}: ${response.text}`;
    
    // Optional: Unload immediately to free VRAM for next expert
    await expert.provider.unload(expert.modelId);
  }
}
```

### Pattern 2: Server-Sent Events (SSE) for Multi-Agent Streaming
Since multiple agents generate text sequentially, SSE allows the backend to push updates like "Expert A started thinking", "Expert A finished", "Expert B starting" without complex WebSocket management for the initial MVP.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Concurrent Local Loading
**What:** Attempting to run multiple LLMs at once to "speed up" the round table.
**Why bad:** Most consumer GPUs will crash or spill into extremely slow system RAM (causing a ~30x performance hit).
**Instead:** Enforce a strict one-model-at-a-time rule unless the user explicitly overrides it in advanced settings.

## Scalability Considerations

| Concern | 2 Experts (8B) | 5 Experts (70B) | 10+ Experts |
|---------|--------------|-----------------|-------------|
| **VRAM Usage** | ~10-12GB (Shared) | Sequential load required. | Disk-swapping bottlenecks. |
| **Inference Time** | < 1 min per round. | ~3-5 mins per round. | Significant wait times. |
| **Context Length** | Minimal impact. | Large context issues. | Needs "Context Truncation" logic. |

## Sources

- [Vercel AI SDK Core Architecture](https://sdk.vercel.ai/docs/concepts/architecture)
- [Ollama Model Management API](https://ollama.com/blog/model-management-api)
