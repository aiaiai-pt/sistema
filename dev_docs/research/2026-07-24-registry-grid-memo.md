# Recommendation memo — widget selection contract (Q1) + grid ownership cut (Q2)

## Q1 — Widget selection contract

**Recommendation: separate `WidgetMatchContext { kind; type? }` from `WidgetRenderRequest { data; props; locale }`. Do NOT fold `kind`/`type` into the render request.** This also folds today's parasitic `type?` positional parameter into the match context, removing it from `selectEntry`/`resolve`/every tester.

### How comparable systems decide "which component handles this"

| System | Selection mechanism | Is the match input the same object the component renders? |
|---|---|---|
| **JSONForms** (the model our code cites) | Scored `rankWith(rank, tester)`; tester signature is `(uischema, schema, context) => number` | **No.** The tester sees the *schema + uischema* (the selection descriptor). The matched control is bound to the *data* separately. Selection input and render payload are different objects — this is exactly our proposed split. |
| **Grafana** panel plugins | Static `type` key in `plugin.json` → `PanelPlugin` export in `module.ts`, resolved at discovery | **No.** Type key selects; the panel component receives `data`/`options` props at render. |
| **VS Code** contribution points | `when`-clause DSL over context keys (`view == …`, `resourceLangId == …`) | **No.** The `when` context (focus/state keys) is a distinct evaluation surface from the resource/URI passed to the invoked command. |
| **Home Assistant** Lovelace | Static `type` string (`custom:foo`) → `createCardElement` resolves the element | **No.** Type string resolves the element; `hass` + config are set on it afterward via `setConfig`. |
| **Kibana/OpenSearch** embeddables | `type` string → `getEmbeddableFactory(type)` | **No.** Type finds the factory; the factory hydrates from serialized *input state* separately. |
| **Palantir Foundry** custom widgets | Declared `type` + `.palantir/widgets.config.json` manifest (params w/ `allowedType`) | **No.** Manifest/type resolves the widget; object-set data is bound as a parameter at runtime. |

**Consensus:** *most systems separate a selection key/descriptor from the runtime data payload, because selection is decided at author/compile time from a discriminator (a type key, a schema, a context predicate) while the data arrives per-request and refreshes independently.* Static-key systems (Grafana/HA/Kibana/Foundry) use a plain `type` string; scored systems (JSONForms — our direct lineage) use a tester over the *descriptor*, never over the rendered data. **Zero of the six** feed the runtime data object into the matcher.

### Why this resolves the reviewer objection correctly

The objection — "`WidgetRenderRequest` lacks `kind`, so the registry cannot dispatch the request it defines" — is real: `byKind`/`byTypeOnKind` (`core/index.ts:200,220`) constrain `R extends { kind?: string }` and read `request.kind`, but `WidgetRenderRequest` (`core/index.ts:19`) has no `kind`. With the default `R = WidgetRenderRequest`, `byKind` can't type-check and `request.kind` is always `undefined`, so nothing matches. The registry is generic over `R` *only* because a richer kind-bearing type has to be smuggled in — that richer type is Atelier's.

The right reading: **the render request was never the correct dispatch input.** Folding `kind`/`type` in (Design B) "fixes" the type error by contaminating the generic payload every widget receives with an Atelier discriminator — the exact ownership error #49 exists to remove. The classification puts `WidgetKind` in **Atelier** (`49-renderer-boundary-classification.md:83`) and D5's "invalid extension" explicitly rejects author/ontology fields on the request. Separation fixes it by admitting these are two objects: the registry dispatches a **match context**; the widget renders a **render request**. The widgets never see `kind` — matching JSONForms exactly (tester sees schema; control sees data).

### Signature sketch (widget-system/core)

