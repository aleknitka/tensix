# Validation: Phase 08 — Markdown Rendering in Chat

This document defines the validation procedures for the rich Markdown rendering system, mapping success criteria from `08-CONTEXT.md` to specific test cases and human verification steps.

## Success Criteria → Validation Map

| Success Criterion | Test Case / Verification Step | Type |
|-------------------|-------------------------------|------|
| Messages correctly render Markdown elements (headers, bold, italics) | `tests/markdown.test.tsx`: "renders basic markdown" | Automated |
| Tables are rendered cleanly using GFM syntax | `tests/markdown.test.tsx`: "renders GFM tables" | Automated |
| Code blocks show syntax highlighting | `tests/markdown.test.tsx`: "renders syntax highlighted code blocks" | Automated |
| "Copy" button successfully copies code to the clipboard | `tests/markdown.test.tsx`: "copy button works" | Automated |
| Dark mode styling is consistent with the application | Manual verification (see Human Verification #1) | Manual |
| All messages (static and streaming) render via Markdown | Manual verification (see Human Verification #2) | Manual |

## Automated Tests

### 1. Markdown Unit Tests
**File:** `tests/markdown.test.tsx`
**Command:** `npm test tests/markdown.test.tsx`

| Test Name | Behavior to Verify |
|-----------|--------------------|
| Renders basic markdown | Headers (`#`), bold (`**`), italics (`_`), and lists (`-`) are transformed to correct HTML tags. |
| Renders GFM tables | Table structures (`|---|`) are transformed to `<table>`, `<thead>`, `<tbody>`, etc. |
| Renders code blocks | Multiline code blocks with language identifiers are wrapped by the syntax highlighter. |
| Copy button functionality | Mocking `navigator.clipboard.writeText` and verifying the button click triggers it and shows feedback. |

## Human Verification

### Verification Step 1: Rich Text & Table Rendering
1. Start a session and send a message containing a mix of:
   - Header levels 1-3.
   - **Bold** and *Italic* text.
   - A bulleted and numbered list.
   - A GFM table (e.g., `| Head | Head | \n |---|---| \n | Cell | Cell |`).
2. **Success Criteria:**
   - Elements are styled according to the Tailwind `prose` palette.
   - Tables are readable and columns are aligned.
   - No raw Markdown syntax (e.g., `**`) is visible.

### Verification Step 2: Code Blocks & Copy Button
1. Prompt an LLM to generate a code block (e.g., "Write a simple React component").
2. **Success Criteria:**
   - Syntax highlighting is applied correctly (vsc-dark-plus theme).
   - Hovering over the code block reveals a "Copy" button.
   - Clicking "Copy" shows "Copied!" for ~2 seconds.
   - Paste the clipboard content into a text editor to verify it's the exact code block content.

### Verification Step 3: Dark Mode Consistency
1. Toggle the system theme between Light and Dark modes.
2. **Success Criteria:**
   - In Light mode: `prose-zinc` styling is applied.
   - In Dark mode: `dark:prose-invert` styling is applied (text becomes light).
   - The overall chat interface remains readable and aesthetically pleasing in both modes.

### Verification Step 4: Streaming Stability
1. Start a session that triggers a long table or code block response.
2. **Success Criteria:**
   - As the response streams, the table/code block does not cause the chat container to jump or resize jarringly.
   - The "Speaking..." indicator (if present) is positioned correctly relative to the new Markdown-rendered message.
