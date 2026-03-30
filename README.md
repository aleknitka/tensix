# Tensix

**Multi-LLM Round-Table Evaluation Engine**

Tensix is an agentic AI tool designed for deep, structured brainstorming and problem evaluation using the **Six Thinking Hats** method. It allows users to orchestrate a "round-table" of specialized AI personas to audit ideas, surface risks, and identify opportunities—all while maintaining a local-first, privacy-conscious execution model.

---

## 🎩 The Six Thinking Hats

Tensix implements the structured reasoning methodology developed by Edward de Bono:

- **White Hat (Facts)**: Focuses on data, information, and neutral evidence.
- **Red Hat (Feelings)**: Focuses on intuition, hunches, and emotional reactions.
- **Black Hat (Cautions)**: Focuses on risks, potential problems, and critical judgment.
- **Yellow Hat (Benefits)**: Focuses on optimism, value, and constructive benefits.
- **Green Hat (Creativity)**: Focuses on possibilities, alternatives, and new ideas.
- **Blue Hat (Process)**: Focuses on control, summarization, and strategic conclusions.

---

## ✨ Key Features

- **SEQ (Serial Expert Queue)**: A resource-efficient orchestrator that executes personas sequentially, allowing high-quality multi-agent reasoning even on local hardware with limited VRAM.
- **Local-First LLMs**: Native support for **Ollama** and **LM Studio** for complete privacy.
- **Cloud Integration**: Support for **OpenRouter** and OpenAI-compatible endpoints for advanced reasoning.
- **Persona Management**: Create custom "experts" with tailored system prompts and specific model assignments.
- **Human-in-the-Loop**: Manually intervene, edit messages, or force specific turn-taking during the live debate.
- **Context Summarization**: Automatic conversation compression to allow for long-running, deep-dive sessions.
- **Structured Reporting**: Generate and export "Final Audit Reports" in Markdown or JSON for archiving and decision-making.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+ (React 19), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend API**: Hono (Node.js) serving as the orchestration layer.
- **Desktop Wrapper**: Tauri v2 (Rust) for native desktop integration.
- **Persistence**: SQLite with Drizzle ORM.
- **Models**: Native adapters for Ollama, LM Studio, and OpenRouter.

---

## 🚀 Getting Started

### Prerequisites

1.  **Node.js**: v20 or newer.
2.  **LLM Provider**: Ensure you have at least one of the following running:
    - [Ollama](https://ollama.com/) (Default port: 11434)
    - [LM Studio](https://lmstudio.ai/) (Local Server enabled)
    - [OpenRouter](https://openrouter.ai/) (API Key required)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/tensix.git
    cd tensix
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Initialize the database:
    ```bash
    npx drizzle-kit push
    ```

4.  Start the development environment:
    ```bash
    # Terminal 1: Backend API
    npm run dev:backend

    # Terminal 2: Web UI
    npm run dev
    ```

### Running as Desktop App (Optional)
```bash
npm run tauri dev
```

---

## 📖 Usage

1.  **Configure Providers**: Open the **Settings** page and enable your preferred LLM providers.
2.  **Seed Hats**: Use the "Seed Thinking Hats" button in Settings to quickly set up the core Six Hats personas.
3.  **Create Session**: Start a new session from the sidebar and describe your idea or problem.
4.  **Select Participants**: In the sidebar, select which "Hats" you want to participate in the round-table.
5.  **Evaluate**: Click "Start Evaluation" to begin the automated sequential reasoning process.
6.  **Export**: Once finished, generate a "Final Audit Report" to synthesize the findings.

---

## 🗺️ Roadmap Progress

- [x] **Phase 1**: Project Foundation & SQLite Persistence
- [x] **Phase 2**: Multi-Provider Connectivity (Ollama, LM Studio, OpenRouter)
- [x] **Phase 3**: SEQ Orchestration & SSE Streaming
- [x] **Phase 4**: Persona Management & HITL Moderation
- [x] **Phase 5**: Automated Summarization & Structured Reporting
- [ ] **Phase 6**: Tool Use (Web Search, File Access) & Knowledge Base
- [ ] **Phase 7**: Intelligent Orchestration & Branching Discussions

---

## ⚖️ License

MIT License. See `LICENSE` for details.