```ts
/** Selection input — what the registry dispatches on. Generic: a coarse `kind`
 *  bucket + optional fine `type` hint. No ontology, no BFF, no Block. */
export interface WidgetMatchContext {
  kind: string;
  /** UNTRUSTED variant hint — ranking only; never becomes the resolved key (TH-08). */
  type?: string;
}

/** Render payload — unchanged; what the matched widget receives. */
export interface WidgetRenderRequest { data: unknown; props: Record<string, unknown>; locale?: string }

export type WidgetTester<Ctx = WidgetMatchContext> = (ctx: Ctx) => number;
export interface RegistryEntry<P, Ctx = WidgetMatchContext> { key: string; payload: P; tester: WidgetTester<Ctx> }

export function selectEntry<P, Ctx>(entries: ReadonlyArray<RegistryEntry<P, Ctx>>, ctx: Ctx): Match<P> | null;
export interface WidgetRegistry<P = unknown, Ctx = WidgetMatchContext> {
  register(entry: RegistryEntry<P, Ctx>, opts?: { override?: boolean }): void;
  resolve(ctx: Ctx): Match<P> | null;
  readonly entries: ReadonlyArray<RegistryEntry<P, Ctx>>;
}
export function createRegistry<P = unknown, Ctx = WidgetMatchContext>(): WidgetRegistry<P, Ctx>;

export function byKind<P>(key: string, kind: string, c: P): RegistryEntry<P> =>
  ({ key, payload: c, tester: (ctx) => (ctx.kind === kind ? 10 : NOT_APPLICABLE) });
export function byTypeOnKind<P>(key: string, kind: string, c: P): RegistryEntry<P> =>
  ({ key, payload: c, tester: (ctx) => (ctx.kind === kind && ctx.type === key ? 20 : NOT_APPLICABLE) });
```

Render flow: `const m = registry.resolve({ kind, type }); if (m) renderWidget(m.payload, { data, props, locale });`

