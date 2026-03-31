# Context: Phase 8 — Markdown Rendering in Chat

## Goal
Replace the current plain-text message rendering with a rich Markdown rendering system to support formatted text, headers, lists, tables, and highlighted code blocks.

## Decisions

### 1. Library Selection
- **Core Library**: `react-markdown` will be used to transform Markdown strings into a React component tree.
- **Plugins**: `remark-gfm` must be included to support GitHub Flavored Markdown (tables, task lists, strikethrough).

### 2. Styling Strategy
- **Base Styling**: Use the `@tailwindcss/typography` plugin.
- **Classes**: Apply `prose prose-zinc dark:prose-invert max-w-none` to message containers.
- **Customization**:
  - Ensure links open in a new tab (`target="_blank"`).
  - Adjust margins for lists and paragraphs to fit the compact "chat bubble" aesthetic.

### 3. Code Blocks
- **Highlighter**: `react-syntax-highlighter` (Prism version) for syntax highlighting.
- **Theme**: Use a dark-mode friendly theme (e.g., `vsc-dark-plus` or `atom-dark`).
- **Feature**: Implement a "Copy" button for every code block. This button should be visible on hover and provide feedback (e.g., "Copied!") when clicked.

### 4. Integration Point
- **Target File**: `src/components/DebateView.tsx`.
- **Change**: Replace the `div` with `whitespace-pre-wrap` inside the message loop and the `streamingMessage` view with the new Markdown renderer component.

### 5. Research Directions for Downstream Agents
- Investigate the most stable way to render partial Markdown (streaming) to avoid layout shifts in tables.
- Verify if `next-themes` or the current dark mode setup requires specific `prose` configuration.

## Success Criteria
- [ ] Messages correctly render Markdown elements (headers, bold, italics).
- [ ] Tables are rendered cleanly using GFM syntax.
- [ ] Code blocks show syntax highlighting.
- [ ] "Copy" button successfully copies code to the clipboard.
- [ ] Dark mode styling is consistent with the rest of the application.
