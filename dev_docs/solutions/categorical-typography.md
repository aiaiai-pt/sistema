# Categorical Typography (Not Linear Scale)

**Context:** Most design systems use a linear type scale (h1-h6 or size-1 through size-10). This creates ambiguity about which size to use where. The aiaiai system uses named categories instead.

## Pattern

Nine categories, each with a fixed role, font family, and visual treatment:

| Category | Font | Role | Example |
|----------|------|------|---------|
| `display` | Sans 600 | Brand moments, hero | Page hero title |
| `heading-lg` | Sans 500 | Page titles | Dashboard title |
| `heading` | Sans 500 | Section headings | Card group title |
| `heading-sm` | Sans 500 | Subsections | Settings group |
| `body` | Sans 400 | Default prose | Paragraph text |
| `body-sm` | Sans 400 | Secondary prose | Help text, descriptions |
| `label` | Mono 400 | Controls, nav, tags | "STATUS", "CATEGORY" |
| `data` | Mono 400 | Numbers, code, metrics | "186 tokens", timestamps |
| `caption` | Sans 400 | Fine print | Footnotes, attributions |

### Key Rule

**Labels and data are always mono.** This is the "exposed mechanism" aesthetic — the interface reveals its structure through monospace type. Sans is the quiet backdrop.

### Token Structure

Each category defines 5 properties:

```css
--type-{category}-font
--type-{category}-size
--type-{category}-weight
--type-{category}-leading
--type-{category}-tracking
```

CSS utility classes (`.type-display`, `.type-label`, etc.) apply all 5 at once.

### Why Not Linear Scale

- **Eliminates "which size?" decisions** — you're choosing a role, not a number
- **Font family is bound to category** — no way to accidentally put a label in sans
- **Bespoke themes can override size per category** — a children's app makes body larger without affecting label proportions
- **Searchable** — grep for `type-label` to find every control label in the codebase

### Anti-Patterns

- Using raw `font-size` or `font-family` in component CSS
- Creating a new size between existing categories (if you need it, the categories are wrong)
- Using `type-body` for a label or `type-label` for prose
