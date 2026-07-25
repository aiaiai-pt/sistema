# Memo: widget-system i18n reach + peer isolation

## Q1 — Wuchale does NOT reach widget-system strings. Verdict: NO; use a string-free contract, not a config addition.

**Mechanism (confirmed — wuchale 0.9.7, @wuchale/svelte 0.9.x in occurrence-manager/admin):**
- Extraction scope is the app's own `src/` only. The svelte adapter's default `files` glob is `['src/**/*.svelte', 'src/**/*.svelte.{js,ts}']` (`node_modules/@wuchale/svelte/dist/adapter.js:435`); the vanilla adapter default is `['src/**/*.{js,ts}']` (`wuchale/dist/adapter-vanilla.js:404`). Both hosts use the bare default — `adapters: { main: svelte() }`, no `files` override (admin + portal `wuchale.config.js`).
- The globs are project-root-relative, matched with picomatch/glob (`handler.js:188,211`). `node_modules` is never matched by a `src/**` pattern, and there are ZERO `node_modules` references anywhere in wuchale's dist — it doesn't descend into dependencies.
- Both the extract CLI (`directExtract`, handler.js:205-217) and the Vite build plugin gate on the SAME matcher: the plugin only transforms a file when `adapter.fileMatches(filename)` passes (`wuchale/dist/plugin.js:125`). A file outside `src/**` is neither extracted into `.po` nor wrapped with the `WuchaleTrans` runtime.

**Where the widgets live:** as a dependency, not app source. Admin imports them today from `@aiaiai-pt/design-system/components/StatGrid.svelte` (node_modules; `ExtrasBand.svelte:17`, `SegmentBuilderField.svelte:17`). After Sistema #49 they move to `@aiaiai-pt/widget-system` — still node_modules. Either way, outside every host's `src/**`, so Wuchale never sees them. The operator's assumption ("widgets participate in hosts' i18n automatically") is FALSE.

**Strings they actually contain** (read from `sistema/components/renderer/`):
- `EChartWidget.svelte` / `ResultsChartWidget.svelte`: a11y data-table caption + column headers as hardcoded English FALLBACKS only — `"Results"` (caption), `"Item"` (labelHeader), `"Value"` (valueHeader). Real values come from props (`props.title`, `props.label_header`, `props.value_header`) = caller-supplied. Headings ARE data (`props.title`) — operator right there.
- `display.ts`: `"Yes"/"No"` under `booleanDisplay:"yes-no"` (line 54) — a pure `.ts`, also a dependency file.
- `StatGridWidget.svelte`: no hardcoded UI strings (all from data/props).

**Subtlety:** even if the widgets were under a host's `src/`, only some would extract. Wuchale's svelte heuristic drops script-scope variable strings UNLESS the top-level call is `$derived`/`$derived.by` (`adapter.js:9,21`) and the string starts with a non-lowercase letter (`adapters.js:1-20`). `"Results"/"Item"/"Value"` are `$derived`+capitalized → they WOULD extract in-app; `"Yes"/"No"` sit in a function return in a vanilla `.ts` → extract under `defaultHeuristicFuncOnly`. So the blocker is purely the node_modules boundary, not string shape.

**Could config fix it?** Technically you could add `node_modules/@aiaiai-pt/widget-system/**/*.svelte` (+`**/*.ts`) to each host's `files` — the DS package does ship raw `.svelte` (confirmed present in node_modules). But it's the wrong pattern: (1) extraction runs per-host, so every host re-discovers the strings into ITS own catalog and translations drift host-by-host; (2) the Vite plugin would transform files inside node_modules, injecting `import ... from "@wuchale/svelte/runtime.svelte"` into the generic package's output — the generic widget-system would gain a hard runtime coupling to each host's i18n tool, violating the target's generic→specific dependency direction; (3) fragile against pnpm hoisting and version drift.

**Recommendation — string-free contract (labels always caller-supplied).** Already ~90% the design: title/label_header/value_header/booleanDisplay are props. The one change: stop baking English defaults that masquerade as translatable copy. The host passes the already-Wuchale-wrapped caption/header/Yes-No strings; the widget either requires them or keeps a bare English DEV fallback understood as non-localized. Wrapping happens at the host call site (under its `src/**`), and the widget stays i18n-neutral — matching the workspace CLAUDE.md principle (product/i18n stays in the host; generic packages import nothing host-specific).

## Q2 — Optional peers, not a package split. One (barely-real) external core-only consumer in H0/H1.

**The split is already latent in the files** (imports read in `sistema/components/renderer/`):
- Pure-TS core, ZERO runtime UI deps: `dispatch.ts` (imports only `./types`), `types.ts`, `aggregate.ts`, `chart-spec.ts`, `chart-option.ts` (type-only aggregate import), `grid.ts`, `resolve-data.ts`, `data-provider.ts`, `vote.ts`, `display.ts`. `dispatch.ts`'s header calls itself "component-free and unit-testable."
- Svelte/echarts enter ONLY at `registry.ts` (runtime imports of the 4 `.svelte` widgets; its `import type { Component } from "svelte"` is type-only/erased) and the `.svelte` files.