Side wins: `byKind`/`byTypeOnKind` drop the `R extends { kind?: string }` bound (default `Ctx` already has `kind`); the `type?` positional arg disappears from `selectEntry`/`resolve`/tester signatures (it was only ever separate because it couldn't live on the render request); a caller can no longer pass a `type` that silently disagrees with the request.

Why it fits our other constraints: **conformance/testability** — the headless dispatch test (the Alt-A rejection driver) builds `{ kind:'kpi', type:'stat-grid' }` with no `data`/`props`, so selection is testable without payload shape or DS components — consistent with dispatch.ts's HIGH-confidence "component-free" classification. **SSR/caching** — selection runs once from the compiled surface and memoizes across data refreshes (the map/kpi refresh path). **Non-Svelte consumers** — the match context is pure data. **Atelier adapter** — builds two pure projections from one Block: `Block → WidgetMatchContext` for `resolve`, `Block → WidgetRenderRequest` for the widget; `kind`/`type` stay Atelier's and never enter the widget payload.

**Strongest counterargument (for folding — Design B), and why it loses:** *Two objects = two adapters = desync risk (resolve on one kind, render data shaped for another); one object guarantees the widget sees exactly the fields it matched on.* It loses because the desync is illusory **here**: selection consumes `kind`/`type`, rendering consumes `data`/`props` — there is no shared field to desync. The single-object "convenience" is precisely the boundary violation #49 removes (Atelier `kind` welded onto the generic contract). And B's ergonomics are recoverable without its cost: `AtelierWidgetProps extends WidgetRenderRequest`, with both projections derived from the same source Block — one source of truth, narrow registry projection. Note the precedent: `decideRender` is pure and import-free yet classified **widget-system**, not Sistema — ownership follows semantic layer, not the import graph.

---

## Q2 — Grid ownership cut

**Recommendation: Review 2's principle, with a precise seam. The design system (Sistema) owns the placement PRIMITIVE — "given a validated placement, produce grid CSS." The app-platform (Atelier surface-runtime) owns the composition POLICY — "does this surface become a grid, and how do unplaced blocks fall back."** This requires a small revision to the #54 classification, which currently lumps all of `grid.ts` (including `hasGridLayout`) into Sistema.

### What the research says about the DS-vs-platform layout split

- **Material / Chakra / Carbon (design systems)** ship a grid *primitive* — `Grid`/`SimpleGrid`/`Col` with `columns`, `colSpan`, `gap` and the CSS. They own the *mechanism* (a 12-col track, span math, breakpoints). They never decide "this particular page is a grid" — the app composes the primitive.
- **Grafana / dashboard runtimes** own panel grid placement: `gridPos {x,y,w,h}` lives in the *dashboard model* and the *dashboard runtime* decides layout; the panel just renders. "The page is a grid" is owned by the app-platform layer; each panel's coordinate is data in the dashboard model.

Both map to the same cut: **DS owns "how to be a grid"; the dashboard/app-platform owns "this surface is a grid."**

### Function-level split

| Item (`grid.ts`) | Owner | Why |
|---|---|---|
| `GRID_COLUMNS` (=12) | **Sistema** | the DS grid track definition — effectively a token |
| `BlockLayout {x,y,w,h}` → rename `GridPlacement` | **Sistema** | generic placement coordinate; no Block/BFF/ontology (already slated to move into grid.ts per BD-GRID-01) |
| `normalizeLayout(p)` | **Sistema** | pure clamp math over a placement |
| `gridStyleFor(p)` | **Sistema** | pure per-item CSS (`grid-column`/`grid-row`) from a placement; take the placement/`HasLayout`, not `Block` |
| *(new)* grid-container CSS helper | **Sistema** | "how to be a 12-col grid" — the mechanism, so both hosts share it |
| page-mode decision ("grid vs stacked list") + source-order fallback for unplaced blocks | **Atelier surface-runtime** | composition policy over the Block/Surface page model — `SurfaceTemplate` vocabulary (CLAUDE.md layer 3) |
| `hasGridLayout(blocks)` as named | **move to Atelier** (or keep a renamed generic predicate `anyPlaced(items)` in Sistema that Atelier's composition calls) | the predicate ("does any item carry coords") is generic, but its docstring semantic — "the PAGE should render as a grid" — is composition policy |

Concretely: keep `GRID_COLUMNS`, `GridPlacement`, `normalizeLayout`, `gridStyleFor`, and a container-CSS helper in Sistema (DRY mechanism both hosts share). Move the `hasGridLayout` *semantic* — page-becomes-grid + source-order fallback — into Atelier's SurfaceTemplate composition; if you keep the pure predicate in Sistema, rename it `anyPlaced` so the DS ships a fact, not a page-mode policy.

**Strongest counterargument (for Review 1 — keep all in Sistema), and why it loses:** *Once `Block` becomes `HasLayout` the whole 40-line module is pure CSS with zero Atelier imports; splitting it across a package boundary for a semantic distinction adds an import hop and risks the grid primitive and the page-mode decision drifting — and the module's own comment stresses it's shared by both hosts "so the arrangement is identical and DRY."* It loses because **DRY is preserved either way** — the mechanism (`normalize` + CSS) stays one DS module both hosts import; only the policy moves, and that policy is *already* surface-specific (a portal page and an admin dashboard may legitimately choose different composition rules over the same primitive — that's the definition of an Atelier `SurfaceTemplate` concern). The "zero imports ⇒ design-system" argument conflates *absence of a type import* with *layer ownership*; the classification's own governing principle is that ownership follows **semantics, not location/imports** (`49-renderer-boundary-classification.md:15`; BD-REG/BD-PROPS turn on *vocabulary*, not the import graph). The clinching precedent is again `decideRender`: pure, import-free, and still classified **widget-system runtime rather than Sistema** — so "`hasGridLayout` has no imports" no more makes it a design-system concern than it did for `decideRender`. "A page becomes a grid" is composition vocabulary; being structurally typeable doesn't relocate it to the design system.

---

*Note: Q2 as recommended contradicts the current `49-renderer-boundary-classification.md` row (line 162), which assigns `hasGridLayout` to Sistema. Adopting Review 2 means amending that one row; the rest of the grid.ts rows (`GRID_COLUMNS`, `normalizeLayout`, `gridStyleFor`, `BlockLayout`) stand as-is. No files changed — this is advisory.*
