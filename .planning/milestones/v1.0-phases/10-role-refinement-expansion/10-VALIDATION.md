# Phase 10 Validation: Role Refinement & Expansion

This document maps success criteria from `10-CONTEXT.md` to specific test cases and human verification steps to ensure the persona system is portable and concise.

## 1. Role Selection and Session Integration
**Success Criterion:** "Users can select a role from a dropdown and add it to a session."

### Automated Tests
- `tests/roles.test.ts`: Verify that `RoleSelector` correctly fetches and filters roles from the backend.
- `tests/orchestrator.test.ts`: Verify that roles selected for a session are correctly loaded into the orchestrator's state.

### Human Verification
1. Open a session.
2. Click "Add from Library" in the Round Table configuration.
3. Search for "Black Hat".
4. Select "Black Hat".
5. **Verify:** The role is added to the participant list and prompts for a model assignment if not already set.

## 2. Role Management UI
**Success Criterion:** "Roles can be created/edited in a dedicated UI and saved as portable structures."

### Automated Tests
- `tests/roles.test.ts`: Verify that the `personas` table correctly stores new fields (`chattiness_limit`, `role_type`, `is_predefined`).
- `tests/roles.test.ts`: Verify that custom roles follow the same Zod schema as YAML roles.

### Human Verification
1. Navigate to Settings -> Role Library.
2. Create a new custom role named "The Critic" with `role_type` as `critic`.
3. Save the role.
4. **Verify:** "The Critic" appears in the library list and can be edited.
5. **Verify:** Predefined roles (like "White Hat") cannot be deleted from the UI.

## 3. Anti-Chattiness Enforcement
**Success Criterion:** "LLM responses are noticeably shorter (few sentences) for standard roles."

### Automated Tests
- `tests/orchestrator.test.ts`: Verify `applyChattinessConstraint` correctly appends the conciseness suffix to the system prompt.
- `tests/orchestrator.test.ts`: Verify that roles with `role_type` 'researcher' or 'summarizer' are exempt from the default suffix.
- `tests/orchestrator.test.ts`: Verify that `chattiness_limit` overrides the default suffix with a specific sentence count.

### Human Verification
1. Start a Round Table evaluation with "White Hat" (auditor) and "Summarizer" (summarizer).
2. Use a prompt that would typically elicit a long response (e.g., "Explain Quantum Mechanics").
3. **Verify:** "White Hat" response is extremely concise (3-4 sentences).
4. **Verify:** "Summarizer" response is longer and more detailed.

## 4. YAML Portability
**Success Criterion:** "YAML export/import of a role profile works correctly."

### Automated Tests
- `tests/roles.test.ts`: Verify that `role-sync.ts` correctly parses YAML files from the `roles/` directory and upserts them into the database.
- `tests/roles.test.ts`: Verify that malformed YAML files (missing required fields) are caught by the Zod schema.

### Human Verification
1. Add a new file `roles/expert.yml` manually to the project root.
2. Restart the server.
3. **Verify:** The "Expert" role is automatically available in the "Add from Library" dropdown.
4. (Optional) Check if custom roles can be exported/downloaded as YAML (if implemented in Plan 03).
