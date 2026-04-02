# Phase 8: Markdown Rendering in Chat - Research

**Researched:** 2025-05-15
**Domain:** Frontend / UI / Markdown Rendering
**Confidence:** HIGH

## Summary

This phase involves upgrading the chat interface from plain-text rendering to a rich Markdown-capable system. The core stack revolves around `react-markdown` (v10) for parsing, `remark-gfm` for tables and task lists, and `@tailwindcss/typography` for styling. Special attention is given to "streaming stability"—ensuring that partially received Markdown (common in LLM responses) doesn't cause jarring layout shifts, particularly in tables. We will also integrate `next-themes` to support robust dark mode and implement a custom "Copy Code" button for syntax-highlighted code blocks.

**Primary recommendation:** Use `react-markdown` with a custom `code` component that wraps `react-syntax-highlighter` (Prism), and apply `table-layout: fixed` with `min-width` to prevent table-rendering shifts during streaming.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Core Library**: `react-markdown` will be used to transform Markdown strings into a React component tree.
- **Plugins**: `remark-gfm` must be included to support GitHub Flavored Markdown (tables, task lists, strikethrough).
- **Base Styling**: Use the `@tailwindcss/typography` plugin.
- **Classes**: Apply `prose prose-zinc dark:prose-invert max-w-none` to message containers.
- **Highlighter**: `react-syntax-highlighter` (Prism version) for syntax highlighting.
- **Theme**: Use a dark-mode friendly theme (e.g., `vsc-dark-plus` or `atom-dark`).
- **Feature**: Implement a "Copy" button for every code block. This button should be visible on hover and provide feedback (e.g., "Copied!") when clicked.

### the agent's Discretion
- Investigate the most stable way to render partial Markdown (streaming) to avoid layout shifts in tables.
- Verify if `next-themes` or the current dark mode setup requires specific `prose` configuration.

### Deferred Ideas (OUT OF SCOPE)
- (None listed in CONTEXT.md)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REND-01 | Stable streaming of Markdown | CSS-based placeholder strategy and fixed table layout. |
| REND-02 | Tailwind Typography + Dark Mode | Tailwind v4 @plugin and @variant dark setup. |
| REND-03 | Copy Code Button | Custom `code` component with Clipboard API and state feedback. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-markdown` | 10.1.0 | Markdown to React | Standard, secure, highly extensible. |
| `remark-gfm` | 4.0.1 | GFM Support | Adds tables, task-lists, strikethrough. |
| `react-syntax-highlighter` | 16.1.1 | Code Highlighting | Mature, supports Prism/HLJS, React-friendly. |
| `@tailwindcss/typography` | 0.5.19 | Styling | Official plugin for "prose" styling. |
| `next-themes` | 0.4.6 | Theme Management | Industry standard for Next.js dark mode. |

**Installation:**
```bash
npm install react-markdown remark-gfm react-syntax-highlighter next-themes
npm install -D @tailwindcss/typography
```

**Version verification:** 
Versions verified via `npm view` on 2025-05-15.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Markdown.tsx       # New shared component for rendering MD
│   ├── ThemeProvider.tsx  # Next-themes wrapper
│   └── DebateView.tsx     # (Update) Replace content div with <Markdown />
└── app/
    ├── globals.css        # (Update) Tailwind v4 plugin/dark config
    └── layout.tsx         # (Update) Wrap with ThemeProvider
```

### Pattern 1: Stable Streaming Tables
**What:** Use fixed table layout and minimum widths to prevent columns from jumping as text streams in.
**When to use:** All streaming LLM responses.
**Example:**
```css
/* src/app/globals.css */
.prose table {
  table-layout: fixed;
  width: 100%;
}
.prose td, .prose th {
  min-width: 120px; /* Prevents drastic width changes */
  overflow-wrap: break-word;
}
```

### Pattern 2: Copy Code Button Wrapper
**What:** Override `react-markdown`'s `code` component to inject a button.
**Example:**
```tsx
// Source: Community Best Practices (verified)
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  const onCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return !inline && match ? (
    <div className="relative group">
      <button 
        onClick={onCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white p-1 rounded"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <SyntaxHighlighter language={match[1]} style={vscDarkPlus} PreTag="div" {...props}>
        {codeString}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={className} {...props}>{children}</code>
  );
};
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown Parsing | Custom Regex | `react-markdown` | Security (XSS), compliance, edge cases. |
| Table Layout | Pure CSS | `remark-gfm` | Markdown tables require specific AST parsing. |
| Syntax Highlighting | Custom Spans | `react-syntax-highlighter` | Language grammars are complex and heavy. |
| Dark Mode | State Toggle | `next-themes` | Handles system pref, flash prevention, storage. |

## Common Pitfalls

### Pitfall 1: Table "Flip" Shift
**What goes wrong:** A table starts as raw text (e.g., `| Col |`) and suddenly "flips" into a table once the separator line (`|---|`) is received.
**How to avoid:** Use `whitespace-pre-wrap` for the container and ensure the `prose` styles don't conflict. Unfortunately, the "flip" is inherent to GFM parsing, but `table-layout: fixed` ensures that *once* it becomes a table, it stays stable.

### Pitfall 2: Tailwind v4 Plugin Setup
**What goes wrong:** Attempting to use `tailwind.config.js` `require()` syntax.
**Why it happens:** Tailwind v4 is CSS-first.
**How to avoid:** Use `@plugin "@tailwindcss/typography";` in `globals.css`.

### Pitfall 3: Next-Themes Hydration Mismatch
**What goes wrong:** Flash of incorrect theme or React hydration error.
**How to avoid:** Use `suppressHydrationWarning` on the `html` tag and ensure the `ThemeProvider` is a Client Component.

## Code Examples

### Tailwind v4 Typography & Dark Mode Setup
```css
/* src/app/globals.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Enable class-based dark mode for next-themes */
@variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* Base dark mode variables (if not already handled) */
.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

### Markdown Renderer Component (v10)
```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock, // defined above
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

## Open Questions

1. **User Message Styling**
   - What we know: User messages have a dark background in light mode (`bg-zinc-900`).
   - What's unclear: Should user messages always use `prose-invert`?
   - Recommendation: Use `prose-invert` conditionally if `m.role === 'user'`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| npm | Dependency install | ✓ | 10.x | — |
| Next.js | Runtime | ✓ | 15.x | — |
| Tailwind CSS | Styling | ✓ | 4.x | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library (Recommended) |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REND-01 | Tables render via GFM | unit | `npx vitest tests/markdown.test.tsx` | ❌ Wave 0 |
| REND-02 | Prose classes applied | unit | `npx vitest tests/markdown.test.tsx` | ❌ Wave 0 |
| REND-03 | Copy button clicks | integration | `npx vitest tests/markdown.test.tsx` | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] `vitest.config.ts` — Framework setup.
- [ ] `tests/markdown.test.tsx` — Test suite for the new component.

## Sources

### Primary (HIGH confidence)
- [Official Tailwind v4 Docs] - Plugin and Variant setup.
- [react-markdown GitHub] - v10 breaking changes and ESM requirements.
- [next-themes GitHub] - Next.js 15 integration.

### Secondary (MEDIUM confidence)
- [Vercel AI SDK Examples] - Patterns for streaming Markdown stability.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are mature and versions verified.
- Architecture: HIGH - Standard patterns for Next.js/Tailwind.
- Pitfalls: MEDIUM - Streaming layout shifts are tricky and require careful CSS tuning.

**Research date:** 2025-05-15
**Valid until:** 2025-08-15
