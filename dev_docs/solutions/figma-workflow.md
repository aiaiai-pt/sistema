# Figma Workflow — Claude Code to Figma

## When to Use

- Sharing component reference with Figma-based collaborators
- Client presentations that need Figma deliverables
- Design exploration that starts from existing components

## Setup (One-Time)

**Requirements:** Figma desktop app (not browser), Figma Dev or Full seat, Claude Code.

1. Open a Design file in Figma desktop → enter **Dev Mode** (`Shift+D`) →
   in the Inspect panel, find the MCP server section → click **"Enable desktop MCP server"**
   (runs locally at `http://127.0.0.1:3845/sse`)
2. Connect it to Claude Code:
   ```bash
   claude mcp add --transport sse figma-dev-mode-mcp-server http://127.0.0.1:3845/sse
   ```
3. Restart Claude Code to pick up the new MCP server

## How to Capture

1. Run `npm run dev` to start the SvelteKit dev server
2. Open the Figma desktop app and create or open a Design file
3. Navigate to the component or page you want to capture in the browser
4. Tell Claude Code: **"Send this to Figma"**
5. The captured frame lands in Figma as editable nodes with auto-layout (not a flat image)

To capture a specific theme, switch themes in the site before capturing.

The MCP server is bidirectional — Claude can also read from Figma (components, variables, styles), so changes can flow back to code.

## What Transfers

- Layout structure (flex, grid, positioning)
- Colors (fills, borders, backgrounds)
- Typography (font family, size, weight, line height)
- Spacing (padding, gaps, margins)
- Component hierarchy (nested groups matching DOM structure)

## What Doesn't Transfer

- **Animations / transitions** — Static capture only
- **Interactive states** (hover, focus, active) — Capture each state separately by triggering it before capture
- **Responsive behavior** — Capture at each breakpoint separately (resize browser first)
- **CSS custom properties** — Values are resolved, not preserved as variables

## Decision Guide

| Need | Tool | Why |
|------|------|-----|
| Full-fidelity prototype | Code (SvelteKit site) | Always in sync, interactive, responsive |
| Freeform design exploration | Pencil MCP | Fast AI-assisted visual iteration on a canvas |
| Client deliverables | Claude Code to Figma | Editable Figma frames from live site |
| Cross-team collaboration | Claude Code to Figma | Designers get native Figma files to work with |
| Visual regression testing | Playwright (in consuming project) | Screenshots of real app layouts with real data |
