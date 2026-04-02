# Summary: 10-02 Sync & Orchestration

## Objective
Implement role schema validation, startup sync service, and anti-chattiness constraints in the orchestrator.

## Changes
### src/server/services/role-schema.ts
- Defined `RoleSchema` using `zod` for strict validation of YAML role definitions.
- Supported fields: `id`, `name`, `description`, `role_type`, `systemPrompt`, `chattiness_limit`.

### src/server/services/role-sync.ts
- Implemented `syncRoles` service using `fast-glob` and `js-yaml`.
- Scans `roles/*.yml` on startup and upserts them into the `personas` table.
- Sets `is_predefined: true` for all filesystem-based roles.

### src/server/orchestrator.ts
- Implemented `applyChattinessConstraint` helper.
- Injected anti-chattiness suffix into system prompts during `runRoundTable`.
- Exempted `researcher` and `summarizer` roles from default limits.
- Supported custom `chattiness_limit` overrides from the database/YAML.

### src/server/index.ts
- Integrated `syncRoles()` into the server startup sequence.

### tests/
- Created `tests/roles.test.ts` verifying YAML parsing and validation.
- Created `tests/orchestrator.test.ts` verifying prompt suffix logic and exemptions.

## Verification
- Ran `npm test tests/roles.test.ts tests/orchestrator.test.ts`.
- Result: **2 test files passed, 7 tests total**.

## Success Criteria
- [x] Role schema validation is active.
- [x] Predefined roles are synced to DB on startup.
- [x] Anti-chattiness constraints are correctly applied in the orchestrator.
- [x] Tests for logic and sync pass.
