# Figma Workflow — Claude Code to Figma

## When to Use

- Sharing component reference with Figma-based collaborators
- Client presentations that need Figma deliverables
- Design exploration that starts from existing components

## How to Capture

1. Run `npm run dev` to start the SvelteKit dev server
2. Navigate to the component or page you want to capture
3. Use Claude Code to Figma to capture the live browser state
4. The captured frame lands in Figma as editable nodes (not a flat image)

To capture a specific theme, switch themes in the site before capturing.

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
