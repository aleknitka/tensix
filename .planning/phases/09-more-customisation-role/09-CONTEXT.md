# Context: Phase 9 — More Customisation when defining the role

## Goal
Enhance the persona system with granular controls, visual identity, and live testing capabilities to make role definition more powerful and intuitive.

## Decisions

### 1. Advanced Model Parameters
- **Fields**: Add `temperature`, `top_p`, `max_tokens`, `presence_penalty`, and `frequency_penalty` to the `personas` table.
- **UI**: Add sliders/inputs for these parameters in the `PersonaEditor`.
- **Defaulting**: If unset, parameters will fall back to provider defaults.

### 2. Live Prompt Preview
- **Feature**: A "Sandbox" area within the editor to test the persona before saving.
- **Workflow**: Enter a test prompt -> Select model -> Click "Test" -> View streaming response.
- **State**: The test does not persist to the database.

### 3. Visual Identity (Branding)
- **Icons**: Allow users to select an icon from a predefined set of Lucide icons.
- **Colors**: Support color accents (e.g., `blue`, `emerald`, `amber`, `rose`, `indigo`) to style the persona's avatar and message borders.
- **Storage**: Store as `icon_id` and `color_accent` strings in the database.

### 4. Skills & Metadata
- **Skills**: Add a `skills` column (JSON array of strings) to categorize persona capabilities (e.g., `["audit", "creative", "technical"]`).
- **YAML**: Ensure these new fields are included in the YAML export/import logic implemented in Phase 10.

### 5. Prompt Template Library
- **Feature**: A dropdown or modal in the editor containing common reasoning patterns (e.g., "Chain of Thought", "Socratic", "Direct Answer").
- **Action**: Selecting a template appends it to the current `systemPrompt`.

## Success Criteria
- [ ] Users can configure temperature and other model-specific parameters.
- [ ] Personas can be assigned custom icons and color accents.
- [ ] The editor includes a working sandbox for immediate persona feedback.
- [ ] New metadata (skills, params) is correctly saved and persists across sessions.
- [ ] Reasoning templates can be easily inserted into system prompts.
