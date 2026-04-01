# Context: Phase 10 — Role Refinement & Expansion

## Goal
Transform the persona system into a portable, selection-based library where roles are defined as YAML files and follow strict anti-chattiness constraints.

## Decisions

### 1. YAML-Based Portable Roles
- **Format**: All roles will be defined in `.yml` files.
- **Fields**: Standardized fields: `name`, `id`, `description`, `systemPrompt`, `chattiness_limit` (optional), `role_type` (e.g., "auditor", "researcher").
- **Portability**: Users can export/import these YAML files.
- **Storage**: Pre-defined roles will live in a server-side `roles/` directory. Custom user-created roles will be stored in the database but follow the same YAML structure for export.

### 2. Selection UI
- **Dropdown**: In the session view, users can select from a dropdown of available roles (pre-defined + custom).
- **"Add to Table"**: A single click to add a selected role to the current round-table evaluation.
- **Management**: A dedicated "Roles" or "Library" section in Settings to browse, edit, delete, or create new YAML-based profiles.

### 3. Anti-Chattiness Enforcement
- **Constraint**: Roles are restricted to a "few sentences" by default.
- **Implementation**:
  - Global system prompt suffix: "Keep your response extremely concise (max 3-4 sentences) unless your role is 'researcher' or 'summarizer'."
  - The `chattiness_limit` field in YAML can override this if a specific role needs more depth.
- **Exception**: Special roles like "Summarizer" or "Researcher" are exempt from the 4-sentence limit.

### 4. Integration
- **Backend**: Update `src/server/db/schema.ts` to support the new role structure if necessary.
- **Orchestrator**: Ensure the `runRoundTable` resolves the role definitions from the library before starting.

## Success Criteria
- [ ] Users can select a role from a dropdown and add it to a session.
- [ ] Roles can be created/edited in a dedicated UI and saved as portable structures.
- [ ] LLM responses are noticeably shorter (few sentences) for standard roles.
- [ ] YAML export/import of a role profile works correctly.
