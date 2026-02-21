# aiaiai Design System — Typography Reference

Last updated: 2026-02-20

Complete typography specification for the aiaiai design system. Instrument Sans for interface, Berkeley Mono for data. No font appears without a reason.

---

## Font Pairing

| Role | Font Family | Token | Rationale |
|------|------------|-------|-----------|
| Interface (headings, body, captions) | Instrument Sans | `--font-sans` | Geometric, distinctive, good at all UI sizes. Open source. Warm personality without being soft. |
| Data (labels, numbers, code, metrics) | Berkeley Mono | `--font-mono` | Already proven in Ontograph. Distinctive, warm character. Excellent for tabular data. "Exposed mechanism" feel. |

**Fallback stacks:**
- Sans: `"Instrument Sans", sans-serif`
- Mono: `"Berkeley Mono", "JetBrains Mono", ui-monospace, monospace`

---

## Key Rule

**Labels and data are ALWAYS Berkeley Mono.** This is the "exposed mechanism" principle made typographic -- the interface shows its structure through monospace type. Instrument Sans is the quiet backdrop for prose.

| Content Type | Font | Token Reference |
|-------------|------|-----------------|
| Form field labels | Berkeley Mono | `--type-label-font` |
| Navigation item text | Berkeley Mono | `--nav-item-font` |
| Button text | Berkeley Mono | `--button-font` |
| Badge text | Berkeley Mono | `--badge-font` |
| Tag text | Berkeley Mono | `--tag-font` |
| Status text | Berkeley Mono | `--status-font` |
| Key-value keys | Berkeley Mono | `--kv-key-font` |
| Key-value values | Berkeley Mono | `--kv-value-font` |
| Numbers, timestamps | Berkeley Mono | `--type-data-font` |
| Code, metrics | Berkeley Mono | `--type-data-font` |
| Prose, descriptions | Instrument Sans | `--type-body-font` |
| Headings | Instrument Sans | `--type-heading-font` |
| Help text | Instrument Sans | `--input-help-font` |
| Captions, footnotes | Instrument Sans | `--type-caption-font` |
| Toast messages | Instrument Sans | `--toast-font` |
| Empty state text | Instrument Sans | `--empty-body-font` |

---

## Full Type Scale

| Category | Token Prefix | Family | Size | Weight | Line Height | Letter Spacing | Usage | Constraints |
|----------|-------------|--------|------|--------|-------------|----------------|-------|-------------|
| Display | `--type-display-*` | Instrument Sans | 36px (2.25rem) | 600 (semibold) | 1.1 | -0.02em | Hero headings, brand moments | Rare. Max 1 per page. |
| Heading LG | `--type-heading-lg-*` | Instrument Sans | 24px (1.5rem) | 500 (medium) | 1.2 | -0.01em | Page titles | One per page. |
| Heading | `--type-heading-*` | Instrument Sans | 18px (1.125rem) | 500 (medium) | 1.3 | -0.005em | Section headings, card titles | |
| Heading SM | `--type-heading-sm-*` | Instrument Sans | 15px (0.9375rem) | 500 (medium) | 1.4 | 0 | Subsection headings | |
| Body | `--type-body-*` | Instrument Sans | 15px (0.9375rem) | 400 (regular) | 1.5 | 0 | Default prose, descriptions | Max line length: 640px |
| Body SM | `--type-body-sm-*` | Instrument Sans | 13px (0.8125rem) | 400 (regular) | 1.5 | 0.005em | Secondary prose, help text | |
| Label | `--type-label-*` | Berkeley Mono | 12px (0.75rem) | 400 (regular) | 1.3 | 0.04em | Control labels, nav, tags | ALWAYS mono. Uppercase optional. |
| Data | `--type-data-*` | Berkeley Mono | 14px (0.875rem) | 400 (regular) | 1.4 | 0 | Numbers, times, code, metrics | ALWAYS mono. |
| Caption | `--type-caption-*` | Instrument Sans | 11px (0.6875rem) | 400 (regular) | 1.4 | 0.02em | Footnotes, fine print, metadata | Smallest text in system. |

