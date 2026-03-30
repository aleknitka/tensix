# Technology Stack: Tensix (Local-First Multi-LLM Round-Table)

**Project:** Tensix
**Researched:** 2024-05-24

## Recommended Stack

### Core Framework (Frontend + Desktop Wrapper)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js** | 14.x (App Router) | Web Frontend | Standard for React; built-in Server Actions for local-first backend calls. |
| **Tauri** | 2.0 (Stable) | Desktop Wrapper | Much lighter than Electron; native access to system resources. |
| **Tailwind CSS** | 3.x | Styling | Utility-first; fast prototyping of complex UIs. |

### Backend & Runtime
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Bun** | 1.1.x | Runtime & Package Manager | Incredibly fast; built-in SQLite engine; native WebSocket support. |
| **Hono** | 4.x | Backend Framework | Lightweight, standard-compliant (runs on Bun/Node); perfect for small local APIs. |
| **Drizzle ORM** | 0.30.x | Database ORM | Type-safe SQL for local SQLite storage. |

### AI & Orchestration
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Vercel AI SDK** | 3.x | Core AI logic | Unified API for different LLM providers (Ollama/LM Studio). |
| **ai-sdk-ollama** | Latest | Ollama Provider | Native integration for Ollama's local inference. |
| **ollama-js** | Latest | Model Management | For explicit model management (unload, pull, list) not covered by AI SDK. |
| **@lmstudio/sdk** | Latest | LM Studio Management | For granular VRAM management and model loading in LM Studio. |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **SQLite** | 3.x (via Bun) | Persistence | Lightweight, single-file database for local-first apps. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Runtime | **Bun** | Node.js | Bun is significantly faster and includes a built-in SQLite engine, reducing dependencies. |
| Framework | **Next.js** | SolidStart / SvelteKit | Next.js has better library support for AI (Vercel AI SDK). |
| Desktop | **Tauri** | Electron | Electron is memory-hungry; Tauri uses the system's native WebView, leaving more RAM for LLMs. |
| Backend | **Hono** | FastAPI (Python) | TypeScript end-to-end allows for a more unified codebase, though Python has better agent libraries (LangChain/CrewAI). |

## Installation

```bash
# Core Frontend
npx create-next-app@latest tensix-ui

# Core Backend (inside project)
bun add hono drizzle-orm @ai-sdk/openai ai-sdk-ollama ai

# Dev dependencies
bun add -D drizzle-kit tauri-cli
```

## Sources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Ollama JS Library](https://github.com/ollama/ollama-js)
- [LM Studio SDK](https://github.com/lmstudio-ai/lmstudio-js)
- [Tauri v2 Docs](https://v2.tauri.app/)
