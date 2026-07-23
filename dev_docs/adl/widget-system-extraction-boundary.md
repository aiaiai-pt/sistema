# ADL — Widget-system extraction and Sistema boundary

> **Status:** approved programme direction; implementation tracked in Sistema #49
>
> **Date:** 2026-07-23
>
> **Sibling prerequisite:** DS-H0 #65
>
> **Current-state warning:** this repository still contains mixed renderer code.
> The target `aiaiai-pt/widget-system` repository/package does not yet exist as a
> released implementation. Classification and characterization precede moves.

## Outcome

Extract one separately versioned generic widget runtime from Sistema's mixed
renderer implementation, migrate real consumers through one compatibility
implementation, and restore `@aiaiai-pt/design-system` to design-system
responsibilities. Do not confuse the extraction with the UBP visual work in
#65: the two programmes run as siblings and publish an explicit compatible
version pair.

## Four layers

```text
@aiaiai-pt/design-system
  semantic tokens · generic schemes · themes · accessibility · visual components
        ↓
@aiaiai-pt/widget-system
  generic render request · isolated registry · dispatch · states · Svelte glue
        ↓
@atelier/*
  Block · Binding · surfaces · providers/actions · BFF · auth/tenant/signing
        ↓
admin / portal / ubp-ai-workspace / admitted hosts
  routes · shell · language · product policy · extensions · lifecycle
```

Dependencies flow down only. “Currently located under `components/renderer/`”
is not an ownership argument.

## Target repositories

### `aiaiai-pt/sistema` — remains the design-system repository

```text
sistema/
├── tokens/
│   ├── base.css
│   ├── semantic.css                  # generic scheme/preference layers
│   ├── components.css
│   └── themes/
│       ├── aiaiai.css
│       ├── valongo.css
│       └── ubp.css                   # delivered by DS-H0 #65, not #49
├── components/                       # resolved-prop visual primitives/components
├── reference/                        # token/theme/component/a11y contracts
├── site/                             # visual and conformance evidence
├── tests/                            # real-component visual/a11y behavior
└── package.json                      # @aiaiai-pt/design-system only
```

After the #49 removal gate, Sistema has no registry, renderer dispatch,
`Block`, `Binding`, provider, BFF, ontology, action, tenant, application or
signing behavior. Compatibility exports may exist temporarily only by
delegating to the one widget-system implementation.

### `aiaiai-pt/widget-system` — new independent repository/release train

```text
widget-system/
├── src/
│   ├── core/                         # framework-neutral contracts + dispatch
│   │   ├── request.ts                # WidgetRenderRequest + validated state input
│   │   ├── registry.ts               # createWidgetRegistry(), never a global singleton
│   │   ├── dispatch.ts               # deterministic priority/tie behavior
│   │   └── states.ts                 # loading/empty/error/forbidden/ready
│   ├── svelte/                       # Svelte adapter; no Atelier route/provider imports
│   └── widgets/                      # transport-neutral widgets over Sistema
│       ├── native-chart/             # resolved chart model + accessible table fallback
│       └── embedded-analysis/        # sanitized short-lived URL only
├── tests/
│   ├── contract/                     # observable behavior; no no-op success
│   ├── isolation/                    # hosts, SSR requests and tests cannot leak
│   └── consumers/                    # generic fixtures, not product paths
├── reference/                        # public API, compatibility, migration
├── package.json                      # @aiaiai-pt/widget-system
├── pnpm-lock.yaml                    # pinned Node 22/pnpm toolchain
└── CHANGELOG.md                      # semantic release and rollback guidance
```

Public exports are deliberately small:

- `@aiaiai-pt/widget-system/core`
- `@aiaiai-pt/widget-system/svelte`
- `@aiaiai-pt/widget-system/widgets`

No wildcard export may accidentally expose internal registry state or consumer
adapters.

## Classification test

Assign every current export using evidence:

| Question | Destination |
|---|---|
| Is it semantic styling, accessibility or a visual primitive over resolved props/callbacks? | Sistema |
| Is it generic registry/dispatch/render-state behavior or a transport-neutral widget request? | Widget system |
| Does it know `Block`, `Binding`, `SurfaceTemplate`, URLs, BFF operations, providers, actions, tenant, grant, application code or signing? | Atelier |
| Does it encode one product's route, noun, language, workflow or policy? | Host |

Unknowns block movement. Repeated use is evidence to inspect, not proof of
generic ownership.

## Contract boundaries

### Widget system owns

- a runtime-validated generic request and explicit result/state model;
- registry factories scoped per host/SSR request/test;
- deterministic selection, override and collision behavior;
- Svelte rendering integration with complete observable states;
- transport-neutral native-chart input: already-resolved chart model and
  accessible fallback metadata;
- transport-neutral embedded-analysis input: already-authorized, sanitized,
  short-lived URL;
- public types, contract tests, changelog, provenance, consumer compatibility
  matrix and rollback version.

### Widget system does not own

- Atelier `Block`/`Binding`/surface vocabulary or provider/action adapters;
- any fetch to ontology/admin-api, tenant selection, grant check or binding
  resolution;
- Metabase resource IDs, parameters, JWT keys or signing;
- auth/session/origin handling, application policy or product routing;
- remote code loading or a plugin marketplace.

Atelier adapters turn a governed `Block`/binding plus authorized provider result
into a generic widget request. The widget system never infers one from the
other.

## Native ECharts and Metabase

Both are supported and never heuristically substituted:

- Native ECharts renders direct, view-bound product interaction from a resolved
  chart model. Sistema owns the EChart visual component; widget-system owns the
  generic transport-neutral wrapper/state contract; Atelier resolves data and
  binding policy.
- Embedded Metabase renders a sanitized short-lived URL. `admin-api` resolves
  the declared binding, authorization, tenant locks and signature. Sistema and
  widget-system never see the signer or choose a dashboard/card.

Consumer parity must prove both roles in Admin, `ubp-ai-workspace`, and Portal
where applicable.

## Theme separation

`tokens/semantic.css` already contains a generic dark scheme. DS-H0 #65 adds
the published UBP theme, typography contract and missing primitives to Sistema.
Atelier owns theme/scheme persistence, pre-paint and hydration. The workspace
owns only its allowlisted `ws.css`. None of this theme work moves to
widget-system, and #49 does not redesign visual components during extraction.

## Migration and removal

1. #50 inventories every renderer/provider/widget/application export and
   records current consumers, target, compatibility path and removal gate.
2. #51/#56 creates the independent repository, strict exports, CI, provenance,
   contract tests and first semantic release.
3. Extract registry/dispatch/states from one implementation. Prove two registry
   instances and two SSR requests cannot leak.
4. Sistema compatibility exports delegate to that implementation; no forked
   copy is permitted.
5. Migrate Admin and the thin workspace host; run Portal compatibility fixtures.
6. Publish consumer/version evidence including the compatible DS-H0 #65
   design-system range and rollback pair.
7. #53 removes renderer/runtime/application semantics from Sistema only after
   zero known consumer imports, and performs the intentional major release.

Every stage keeps a usable release and an explicit rollback. No package is
published, compatibility export removed, or consumer migrated merely by this
steering document.
