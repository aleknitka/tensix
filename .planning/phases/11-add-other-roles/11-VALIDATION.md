# Phase 11 Validation: Add Other Roles & Hierarchical Selection

This document defines the validation criteria for Phase 11, ensuring the role library expansion and hierarchical UI meet the project's quality and functionality standards.

## 1. Automated Verification (must pass)

| Requirement | Test Command | Target Outcome |
|-------------|--------------|----------------|
| **ROLE-SCHEMA** | `npm test tests/roles.test.ts` | Personas table supports `category` and Phase 9 metadata. |
| **ROLE-SCAN** | `npm test tests/role-sync.test.ts` | Sync service recursively identifies roles and assigns categories based on directory. |
| **ROLE-CONTENT** | `ls roles/scamper/*.yml \| wc -l` | At least 7 SCAMPER roles exist. |
| **ROLE-CONTENT** | `ls roles/business/*.yml \| wc -l` | At least 4 Business roles exist. |
| **ROLE-CONTENT** | `ls roles/technical/*.yml \| wc -l` | At least 3 Technical roles exist. |
| **ROLE-CONTENT** | `ls roles/creative/*.yml \| wc -l` | At least 3 Creative roles exist. |
| **ROLE-UI** | `npm test tests/components/RoleSelector.test.ts` | RoleSelector logic correctly groups personas by category. |

## 2. Observable Truths (UAT)

| Truth | Verification Steps | Expected Result |
|-------|--------------------|-----------------|
| **Hierarchical Storage** | Check `roles/` directory via terminal. | Folder structure exists: `six-hats/`, `scamper/`, `business/`, etc. |
| **Categorized DB** | Query SQLite: `SELECT DISTINCT category FROM personas;` | Returns 'six-hats', 'scamper', 'business', 'technical', 'creative'. |
| **UI Grouping** | Open "Add Persona" in the UI. | Roles are visually grouped under category headers. |
| **Collapsible Sections** | Click a category header in the UI. | The section expands/collapses. |
| **Auto-Expand Search** | Search for "Security" in the role selector. | The "Technical" category expands automatically to show "Security Auditor". |
| **Conciseness** | Start a turn with a new role (e.g., "The CFO"). | Response is limited to 3-4 sentences by default. |

## 3. Artifact Checklist

- [ ] `src/server/db/schema.ts` (category column)
- [ ] `src/server/services/role-sync.ts` (recursive globbing)
- [ ] `roles/six-hats/` (reorganized folder)
- [ ] `roles/scamper/*.yml` (7 files)
- [ ] `roles/business/*.yml` (4 files)
- [ ] `roles/technical/*.yml` (3 files)
- [ ] `roles/creative/*.yml` (3 files)
- [ ] `src/components/RoleSelector.tsx` (hierarchical logic)
- [ ] `tests/role-sync.test.ts` (scaffold & tests)
- [ ] `tests/components/RoleSelector.test.ts` (scaffold & tests)

## 4. Key Link Verification

| Link | Status | Verification Command/Check |
|------|--------|----------------------------|
| YAML Folder -> DB Category | | `npm test tests/role-sync.test.ts` |
| DB Category -> UI Grouping | | `npm test tests/components/RoleSelector.test.ts` |
| Search Match -> Category Expansion | | Manual UI test (Search "Minimalist" -> Creative expands) |
