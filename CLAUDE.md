<!-- GSD:project-start source:PROJECT.md -->
## Project

**Tensix**

A web-based tool and reusable API for conducting multi-LLM evaluations through a "round-table" discussion. It implements the Six Thinking Hats method alongside custom personas to provide deep, balanced audits of user ideas.

**Core Value:** Users can evaluate and refine ideas through a structured, multi-perspective LLM dialogue that reduces bias and surfaces hidden risks or opportunities.

### Constraints

- **Backend**: Must be compatible with Ollama and LM Studio (OpenAI-compatible local endpoints).
- **Architecture**: Web UI must be backed by a clean, reusable API.
- **Resource Management**: Must handle model loading/unloading or sequential polling if resources are constrained.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
# Core Frontend
# Core Backend (inside project)
# Dev dependencies
## Sources
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Ollama JS Library](https://github.com/ollama/ollama-js)
- [LM Studio SDK](https://github.com/lmstudio-ai/lmstudio-js)
- [Tauri v2 Docs](https://v2.tauri.app/)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