So `/core` (dispatch + registry factory + projection + data resolution) separates cleanly from `/widgets` (Svelte components).

**Core-only consumer inventory (H0/H1):**

| Candidate | Renders Svelte? | Real in H0/H1? | Citation |
|---|---|---|---|
| widget-system's own generic contract fixtures / dispatch unit tests | No — assert `resolveWidget` returns the right KEY | Yes, but in-repo (same package; no clean external install) | tech-breakdown:761 "generic contract fixtures"; `dispatch.ts`/`registry.ts` docs |
| **widget-adapters** (#881): "Atelier Block → resolved widget **request**" | No — produces a data request, not a component | Yes — but lives in `frontend-platform/` where svelte is already installed | tech-breakdown:761 widget-adapters row |
| BFF-side / server surface resolution | — | No — `resolveWidget` runs client-side today; BFF resolves data, not widgets | admin `src/lib/types/admin-config.ts:435` |
| acceptance-manifest tooling (#31) | UNVERIFIED — not found consuming the registry | Unknown | — (UNVERIFIED) |
| future non-Svelte hosts | — | No — none in H0/H1 (speculative) | — |

Net: exactly ONE external package (widget-adapters) plausibly imports `/core` without rendering, and it lives where svelte is already present — the "install clean" benefit is nearly theoretical in H0/H1. That argues AGAINST a second published package (extra version/release/lockstep burden).

**The pain is real today though:** current `@aiaiai-pt/design-system` declares `echarts`, `svelte`, `ol`, `date-fns` + five codemirror pkgs as NON-optional `peerDependencies` (no `peerDependenciesMeta`). Under pnpm 10.33.2 (this workspace, lockfileVersion 9.0), `autoInstallPeers` defaults to **true** [confirmed via pnpm docs] — so a consumer importing only `./renderer/dispatch` still gets echarts/ol/codemirror auto-installed. Optional peers are excluded from that auto-install and don't warn when absent.

**Recommendation:** ONE `@aiaiai-pt/widget-system` with `/core` + `/widgets` subpath exports; mark the UI peers optional. Split into a second package only when a genuinely svelte-less consumer materializes (Python-side or pure-node BFF resolver, post-H1).

```jsonc
// @aiaiai-pt/widget-system/package.json (sketch)
{
  "name": "@aiaiai-pt/widget-system",
  "exports": {
    "./core":    { "types": "./dist/core/index.d.ts",    "default": "./dist/core/index.js" },
    "./widgets": { "types": "./dist/widgets/index.d.ts",  "svelte": "./dist/widgets/index.js", "default": "./dist/widgets/index.js" },
    "./widgets/*.svelte": "./dist/widgets/*.svelte"
  },
  "peerDependencies": {
    "svelte": "^5.0.0",
    "echarts": "^6.0.0",
    "@aiaiai-pt/design-system": "^0.47.0"
  },
  "peerDependenciesMeta": {
    "svelte": { "optional": true },
    "echarts": { "optional": true },
    "@aiaiai-pt/design-system": { "optional": true }
  }
}
```
- `/core` consumer: installs `@aiaiai-pt/widget-system`, imports `/core` → svelte/echarts/DS not force-installed, no missing-peer error.
- `/widgets` consumer: already carries svelte+echarts+DS (every host does) → optional flag costs nothing.
- **Hard rule for the split to hold:** `/core`'s entrypoint must NEVER transitively import a `.svelte` file or echarts at runtime. `registry.ts` (imports the 4 `.svelte` widgets) therefore belongs to `/widgets`; the generic `createRegistry`/`selectEntry`/`resolveWidget<T>` machinery stays in `/core`. Enforce with a `dependency-cruiser`/`publint` guard: "no svelte/echarts reachable from `/core`."
- **Caveat:** optional peers shift the "install svelte/echarts when you render" burden to the consumer — a forgetful host gets a runtime resolve error instead of an install-time warning. Acceptable (all real `/widgets` consumers are Svelte hosts), but document it in the package README.

---

Files grounding this: `sistema/components/renderer/{dispatch,registry,display,aggregate,chart-option}.ts`, `.../{EChartWidget,ResultsChartWidget,StatGridWidget}.svelte`; `occurrence-manager/{admin,portal}/wuchale.config.js` + `admin/vite.config.ts`; wuchale internals `@wuchale/svelte/dist/adapter.js`, `wuchale/dist/{handler,plugin,adapter-vanilla,adapters}.js`; `wec/atelier-urban-workspace/dev_docs/specs/urban-intelligence-tech-breakdown.md:761`.
