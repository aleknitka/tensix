# Validation: Phase 9 — More Customisation when defining the role

This document maps success criteria from `09-CONTEXT.md` to specific test cases and human verification steps.

## Success Criteria Mapping

| Criterion | Plan(s) | Verification Method |
|-----------|---------|---------------------|
| Users can configure temperature and other model-specific parameters | 09-01, 09-02 | Automated & Human |
| Personas can be assigned custom icons and color accents | 09-01, 09-02, 09-03 | Human |
| The editor includes a working sandbox for immediate persona feedback | 09-01, 09-03 | Human |
| New metadata (skills, params) is correctly saved and persists across sessions | 09-01, 09-02 | Automated |
| Reasoning templates can be easily inserted into system prompts | 09-03 | Human |

## Test Cases

### TC-01: Parameter Persistence
- **Goal**: Verify that model parameters (temperature, top_p, etc.) are saved and reloaded correctly.
- **Steps**:
  1. Open Persona Editor for a persona.
  2. Set Temperature to 1.5 and Top P to 0.7.
  3. Click "Save".
  4. Refresh the page or navigate away and back.
  5. Verify sliders are still at 1.5 and 0.7.
- **Expected**: Parameters persist across sessions.

### TC-02: Visual Branding Identity
- **Goal**: Verify icons and colors are applied in the chat interface.
- **Steps**:
  1. Create a persona with the "Brain" icon and "Emerald" color.
  2. Start a session with this persona.
  3. Send a message to trigger the persona's turn.
  4. Verify the message avatar shows the "Brain" icon with emerald styling.
- **Expected**: Visual identity is correctly reflected in the UI.

### TC-03: Sandbox Testing (Stateless)
- **Goal**: Verify the sandbox provides feedback without side effects.
- **Steps**:
  1. Open Persona Editor.
  2. Change the System Prompt but do NOT click Save.
  3. Go to the Sandbox section.
  4. Enter a test prompt and click "Test".
  5. Verify the LLM response reflects the *new* unsaved system prompt.
  6. Check session history to ensure no new messages were added there.
- **Expected**: Sandbox uses current editor state and remains stateless.

### TC-04: Template Insertion
- **Goal**: Verify reasoning templates are correctly appended.
- **Steps**:
  1. Open Persona Editor.
  2. Click the "Templates" dropdown.
  3. Select "Chain of Thought".
  4. Verify the template text is appended to the existing System Prompt.
- **Expected**: Templates append text without overwriting existing prompt.

## Automated Verification Commands

```bash
# Verify database columns
sqlite3 sqlite.db ".schema personas" | grep -E "temperature|icon_id|skills"

# Run backend tests (requires mock providers or Ollama running)
npm run test tests/orchestrator.test.ts
```

## Human Verification Gate
- [ ] Confirm sliders provide "Provider Default" feedback when unset.
- [ ] Confirm icon picker shows all 16 predefined Lucide icons.
- [ ] Confirm streaming in the Sandbox works smoothly.
