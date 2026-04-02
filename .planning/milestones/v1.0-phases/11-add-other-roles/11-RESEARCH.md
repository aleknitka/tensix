# Phase 11: Add Other Roles & Hierarchical Selection - Research

**Researched:** 2025-05-22
**Domain:** Persona frameworks (SCAMPER, Six Hats), Hierarchical UI patterns, Node.js recursive file scanning, YAML schema design
**Confidence:** HIGH

## Summary

This phase expands the Tensix expert library by introducing multiple cognitive frameworks (SCAMPER, Six Hats) and specialized personas across Business, Technical, and Creative domains. To manage this growth, the storage structure is moving from a flat `roles/` directory to a nested directory structure, and the `RoleSelector` UI is being updated to support hierarchical selection with categories and collapsible sections. The YAML schema is also being upgraded to support all Phase 9 features, including branding (icons, colors), skills, and granular model parameters.

**Primary recommendation:** Implement a recursive glob pattern to automatically derive role categories from their parent directory names, and update the `RoleSelector` to a "Master-Detail" or "Accordion" style layout that groups roles by these categories for better discoverability.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Hierarchical Storage Structure**:
  - Root Directory: `roles/`
  - Subdirectories: `six-hats/`, `scamper/`, `business/`, `technical/`, `creative/`.
- **Database & Schema Updates**:
  - New Column: Add `category` (text) to the `personas` table.
  - Sync Logic: Recursively scan `roles/**/*.yml`. Use the parent directory name as the `category`.
  - Support all Phase 9 fields in the YAML schema (icon_id, color_accent, skills, parameters).
- **Hierarchical UI Selection**:
  - Component: Update `RoleSelector.tsx`.
  - Navigation: Show categories first, expand to show roles. Search across all.
- **Content Expansion**:
  - SCAMPER: 7 distinct roles.
  - Business/Tech/Creative: Specific roles identified in research.
  - Anti-Chattiness: All new roles must include a `chattiness_limit` (defaulting to 3-4 sentences).

### the agent's Discretion
- **Expansion Order**: Which categories to implement first (all together recommended).
- **UI Interaction**: Whether to auto-expand categories on search (recommended).
- **Icon/Color Mapping**: Selection of specific icons/colors for new roles.

### Deferred Ideas (OUT OF SCOPE)
- User-created categories (sticking to directory-based for now).
- Role inheritance (flat schema for now).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ROLE-SCAN | Recursive file scanning for categories | Fast-glob `**/*.yml` and `path.dirname()` extraction documented. |
| ROLE-UI | Hierarchical/Collapsible RoleSelector | React pattern for grouping by `category` and toggle state identified. |
| ROLE-CONTENT | 15+ new roles (SCAMPER, etc.) | Specific prompts and metadata for 17 new roles defined. |
| ROLE-SCHEMA | Update YAML schema for Phase 9 | Mapped Phase 9 database columns to YAML structure. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fast-glob | ^3.3.3 | File discovery | Used in current `role-sync.ts`, supports `**` patterns. |
| js-yaml | ^4.1.1 | Parsing role files | Project's existing YAML parser. |
| zod | ^4.3.6 | Schema validation | Project's existing validation library. |
| Lucide React| ^1.7.0 | Iconography | Standard for project icons; supports `icon_id` lookup. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| clsx / tailwind-merge | - | UI styling | For dynamic category/role card classes. |

## Architecture Patterns

### Recommended Project Structure
```
roles/
├── six-hats/        # Original De Bono framework
├── scamper/         # Substitute, Combine, Adapt, etc.
├── business/        # Business roles (CFO, Customer, etc.)
├── technical/       # Technical roles (Security, Scale, etc.)
└── creative/        # Creative roles (Futurist, Critic, etc.)
```

### Pattern 1: Recursive Sync with Category Extraction
**What:** Using `fast-glob` to find all `.yml` files and using their relative directory as the database `category`.
**When to use:** In `src/server/services/role-sync.ts`.
**Example:**
```typescript
import glob from 'fast-glob';
import path from 'path';

const rolesPath = path.resolve(process.cwd(), 'roles');
const files = await glob('**/*.yml', { cwd: rolesPath });

for (const file of files) {
  const category = path.dirname(file); // 'scamper', 'business', etc.
  const fullPath = path.join(rolesPath, file);
  // ... parse and upsert with category field
}
```

### Pattern 2: Hierarchical UI Selection (Grouping)
**What:** Grouping flat persona data by the `category` field before rendering.
**When to use:** In `src/components/RoleSelector.tsx`.
**Example:**
```typescript
const grouped = personas.reduce((acc, p) => {
  const cat = p.category || 'general';
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(p);
  return acc;
}, {} as Record<string, Persona[]>);

// Render logic:
// Object.entries(grouped).map(([category, items]) => (
//   <CategorySection key={category} title={category} items={items} />
// ))
```

## Role Content Definitions (17 Roles)

