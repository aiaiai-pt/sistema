# Figma Workflow — Claude Code to Figma

## When to Use

- Sharing component reference with Figma-based collaborators
- Client presentations that need Figma deliverables
- Design exploration that starts from existing components

## Setup (One-Time)

**Requirements:** Figma desktop app, Figma Dev or Full seat (Professional/Organization/Enterprise plan), Claude Code.

There are two MCP servers for different directions:

### Sending UI to Figma (code → design)

Uses the **remote** Figma MCP server. This provides the `generate_figma_design` tool.

```bash
claude mcp add figma-mcp-server https://mcp.figma.com/mcp
```

### Reading from Figma (design → code)

Uses the **desktop** MCP server. Provides `get_design_context`, `get_variable_defs`, etc.

1. Open a Design file in Figma desktop → enter **Dev Mode** (`Shift+D`) →
   in the Inspect panel, find the MCP server section → click **"Enable desktop MCP server"**
2. Connect to Claude Code:
   ```bash
   claude mcp add --transport sse figma-dev-mode-mcp-server http://127.0.0.1:3845/sse
   ```

Restart Claude Code after adding either server.

## How to Capture

1. Run `npm run dev` to start the SvelteKit dev server
2. Navigate to the component or page you want to capture in the browser
3. Tell Claude Code: **"Send this to Figma"** (specify a file URL or "new file")
4. A capture toolbar appears in the browser — select **"Entire screen"** or **"Select element"**
5. The capture lands in Figma as editable frames with auto-layout (not a flat image)

It captures rendered browser state — works the same for localhost, staging, or production. Nothing project-specific about it.

To capture a specific theme, switch themes in the site before capturing.

## What Transfers

- Layout structure (flex, grid, positioning, auto-layout)
- Colors (fills, borders, backgrounds)
- Typography (font family, size, weight, line height)
- Spacing (padding, gaps, margins)
- Component hierarchy (nested groups matching DOM structure)
- Text remains editable, buttons become separate components

## What Doesn't Transfer

- **Animations / transitions** — Static capture only
- **Interactive states** (hover, focus, active) — Capture each state separately by triggering it before capture
- **Responsive behavior** — Capture at each breakpoint separately (resize browser first)
- **CSS custom properties** — Values are resolved, not preserved as variables
- **Code logic** — Event handlers, state management, conditionals are lost

## Decision Guide

| Need | Tool | Why |
|------|------|-----|
| Full-fidelity prototype | Code (SvelteKit site) | Always in sync, interactive, responsive |
| Freeform design exploration | Pencil MCP | Fast AI-assisted visual iteration on a canvas |
| Client deliverables | Claude Code to Figma | Editable Figma frames from live site |
| Cross-team collaboration | Claude Code to Figma | Designers get native Figma files to work with |
| Visual regression testing | Playwright (in consuming project) | Screenshots of real app layouts with real data |
