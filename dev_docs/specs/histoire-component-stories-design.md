# Histoire Component Stories — Isolated Component Development

**Appetite:** Large
**Platform:** SvelteKit 5 + Histoire + Lost Pixel
**Output:** Component stories + visual regression CI + extracted component library
**Date:** 2026-02-21 (spec only — implementation deferred)
**Status:** Spec complete. Not yet scheduled.

---

## Context

The aiaiai design system currently defines components as inline HTML/CSS in SvelteKit demo pages (`site/src/routes/components/*/+page.svelte`). Each page has scoped `<style>` blocks with component CSS. Components are not extracted into reusable `.svelte` files — they exist only as demo specimens.

This works for documentation but has limitations:
- Components can't be imported by consuming projects
- Variants are identified by CSS class combinations, not typed props
- Testing components in isolation requires navigating to the full page
- Visual regression operates at the page level, not the component level

Histoire is the Svelte-native alternative to Storybook. It provides isolated component rendering with stories, hot reload, and visual testing integration.

**Important:** The original CLAUDE.md states "No component code — this is a design system, not a component library." This spec explicitly reverses that decision. The system has matured to the point where consuming projects (Still Phone, Ontograph, Story Canvas, client work) need importable components, not CSS class names to copy. The extraction is earned, not premature.

---

## Jobs-to-be-Done

**Job statement:** When a developer wants to use an aiaiai component in their project, or when a design change needs visual verification, they need isolated, testable, importable components with typed interfaces — not CSS class names copied from a demo page.

### Forces

| Force | Description |
|-------|-------------|
| **Push** | Components exist only as demo page CSS. Can't be imported. Can't be tested in isolation. Visual regression is page-level (noisy, slow). |
| **Pull** | Real `.svelte` components with typed props, isolated stories, per-component visual regression. Consuming projects import components, not copy CSS. |
| **Anxiety** | Extracting components is a large refactor. Risk of breaking the site while extracting. Two representations (components + demo pages) during the transition. |
| **Habit** | The inline CSS approach was chosen deliberately (CLAUDE.md: "No component code — this is a design system, not a component library"). The original spec explicitly deferred component extraction. |

### Users

- **Consuming projects** (Still Phone, Ontograph, Story Canvas, client work) — need importable components with typed props
- **AI agents** running DFG workflows — need component stories as reference for code generation
- **Developers** making component changes — need per-component visual regression, not page-level

---

## Design Principles (for this work)

These extend the system's existing principles to component extraction:

1. **Components earn their extraction** — Only extract components that are used by 2+ consuming projects. Don't extract for the sake of extraction. The 10 components listed in scope are the ones that have proven their value across the demo pages and are needed by downstream projects.

2. **Stories are tests** — Every story is a visual test case. If it renders correctly, the component works. No separate "visual test" step — the story *is* the test.

3. **Props replace class names** — The component API is typed props (`variant="primary"`, `size="md"`), not CSS classes (`.btn-primary .btn-md`). This is the exposed mechanism principle applied to component interfaces — the structure is visible and explicit.

4. **The site becomes a consumer** — After extraction, the demo pages import the components instead of defining them inline. The site dogfoods the component library. This is the same dogfooding principle from the polish pass, applied at the component level.

5. **Extract as-is, then refactor** — Two-step process. First extraction preserves current behavior exactly. Refactoring (new props, improved APIs, CSS cleanup) happens in a separate pass after extraction is verified.

6. **Token layer stays canonical** — Extracted components consume tokens via CSS custom properties. The token files remain the source of truth. Components never hardcode values that should come from tokens.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Component extraction | All 10 listed components extracted to `src/lib/components/` |
| Story coverage | Every component has stories for: default state, all variants, disabled/error states, edge cases |
| Theme coverage | Every story renders correctly in all 3 themes (aiaiai, branded-example, bespoke-example) |
| Visual regression | Lost Pixel baselines for all stories, PR workflow catches regressions |
| Site parity | Demo pages import extracted components and render identically to pre-extraction baselines |
| Page-level regression | Zero visual diff on existing page-level baselines after extraction |
| Import path | Consuming projects can `import { Button } from 'aiaiai-design-system'` |