---

## Token Breakdown per Category

### Display

| Property | Token | Value |
|----------|-------|-------|
| Size | `--type-display-size` | `var(--raw-font-size-36)` = 2.25rem (36px) |
| Weight | `--type-display-weight` | `var(--raw-font-weight-semibold)` = 600 |
| Line height | `--type-display-leading` | `var(--raw-line-height-tight)` = 1.1 |
| Letter spacing | `--type-display-tracking` | `var(--raw-tracking-tight)` = -0.02em |
| Font family | `--type-display-font` | `var(--font-sans)` = Instrument Sans |

### Heading LG

| Property | Token | Value |
|----------|-------|-------|
| Size | `--type-heading-lg-size` | `var(--raw-font-size-24)` = 1.5rem (24px) |
| Weight | `--type-heading-lg-weight` | `var(--raw-font-weight-medium)` = 500 |
| Line height | `--type-heading-lg-leading` | `var(--raw-line-height-snug)` = 1.2 |
| Letter spacing | `--type-heading-lg-tracking` | `var(--raw-tracking-snug)` = -0.01em |
| Font family | `--type-heading-lg-font` | `var(--font-sans)` = Instrument Sans |

### Heading

| Property | Token | Value |
|----------|-------|-------|
| Size | `--type-heading-size` | `var(--raw-font-size-18)` = 1.125rem (18px) |
| Weight | `--type-heading-weight` | `var(--raw-font-weight-medium)` = 500 |
| Line height | `--type-heading-leading` | `var(--raw-line-height-heading)` = 1.3 |
| Letter spacing | `--type-heading-tracking` | -0.005em |
| Font family | `--type-heading-font` | `var(--font-sans)` = Instrument Sans |

### Heading SM

| Property | Token | Value |
|----------|-------|-------|
| Size | `--type-heading-sm-size` | `var(--raw-font-size-15)` = 0.9375rem (15px) |
| Weight | `--type-heading-sm-weight` | `var(--raw-font-weight-medium)` = 500 |
| Line height | `--type-heading-sm-leading` | `var(--raw-line-height-relaxed)` = 1.4 |
| Letter spacing | `--type-heading-sm-tracking` | `var(--raw-tracking-normal)` = 0 |
| Font family | `--type-heading-sm-font` | `var(--font-sans)` = Instrument Sans |

### Body

| Property | Token | Value |
|----------|-------|-------|
| Size | `--type-body-size` | `var(--raw-font-size-15)` = 0.9375rem (15px) |
| Weight | `--type-body-weight` | `var(--raw-font-weight-regular)` = 400 |
| Line height | `--type-body-leading` | `var(--raw-line-height-body)` = 1.5 |
| Letter spacing | `--type-body-tracking` | `var(--raw-tracking-normal)` = 0 |
| Font family | `--type-body-font` | `var(--font-sans)` = Instrument Sans |

### Body SM

| Property | Token | Value |
|----------|-------|-------|
| Size | `--type-body-sm-size` | `var(--raw-font-size-13)` = 0.8125rem (13px) |
| Weight | `--type-body-sm-weight` | `var(--raw-font-weight-regular)` = 400 |
| Line height | `--type-body-sm-leading` | `var(--raw-line-height-body)` = 1.5 |
| Letter spacing | `--type-body-sm-tracking` | `var(--raw-tracking-micro)` = 0.005em |
| Font family | `--type-body-sm-font` | `var(--font-sans)` = Instrument Sans |

### Label

| Property | Token | Value |
|----------|-------|-------|
| Size | `--type-label-size` | `var(--raw-font-size-12)` = 0.75rem (12px) |
| Weight | `--type-label-weight` | `var(--raw-font-weight-regular)` = 400 |
| Line height | `--type-label-leading` | `var(--raw-line-height-heading)` = 1.3 |
| Letter spacing | `--type-label-tracking` | `var(--raw-tracking-wider)` = 0.04em |
| Font family | `--type-label-font` | `var(--font-mono)` = Berkeley Mono |

### Data