### SCAMPER Framework
| Role | Essence | Key Question | Icon | Color |
|------|---------|--------------|------|-------|
| **Substitutor** | Swap components | What can be replaced? | Zap | blue |
| **Combiner** | Merge ideas | What can we combine? | Brain | violet |
| **Adapter** | Borrow context | What else is like this? | Search | green |
| **Transformer** | Scale/Modify | What if we 10x this? | Zap | orange |
| **Repurposer** | Find new use | Who else could use this? | Globe | cyan |
| **Eliminator** | Radical focus | What can we remove? | Shield | slate |
| **Reverser** | Invert process | What if we do opposite? | Flame | rose |

### Business Domain
| Role | Essence | Key Question | Icon | Color |
|------|---------|--------------|------|-------|
| **Customer Advocate** | User empathy | Why would I use this? | UserCircle | blue |
| **Competitor Analyst**| Market edge | What would rivals do? | Search | amber |
| **CFO** | ROI/Viability | Is this profitable? | Database | green |
| **Project Manager** | Execution | Is this timeline real? | Clock | violet |

### Technical Domain
| Role | Essence | Key Question | Icon | Color |
|------|---------|--------------|------|-------|
| **Security Auditor** | Risk/Safety | How can this be hacked? | Lock | rose |
| **Scalability Expert**| Performance | Does it work at 100x? | Zap | cyan |
| **UI/UX Designer** | Aesthetics | Does it feel intuitive? | Feather | indigo |

### Creative Domain
| Role | Essence | Key Question | Icon | Color |
|------|---------|--------------|------|-------|
| **Devil's Advocate** | Logic flaws | What are we missing? | Flame | orange |
| **The Minimalist** | Core essence | How simple can it be? | Shield | slate |
| **The Futurist** | Long-term vision | Is this relevant in 2035?| Globe | violet |

## Updated YAML Schema

```yaml
id: "scamper-substitute"
name: "The Substitutor"
role_type: "critic"
description: "Identifies components that can be replaced to improve efficiency or value."
systemPrompt: "You are the Substitutor. Focus on what can be replaced..."
chattiness_limit: 4
icon_id: "zap"
color_accent: "blue"
skills: 
  - "innovation"
  - "cost-reduction"
parameters:
  temperature: 0.7
  top_p: 1.0
  max_tokens: 500
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hierarchical List | Complex Tree Library | Simple State + Mapping | Only 2 levels (Category -> Role); a heavy library is overkill. |
| File Watching | Custom `fs.watch` | `fast-glob` (re-scan) | Simple re-scan on boot/sync is sufficient and more stable for development. |
| Icon Selection | Custom SVG set | `lucide-react` | Already in the stack, consistent, and maps well to IDs. |

## Common Pitfalls

### Pitfall 1: Directory Name as Category
**What goes wrong:** Using absolute paths or dots (`.`) as categories.
**Why it happens:** `path.dirname()` returns `.` for files in the root.
**How to avoid:** Normalize category names (e.g., `.` -> `general` or `six-hats`).

### Pitfall 2: Search UI Fragility
**What goes wrong:** Categories hiding matching roles because the category header doesn't match the search term.
**Why it happens:** Nested filtering logic can be tricky.
**How to avoid:** Flat-filter the personas first, then group the *results* for display. If searching, auto-expand all categories that contain hits.

### Pitfall 3: Chattiness Drift
**What goes wrong:** New roles becoming too talkative.
**How to avoid:** Enforce `chattiness_limit: 3-4` in the `roleSchema` and include a "conciseness" instruction in the `systemPrompt` for all new templates.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| fast-glob | Sync service | ✓ | 3.3.3 | - |
| js-yaml | Sync service | ✓ | 4.1.1 | - |
| SQLite | Data Layer | ✓ | 3.x | - |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ROLE-SCAN | Categories are correctly extracted from folders | Unit | `npm run test tests/role-sync.test.ts` | ❌ Wave 0 |
| ROLE-SCHEMA | New fields pass validation | Unit | `npm run test tests/roles.test.ts` | ✅ (Update needed) |
| ROLE-UI | Category grouping works in UI | Component | Manual Verify + Component Test | ❌ |

### Wave 0 Gaps
- [ ] `tests/role-sync.test.ts` — Mock filesystem to verify category extraction.
- [ ] Update `tests/roles.test.ts` to include Phase 9 fields.

## Sources

### Primary (HIGH confidence)
- `11-CONTEXT.md` - Goals and category definitions.
- `09-RESEARCH.md` - Phase 9 field definitions (icon_id, color_accent, etc.).
- `fast-glob` documentation - Recursive pattern support.
- SCAMPER Innovation Framework official descriptions.

### Secondary (MEDIUM confidence)
- Business/Technical role "essences" from innovation consulting best practices.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Content: HIGH

**Research date:** 2025-05-22
**Valid until:** 2025-06-21
