# Phase 10: Role Refinement & Expansion - Research

**Researched:** 2024-11-15
**Domain:** Persona Management, YAML Orchestration, Prompt Engineering
**Confidence:** HIGH

## Summary

This phase transforms the static persona system into a portable, YAML-based library. This enables role portability, easier expansion, and specialized constraints like "anti-chattiness." The core technical challenge involves syncing a local `roles/` directory with the SQLite database and implementing a dynamic prompt suffix in the orchestrator to enforce conciseness.

**Primary recommendation:** Use `js-yaml` for parsing and `zod` for strict schema validation of role files. Implement a startup sync service that loads predefined roles from a `roles/` directory into the `personas` table with an `is_predefined` flag.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **YAML-Based Portable Roles**: All roles defined in `.yml` files with standardized fields (`name`, `id`, `description`, `systemPrompt`, `chattiness_limit`, `role_type`).
- **Selection UI**: Searchable dropdown in session view; dedicated "Roles" section in Settings.
- **Anti-Chattiness Enforcement**: Global system prompt suffix for most roles; exempt "researcher" and "summarizer" types.
- **Integration**: Update `src/server/db/schema.ts` and `runRoundTable` orchestrator.

### the agent's Discretion
- Best library for YAML parsing (Recommendation: `js-yaml`).
- Sync strategy for local directory (Recommendation: Startup upsert sync).
- Specific UI implementation for the searchable dropdown.

### Deferred Ideas (OUT OF SCOPE)
- None mentioned in CONTEXT.md.
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `js-yaml` | 4.1.x | YAML parsing/dumping | High performance, industry standard, supports YAML 1.2. |
| `zod` | 3.23.x | Schema validation | Ensures YAML files match the expected structure before database insertion. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `fast-glob` | 3.3.x | File discovery | Quickly find all `.yml` files in the `roles/` directory. |
| `lucide-react` | 0.400+ | Icons | For search, dropdown, and status indicators in the UI. |

**Installation:**
```bash
npm install js-yaml zod fast-glob
npm install --save-dev @types/js-yaml
```

## Architecture Patterns

### Recommended Project Structure
```
roles/               # Authoritative source for predefined YAML roles
├── auditor.yml
├── researcher.yml
└── critic.yml
src/
├── server/
│   ├── services/
│   │   └── role-sync.ts  # Logic to load roles/ into database on startup
│   └── orchestrator.ts   # Updated to apply anti-chattiness logic
└── components/
    └── RoleSelector.tsx # Searchable dropdown component
```

### Pattern 1: Role Schema Validation (Zod)
Using Zod ensures that external YAML files don't crash the application due to missing or malformed fields.

```typescript
// Source: https://zod.dev/
import { z } from 'zod';

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  role_type: z.enum(['auditor', 'researcher', 'summarizer', 'critic', 'other']).default('other'),
  systemPrompt: z.string(),
  chattiness_limit: z.number().optional(),
});

export type RoleDefinition = z.infer<typeof RoleSchema>;
```

### Pattern 2: Startup Sync
On server startup, scan the `roles/` directory and upsert into the `personas` table.

```typescript
// Pattern: Upsert predefined roles
async function syncRoles() {
  const files = await fg('roles/*.yml');
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const data = yaml.load(content);
    const role = RoleSchema.parse(data);
    
    await db.insert(personas).values({
      ...role,
      is_predefined: true,
      // map other fields
    }).onConflictDoUpdate({
      target: personas.id,
      set: { ...role }
    });
  }
}
```

## Database Schema Updates

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `personas` | `chattiness_limit` | INTEGER (NULL) | Max sentences or words (optional override). |
| `personas` | `role_type` | TEXT | Category for logic branching (e.g., "researcher"). |
| `personas` | `is_predefined` | BOOLEAN | Distinguishes `roles/` files from user-created DB records. |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML Parsing | Custom regex/split | `js-yaml` | Handles multi-line strings, escaping, and complex types. |
| Searchable Dropdown | Full custom state | Headless UI or pattern | Accessibility (ARIA), keyboard navigation, and edge cases. |
| File Watching | `fs.watch` | `chokidar` | `fs.watch` is unreliable across platforms and handles atomic writes poorly. |

## Common Pitfalls

### Pitfall 1: Brittle Anti-Chattiness
**What goes wrong:** Adding "Keep it short" to the end of a long system prompt might be ignored by some models (recency bias).
**How to avoid:** Place the constraint at the very end of the system prompt and use strong, imperative language.
**Warning signs:** Roles continue to output 10+ sentences despite the suffix.

### Pitfall 2: YAML ID Collisions
**What goes wrong:** Two developers create `auditor.yml` and `expert.yml` both using `id: expert`.
**How to avoid:** Use the filename as the unique identifier or enforce unique `id` fields during the sync process.

### Pitfall 3: Model Incompatibility
**What goes wrong:** A persona defined in YAML references a `modelId` that isn't pulled in Ollama or available in OpenRouter.
**How to avoid:** Validate `modelId` existence against the `providers` table during the orchestration phase, not just at sync time.

## Code Examples

### Anti-Chattiness Implementation (Orchestrator)
```typescript
const GLOBAL_SUFFIX = "Keep your response extremely concise (max 3-4 sentences) unless your role is 'researcher' or 'summarizer'.";

function applyChattinessConstraint(persona: Persona, prompt: string): string {
  // If specific limit is set in YAML, it takes precedence
  if (persona.chattiness_limit) {
    return `${prompt}\n\nConstraint: Your response must be under ${persona.chattiness_limit} sentences.`;
  }
  
  // Exempt specific types
  if (['researcher', 'summarizer'].includes(persona.role_type)) {
    return prompt;
  }
  
  // Apply global default
  return `${prompt}\n\n${GLOBAL_SUFFIX}`;
}
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | 20.x | — |
| SQLite | Persistence | ✓ | 3.x | — |
| `js-yaml` | Parsing | ✗ | — | Install via npm |
| `zod` | Validation | ✗ | — | Install via npm |

**Missing dependencies with no fallback:**
- `js-yaml`, `zod`, `fast-glob` (Must be installed in Wave 1).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| ROLE-01 | YAML role parsing | Unit | `npm test tests/roles.test.ts` |
| ROLE-02 | Sync roles directory | Integration | `npm test tests/sync.test.ts` |
| CHAT-01 | Anti-chattiness suffix | Unit | `npm test tests/orchestrator.test.ts` |

## Sources

### Primary (HIGH confidence)
- [js-yaml GitHub](https://github.com/nodeca/js-yaml) - Verified version 4.x features.
- [Zod Documentation](https://zod.dev/) - Verified schema validation patterns.
- [Vercel AI SDK](https://sdk.vercel.ai/docs) - Orchestrator pattern verification.

### Secondary (MEDIUM confidence)
- Searchable Dropdown Pattern - Multiple community implementations agreed on the search-filter-list pattern.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `js-yaml` and `zod` are industry standards.
- Architecture: HIGH - Sync/Orchestrator pattern is robust.
- Pitfalls: MEDIUM - Prompt engineering effectiveness varies by model.

**Research date:** 2024-11-15
**Valid until:** 2025-02-15