| Property | Token | Value |
|----------|-------|-------|
| Size | `--type-data-size` | `var(--raw-font-size-14)` = 0.875rem (14px) |
| Weight | `--type-data-weight` | `var(--raw-font-weight-regular)` = 400 |
| Line height | `--type-data-leading` | `var(--raw-line-height-relaxed)` = 1.4 |
| Letter spacing | `--type-data-tracking` | `var(--raw-tracking-normal)` = 0 |
| Font family | `--type-data-font` | `var(--font-mono)` = Berkeley Mono |

### Caption

| Property | Token | Value |
|----------|-------|-------|
| Size | `--type-caption-size` | `var(--raw-font-size-11)` = 0.6875rem (11px) |
| Weight | `--type-caption-weight` | `var(--raw-font-weight-regular)` = 400 |
| Line height | `--type-caption-leading` | `var(--raw-line-height-relaxed)` = 1.4 |
| Letter spacing | `--type-caption-tracking` | `var(--raw-tracking-wide)` = 0.02em |
| Font family | `--type-caption-font` | `var(--font-sans)` = Instrument Sans |

---

## When to Use Each Category

| Scenario | Category | Token Prefix |
|----------|----------|-------------|
| Hero section heading, landing page title | Display | `--type-display-*` |
| Page title (e.g., "Settings", "Dashboard") | Heading LG | `--type-heading-lg-*` |
| Card title, section heading | Heading | `--type-heading-*` |
| Subsection heading, dialog title | Heading SM | `--type-heading-sm-*` |
| Paragraph text, descriptions, long-form | Body | `--type-body-*` |
| Help text, secondary descriptions | Body SM | `--type-body-sm-*` |
| Form field labels, button text, nav items, tags, badges | Label | `--type-label-*` |
| Numbers, timestamps, prices, metrics, table data, code | Data | `--type-data-*` |
| Footnotes, timestamps below content, fine print | Caption | `--type-caption-*` |

---

## Measure Constraints (Max Line Lengths)

| Content Type | Max Width | Token | Characters (approximate) |
|-------------|-----------|-------|-------------------------|
| Prose/body text | 640px | `--content-width-narrow` | ~65-75 characters |
| Standard content | 960px | `--content-width` | Multi-column, not single-column prose |
| Data tables/dashboards | 1200px | `--content-width-wide` | Full data layouts |
| Maximum page width | 1440px | `--content-width-full` | Outer container limit |

**Rule:** Body text (`--type-body-*`) must be constrained to `--content-width-narrow` (640px) for readability. Never let prose run full-width.

---

## Weight Usage Rules

| Weight | Value | Token | When to Use |
|--------|-------|-------|-------------|
| Regular | 400 | `--raw-font-weight-regular` | Body text, labels, data, captions. Default. |
| Medium | 500 | `--raw-font-weight-medium` | Headings. Subtle emphasis without shouting. |
| Semibold | 600 | `--raw-font-weight-semibold` | Display only. Brand moments. Very rare. |

**Rule:** Never use bold (700+). The system achieves hierarchy through size, spacing, and color -- not through weight escalation.

---

## PASS/FAIL Tests

| Test | PASS | FAIL |
|------|------|------|
| Numbers displayed in mono | `font-family: var(--type-data-font)` | Numbers in Instrument Sans |
| Button labels in mono | `font-family: var(--button-font)` | Button text in sans-serif |
| Form labels in mono | `font-family: var(--type-label-font)` | Form labels in sans-serif |
| Prose in sans | `font-family: var(--type-body-font)` | Prose in Berkeley Mono |
| Prose constrained | `max-width: var(--content-width-narrow)` | Body text running 1200px wide |
| Font size from scale | Size matches one of: 11, 12, 13, 14, 15, 18, 24, 36 px | Arbitrary size like 16px or 20px |
| No bold weight | Max weight used is 600 (semibold) | Weight 700 or 800 used |
| Display usage | Max 1 display heading per page | Display (36px) used for section headings |
| Letter spacing on labels | `letter-spacing: 0.04em` | Labels with no letter spacing |