---

## Scope

### 1. Component Extraction

Extract from inline demo page CSS into standalone `.svelte` files in `src/lib/components/`:

| Component | Current location | Props to expose |
|-----------|-----------------|-----------------|
| Button | `button/+page.svelte` | variant (primary/secondary/ghost/destructive), size (sm/md/lg), disabled, loading, icon |
| Card | `card/+page.svelte` | variant (default/elevated) |
| Badge | `data-display/+page.svelte` | variant (neutral/info/success/warning/error), dot, icon |
| Tag | `data-display/+page.svelte` | removable, onRemove |
| StatusDot | `data-display/+page.svelte` | status (success/warning/error/inactive), pulse |
| Toast | `feedback/+page.svelte` | variant (info/success/warning/error), action, onAction, onDismiss |
| Input | `input/+page.svelte` | type (text/select), size (sm/md/lg), error, disabled, label |
| Toggle | `input/+page.svelte` | checked, disabled, size |
| Checkbox | `input/+page.svelte` | checked, disabled, label |
| NavItem | `navigation/+page.svelte` | active, icon, label, badge |

Each extracted component:
- Lives in `src/lib/components/ComponentName.svelte`
- Uses Svelte 5 `$props()` for typed prop interfaces
- Consumes tokens via CSS custom properties (no hardcoded values)
- Has scoped styles that match the current demo page CSS exactly
- Includes JSDoc or TypeScript annotations for prop types

### 2. Histoire Stories

For each extracted component, create a `ComponentName.story.svelte` file colocated with the component:

- **Default state** — Component with default props
- **All variants** — One story per variant combination (e.g., Button: primary/secondary/ghost/destructive x sm/md/lg)
- **States** — disabled, loading, error, active, etc.
- **Edge cases** — Long text overflow, empty content, minimal content
- **Theme variants** — Each story rendered in all 3 themes (aiaiai, branded-example, bespoke-example)
- **Controls** — Interactive props panel for live exploration

### 3. Visual Regression with Lost Pixel

- Lost Pixel generates baseline screenshots from Histoire stories
- PR workflow: build stories -> screenshot -> diff against baseline
- Per-component granularity (not page-level)
- Theme-aware: separate baselines for each theme variant
- Baseline update workflow: `lost-pixel update` to accept intentional changes
- CI integration: GitHub Actions runs Lost Pixel on every PR

### 4. Site Refactor

After extraction, the demo pages import the extracted components instead of defining CSS inline:

```svelte
<script>
  import Button from '$lib/components/Button.svelte';
</script>

<Button variant="primary" size="md">Create</Button>
```

The demo pages become consumers of the component library — true dogfooding. The page-level layout, section headings, and explanatory text remain in the demo pages. Only the component specimens are replaced with imports.

### 5. Package Export (Stretch Goal)

Configure `package.json` exports so consuming projects can import:

```js
import { Button, Card, Badge } from 'aiaiai-design-system';
```

This requires SvelteKit's `svelte-package` for library mode. The package includes:
- Compiled Svelte components
- TypeScript type definitions
- CSS token dependencies documented in package README

---

## Prerequisite

Visual regression testing (from the site polish pass) should be in place BEFORE this work begins. The page-level baselines serve as a safety net during the extraction refactor — if a page's visual output changes after extracting a component, the regression test catches it.

Without page-level baselines, there is no automated way to verify that extraction preserves the current visual output. Manual comparison is unreliable for 6 component pages x 3 themes = 18 page states.

---

## Known Exception: Button Primary Text Contrast

