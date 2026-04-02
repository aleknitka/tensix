# Phase 09: More Customisation - Research

**Researched:** 2025-05-22
**Domain:** Persona customization, Model parameters, UI/UX for persona editing, Database schema
**Confidence:** HIGH

## Summary

This phase focuses on deepening the persona customization in Tensix. Research has identified how to map advanced model parameters to Ollama, LM Studio, and OpenRouter APIs. We have also defined a strategy for a live prompt preview (sandbox) and a visual identity system for personas using Lucide icons and color accents.

**Primary recommendation:** Extend the `personas` table and the `PersonaEditor` component to support granular model parameters and visual branding, while introducing a side-effect-free sandbox for testing personas before saving.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Advanced Model Parameters**: Add `temperature`, `top_p`, `max_tokens`, `presence_penalty`, and `frequency_penalty` to the `personas` table.
- **UI**: Add sliders/inputs for these parameters in the `PersonaEditor`.
- **Defaulting**: If unset, parameters will fall back to provider defaults.
- **Live Prompt Preview**: A "Sandbox" area within the editor to test the persona before saving.
- **Visual Identity (Branding)**: Allow users to select an icon from a predefined set of Lucide icons and support color accents.
- **Skills & Metadata**: Add a `skills` column (JSON array of strings) to categorize persona capabilities.
- **Prompt Template Library**: A dropdown or modal in the editor containing common reasoning patterns (e.g., "Chain of Thought", "Socratic").

### the agent's Discretion
- **Icon Set**: Selection of specific Lucide icons for roles.
- **Color Presets**: Selection of specific color accents.
- **Sandbox Implementation**: How to handle the test prompt without affecting main session state.

### Deferred Ideas (OUT OF SCOPE)
- YAML export/import logic (deferred to Phase 10).
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lucide React | ^0.4.6 | Iconography | Standard for UI project icons. |
| Drizzle ORM | ^0.45.2 | Database access | Project's existing ORM for SQLite. |
| Zod | ^4.3.6 | Validation | Used for role schema validation. |
| Hono | ^4.12.9 | Backend API | Project's existing backend framework. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Radix UI | - | UI Components | Consider for Sliders/Modals if not already present. |

## Model Parameters Mapping

| Parameter | Ollama (Request Body) | LM Studio / OpenRouter (Request Body) |
|-----------|-----------------------|---------------------------------------|
| Temperature | `options.temperature` | `temperature` |
| Top P | `options.top_p` | `top_p` |
| Max Tokens | `options.num_predict` | `max_tokens` |
| Presence Penalty | `options.presence_penalty` | `presence_penalty` |
| Frequency Penalty| `options.frequency_penalty`| `frequency_penalty`|

**Key Insight:** Ollama uses `num_predict` instead of `max_tokens`. Ensure the backend adapter maps this correctly based on the provider type.

## Architecture Patterns

### Recommended Project Structure
- `src/components/IconPicker.tsx`: New component for selecting persona icons.
- `src/components/ColorPicker.tsx`: New component for selecting persona color accents.
- `src/server/db/schema.ts`: Update `personas` table definition.
- `src/server/providers/`: Update all adapters to accept `options`.

### Pattern: Sandbox Testing
The sandbox should use a dedicated API endpoint `/personas/test` that takes the *temporary* persona configuration and a test prompt. This ensures no data is written to the database until the user clicks "Save".

**Flow:**
1. User enters data in `PersonaEditor`.
2. User enters a test message in the Sandbox section.
3. User clicks "Test".
4. Client calls `POST /personas/test` with current `editForm` state and the test message.
5. Server executes generation using the provided parameters but *does not* create a session or save messages.
6. Result is streamed back to the Sandbox UI.

## Visual Identity System

### Recommended Lucide Icons
1.  `Shield` (Security/Auditor)
2.  `Zap` (Fast/Efficient)
3.  `FileText` (Researcher)
4.  `Search` (Investigator)
5.  `Brain` (Strategist)
6.  `Feather` (Creative/Writer)
7.  `Code` (Developer)
8.  `MessageSquare` (Communicator)
9.  `Terminal` (Technical)
10. `Lock` (Privacy)
11. `Database` (Data)
12. `Microscope` (Analysis)
13. `Flame` (Contrarian)
14. `Coffee` (Support)
15. `Globe` (Generalist)
16. `UserCircle` (Default)

### Color Presets (Tailwind)
- `blue`: Indigo-500/600
- `green`: Emerald-500/600
- `amber`: Amber-500/600
- `rose`: Rose-500/600
- `violet`: Violet-500/600
- `cyan`: Cyan-500/600
- `orange`: Orange-500/600
- `slate`: Slate-500/600

## Database Schema Updates

Add the following columns to the `personas` table in `src/server/db/schema.ts`:

| Column | Type | Default |
|--------|------|---------|
| `temperature` | `real` | `NULL` |
| `top_p` | `real` | `NULL` |
| `max_tokens` | `integer` | `NULL` |
| `presence_penalty` | `real` | `NULL` |
| `frequency_penalty`| `real` | `NULL` |
| `icon_id` | `text` | `'user-circle'` |
| `color_accent` | `text` | `'slate'` |
| `skills` | `text` (JSON) | `'[]'` |

## Prompt Template Library

Reasoning patterns to be appended to the `systemPrompt`:

| Name | Pattern Suffix |
|------|----------------|
| Chain of Thought | `\n\nThink step-by-step before providing your final answer. Externalize your reasoning process.` |
| Socratic Method | `\n\nDo not give direct answers. Instead, ask guiding questions to help the user discover the answer themselves.` |
| Direct & Concise | `\n\nProvide direct, concise answers without fluff or unnecessary explanations.` |
| Critique & Refine | `\n\nAfter providing an answer, critique your own reasoning and suggest an improved version.` |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `personas` table in `sqlite.db` | Data migration (add new columns) |
| Live service config | None — verified by index.ts | None |
| OS-registered state | None — verified by package.json | None |
| Secrets/env vars | None — verified by providers/ | None |
| Build artifacts | None | None |

## Common Pitfalls

### Pitfall 1: Ollama `num_predict`
**What goes wrong:** Using `max_tokens` in the Ollama request body.
**Why it happens:** Most other providers use `max_tokens`.
**How to avoid:** Ensure the `OllamaProvider` adapter explicitly maps internal `max_tokens` to `num_predict`.

### Pitfall 2: Streaming in Sandbox
**What goes wrong:** Sandbox testing blocking the UI if not implemented with streaming.
**Why it happens:** Large language model responses take time.
**How to avoid:** Reuse the existing streaming logic from the orchestrator for the sandbox endpoint.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Ollama | AI Backend | ✓ | 0.6.3 | - |
| SQLite | Data Layer | ✓ | 3.x | - |
| Node.js | Runtime | ✓ | 20.19.x | - |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | vitest.config.ts |
| Quick run command | `npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P9-01 | Model params are saved | integration | `npm run test tests/roles.test.ts` | ✅ |
| P9-02 | Adapters pass params | unit | `npm run test tests/orchestrator.test.ts` | ✅ |
| P9-03 | Sandbox streams response | E2E | Manual verify | ❌ |

## Sources

### Primary (HIGH confidence)
- `ollama.com` API documentation
- `openrouter.ai` API documentation
- `src/server/providers/` source code
- `src/server/db/schema.ts` source code

### Secondary (MEDIUM confidence)
- Lucide icon set standard roles.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: HIGH

**Research date:** 2025-05-22
**Valid until:** 2025-06-21
