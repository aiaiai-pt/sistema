# ADR — Form labels: sentence-case body sans, not uppercase monospace

**Status:** Accepted (2026-05-28)
**Scope:** DS semantic tokens — `--type-label-*` family.
**Origin:** [`westeuropeco/new-multivertical-ontology#63`](https://github.com/westeuropeco/new-multivertical-ontology/issues/63) (action-editor #56 walk, design-critic finding #85 — the single highest-leverage change of the walk).

## Decision

`--type-label-*` is now:

| token | before | after |
|---|---|---|
| `--type-label-font` | `var(--font-mono)` | `var(--font-sans)` |
| `--type-label-weight` | `regular` | `medium` |
| `--type-label-tracking` | `wider` | `normal` |
| `--type-label-size` | `12px` | `12px` (unchanged) |
| `--type-label-leading` | `heading` | `heading` (unchanged) |

Consumers pass labels as **`"Field name"`** (sentence case), not `"FIELD NAME"`. Monospace is reserved for **code tokens** (keys, layout codes, template placeholders, DSL refs) — not labels, breadcrumbs, eyebrows, or section captions.

## Why

The action-editor walk catalogued **11 distinct type treatments** competing for attention; the design-critic identified the uppercase-monospace-for-every-label choice as the **root cause of ~30 % of the visual noise** and the reason the editor reads as a developer tool rather than an operator console. Sample evidence: `ADDITIONAL FIELD KEYS` at reduced size in the criteria modal was genuinely hard to parse; `KEY` / `LABEL` / `DESCRIPTION` etc. competed visually with the actual data they introduced.

Sentence-case sans-medium labels:

- Read as a **language** instead of a code-token style.
- Stay distinct from values (which keep their data font) and from code tokens (which keep monospace).
- Cost nothing extra: the DS already has `--font-sans` and `--raw-font-weight-medium`. The change is three tokens.

## Blast radius

`--type-label-*` cascades into `--input-label-*`, `--button-font`, `--button-tracking`, and component-local label CSS in Input, Select, Textarea, DataTable headers, Modal labels, etc. Every admin consumer (Martha admin, portal, occurrence-manager admin, …) gets sans-medium-normal label rendering automatically on the next publish.

**Strings stay where they are.** A consumer that still passes `label="FIELD NAME"` will render `FIELD NAME` in sans-medium-normal — clearer than before but not yet sentence case. Per-consumer migration of label strings is a separate, non-coordinated rollout that each app does on its own pace (the occurrence-manager admin action-editor migration is the reference example, on the matching app-side PR).

## Out of scope

- **Modal / section titles** (e.g. `DELETE PARAMETER?`, `NEW OPERATION`) remain uppercase nouns for now. They're styled via `--type-heading-*` (not `--type-label-*`) and the action-editor's #66 theme intentionally aligned them as consequence-bar copy. A follow-up may sentence-case them if the post-#63 design review asks.
- **Calendar weekday abbreviations, picker month nav, etc.** — these are not form labels; they retain their existing treatment.
- **Type scale / size / leading.** Only `--type-label-font`, `--type-label-weight` and `--type-label-tracking` change. Size and leading are unchanged so layouts don't reflow.

## Migration checklist for consumers

1. Bump `@aiaiai-pt/design-system` to the version that carries this change.
2. Audit `label="UPPERCASE STRING"` props on `Input`, `Select`, `Textarea`, and the project's modal copy — flip to sentence case.
3. Audit project-local CSS for `text-transform: uppercase` on label/eyebrow/breadcrumb classes — remove unless the text is genuinely a code token (rare; if so, scope the monospace to that class explicitly).
4. Re-capture form-heavy surfaces at typical viewports.

## Reversibility

Pure token edit + ADR; reverting is three lines. The behaviour is purely visual — no API change, no consumer prop breakage.