Carries forward from the polish pass. The extracted Button component with `variant="primary"` inherits the documented WCAG exception: `#faf9f7` on `#ff6b35` at 2.69:1. This is a conscious brand decision, not a bug. The component's story should include a note about this exception.

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Extraction breaks site visuals | High | Page-level visual regression baselines (prerequisite) catch regressions. Extract one component at a time, verify baselines after each. |
| Scope creep to "component library" | Medium | Only extract the 10 components listed. Others stay inline until a consuming project needs them. |
| Histoire + Svelte 5 compatibility | Medium | Check compatibility before starting. Histoire v0.17+ supports Svelte 5. Storybook 9 also supports Svelte 5 as a fallback. |
| CSS specificity changes during extraction | Medium | Scoped styles in `.svelte` files should match current specificity. Test each extraction individually against page-level baselines. |
| Two representations during transition | Low | The transition is one-way: once a component is extracted and the demo page imports it, the inline version is deleted. No long-lived duplication. |
| Token compliance regression | Low | Extracted components must pass the same token compliance checks. No raw `px`/`rem` in spacing, borders, font-size, border-radius. |

---

## Rabbit Holes (Do Not Enter)

- **Don't extract everything** — Only the 10 components in the table. Layout primitives, page scaffolding, and one-off patterns stay inline until a consuming project needs them.
- **Don't build a full component library yet** — This is extraction + stories, not a published npm package. Package export (scope item 5) is the stretch goal, not the core deliverable.
- **Don't rewrite component CSS** — Extract AS-IS first. Refactor after extraction is verified. Two-step process. The temptation to "improve while extracting" leads to untraceable regressions.
- **Don't add new features during extraction** — Extract the current behavior. New variants, new components, new props = separate work.
- **Don't build a custom theme switcher for Histoire** — Use Histoire's built-in variant rendering. Theme switching in stories should use the same CSS class mechanism as the site.
- **Don't pursue SSR for components** — Components render client-side in Histoire stories. SSR compatibility is a concern for consuming projects, not for this spec.

---

## Out of Scope

- New components not in the current system
- Responsive component variants (CSS handles this via media queries in the token layer)
- Interactive testing (click handlers, form submission) — Histoire stories are visual, not behavioral
- Publishing to npm registry (package export is local/workspace only for now)
- Storybook migration (Histoire is the choice for Svelte-native tooling)
- Dark mode variants (architecture supports it, but no dark theme exists yet)
- Component composition patterns (e.g., Card containing Button) — extract individually first
- Accessibility testing automation (axe-core integration) — valuable but separate work

---

## Implementation Order

1. **Verify Histoire + Svelte 5 + SvelteKit compatibility** — Spike: install Histoire, create one trivial story, confirm it builds and renders. If blocked, evaluate Storybook 9 as fallback.

2. **Extract Button** — Smallest, most well-defined component. Validate the full pattern: extract -> write story -> verify page-level baseline -> refactor demo page to import.

3. **Extract remaining 9 components** — Follow the Button pattern. Order by complexity:
   - Simple: Card, StatusDot, Toggle, Checkbox
   - Medium: Badge, Tag, NavItem
   - Complex: Input, Toast

4. **Write stories for all components** — Default, variants, states, edge cases, all three themes.

5. **Set up Lost Pixel visual regression** — Configure Lost Pixel to screenshot Histoire stories. Generate baselines. Wire into GitHub Actions.

6. **Refactor demo pages to import extracted components** — Replace inline CSS specimens with imports. Verify page-level baselines hold.

7. **Package export setup** (stretch goal) — Configure `svelte-package`, define exports, test import from a consuming project.

---

## Future: Self-Built Tokens Studio

This spec is a stepping stone toward a larger vision: aiaiai's own token pipeline (JSON -> CSS/iOS/Android + Figma sync). The extracted components + Histoire stories become the foundation for:

- **Token-to-visual verification** — Change a token value, see which component stories change. Automated impact analysis.
- **Multi-platform component rendering** — Svelte for web, but the token layer feeds iOS/Android native implementations.
- **The importable component library** — What consuming projects actually use instead of copying CSS patterns.
- **AI agent reference** — Component stories as ground truth for DFG code generation. An agent can read the story source to understand the component API, not guess from demo page HTML.
