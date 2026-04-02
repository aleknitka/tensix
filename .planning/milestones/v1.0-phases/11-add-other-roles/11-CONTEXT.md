# Context: Phase 11 — Add Other Roles & Hierarchical Selection

## Goal
Expand the expert template library with multiple cognitive frameworks and specialized personas, organized in a hierarchical structure for easier navigation and discovery.

## Decisions

### 1. Hierarchical Storage Structure
- **Root Directory**: `roles/`
- **Subdirectories**:
  - `six-hats/`: Original De Bono framework.
  - `scamper/`: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse.
  - `business/`: The Customer, The Competitor, The CFO, The Project Manager.
  - `technical/`: The Security Auditor, The Scalability Expert, The UI/UX Designer.
  - `creative/`: The Devil's Advocate, The Minimalist, The Futurist.

### 2. Database & Schema Updates
- **New Column**: Add `category` (text) to the `personas` table.
- **Sync Logic**: 
  - Recursively scan `roles/**/*.yml`.
  - Use the parent directory name as the `category`.
  - Support all Phase 9 fields in the YAML schema (icon_id, color_accent, skills, parameters).

### 3. Hierarchical UI Selection
- **Component**: Update `RoleSelector.tsx`.
- **Navigation**:
  - Show a list of categories first.
  - Clicking a category expands it to show the roles within.
  - Search should work across all categories and roles.

### 4. Content Expansion
- **SCAMPER**: Implement 7 distinct roles focusing on each element of the framework.
- **Business/Tech/Creative**: Implement the specific roles identified in research.
- **Anti-Chattiness**: All new roles must include a `chattiness_limit` (defaulting to 3-4 sentences) to maintain the "non-chatty" standard.

## Success Criteria
- [ ] Roles are physically segregated into subfolders in the `roles/` directory.
- [ ] Sync logic correctly populates the `category` column in the database.
- [ ] `RoleSelector` UI displays roles grouped by category in a hierarchical view.
- [ ] At least 15 new role templates are added across the new categories.
- [ ] New roles follow the conciseness constraints by default.
