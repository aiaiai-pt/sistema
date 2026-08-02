/**
 * @aiaiai-pt/widget-system/core
 *
 * Generic widget registry, dispatch, display transforms, and chart utilities.
 * Zero Atelier imports. Zero BFF/tenant/auth/ontology vocabulary.
 *
 * S1.2 (#57): full implementation of registry, dispatch, and render decisions.
 * S1.3 (#58): observable render states re-exported from ./states.ts.
 * H1 Slice 2 (#57 uw): evidence seal assignment — seal.ts.
 */

// Observable render-state model + the fail-closed state decision (S1.3 #58).
// ./states.ts is pure — it imports only the WidgetRenderRequest TYPE from here.
export * from "./states";

// Evidence seal assignment — the ONLY seal source (H1 Slice 2, uw#57).
// Pure TS: zero Svelte/browser imports, passes the /core purity guarantee.
export * from "./seal";

// ---------------------------------------------------------------------------
// WidgetMatchContext — the selection input (what the registry dispatches on)
// ---------------------------------------------------------------------------

/**
 * Selection input — what the registry dispatches on.
 *
 * A coarse `kind` bucket (e.g. "kpi", "chart", "embed") narrows the candidate
 * set; the optional `type` hint lets a specific widget outrank the kind-generic
 * one. Neither field belongs on the render payload — selection is resolved once
 * from the compiled surface; data arrives per-request and refreshes independently.
 *
 * This matches the JSONForms pattern: the tester sees the descriptor (schema +
 * uischema); the matched control receives the data separately. Selection input
 * and render payload are different objects by design.
 *
 * TH-08: `type` is UNTRUSTED (operator-authored). It only influences ranking;
 * the resolved key always comes from the matched entry's `key` field.
 */
export interface WidgetMatchContext {
  /** Coarse discriminant — matches the kind-generic widget for this bucket. */
  kind: string;
  /**
   * UNTRUSTED variant hint — used for ranking only; never becomes the resolved
   * key (TH-08). A caller passes a `type` to designate a more-specific widget
   * than the kind-generic default.
   */
  type?: string;
}

// ---------------------------------------------------------------------------
// WidgetRenderRequest — the generic per-widget data contract (BD-PROPS-01)
// ---------------------------------------------------------------------------

/**
 * The generic per-widget data contract. Every widget in
 * `@aiaiai-pt/widget-system/widgets` receives this shape.
 * No Atelier vocabulary; no BFF paths; no ontology schema; no `kind`/`type`
 * discriminants — those belong to the match context, not the render payload.
 *
 * Render flow: `const m = registry.resolve({ kind, type }); if (m) renderWidget(m.payload, { data, props, locale });`
 */
export interface WidgetRenderRequest {
  /** The resolved data handed to the widget (schema-free). */
  data: unknown;
  /** Operator-authored config (column defs, labels, limits, chart spec, …). */
  props: Record<string, unknown>;
  /** BCP-47 locale for value formatting only. */
  locale?: string;
}

// ---------------------------------------------------------------------------
// Dispatch — tester/priority core (generic over payload P and match context Ctx)
// ---------------------------------------------------------------------------

/** Tester sentinel — "this entry does not apply to this context". */
export const NOT_APPLICABLE = -1;

/**
 * A tester ranks a registry entry against a match context.
 * Returns a score > NOT_APPLICABLE when the entry applies; NOT_APPLICABLE
 * when it does not. Higher scores win; ties resolve to first-registered.
 *
 * TH-08: the entry `key` is the known-good literal; the context's `type` hint
 * only influences scoring, never the resolved key.
 */
export type WidgetTester<Ctx = WidgetMatchContext> = (ctx: Ctx) => number;

/** An entry in the widget registry. */
export interface RegistryEntry<P, Ctx = WidgetMatchContext> {
  /** Known-good literal key — safe to render in data attributes (TH-08). */
  key: string;
  payload: P;
  tester: WidgetTester<Ctx>;
}

/** The matched entry returned by `selectEntry`. */
export interface Match<P> {
  key: string;
  payload: P;
}

/**
 * The outcome of deciding how a slot should render.
 * - `widget`: a matched widget should be rendered
 * - `empty`: no match, soft-empty (optional slot)
 * - `error`: no match, visible error (structural slot)
 */
export type RenderDecision =
  { render: "widget" } | { render: "empty" } | { render: "error" };

/**
 * Run every tester against the match context; highest applicable score wins.
 * Ties resolve to the first-registered entry (stable, deterministic).
 * Returns `null` when no entry is applicable.
 *
 * TH-08: the returned `key` comes from the matched entry, never from the
 * context's `type` hint.
 */
export function selectEntry<P, Ctx>(
  entries: ReadonlyArray<RegistryEntry<P, Ctx>>,
  ctx: Ctx,
): Match<P> | null {
  let best: RegistryEntry<P, Ctx> | null = null;
  let bestScore: number = NOT_APPLICABLE;
  for (const entry of entries) {
    const score = entry.tester(ctx);
    // Strictly greater: first-registered wins ties.
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  if (best === null) return null;
  // TH-08: key from the matched entry, never from the context.
  return { key: best.key, payload: best.payload };
}

/**
 * Fail-closed render decision given whether a widget matched and data resolved.
 *
 * - matched + dataOk → `{ render: "widget" }`
 * - structural slot, any failure → `{ render: "error" }` (must not vanish)
 * - optional slot, any failure → `{ render: "empty" }` (soft-empty)
 */
export function decideRender(
  importance: "optional" | "structural" | undefined,
  matched: boolean,
  dataOk: boolean,
): RenderDecision {
  if (matched && dataOk) return { render: "widget" };
  return importance === "structural"
    ? { render: "error" }
    : { render: "empty" };
}

// ---------------------------------------------------------------------------
// Registry — isolated factory (BD-REG-01)
// ---------------------------------------------------------------------------

/** Opaque registry handle returned by createRegistry(). */
export interface WidgetRegistry<P = unknown, Ctx = WidgetMatchContext> {
  /**
   * Register a widget entry.
   * Throws when the key already exists unless `override: true` is passed
   * (deterministic duplicate policy — no silent clobbering).
   */
  register(entry: RegistryEntry<P, Ctx>, opts?: { override?: boolean }): void;
  /** Resolve a match context to its widget. Returns null when no entry applies. */
  resolve(ctx: Ctx): Match<P> | null;
  /** Introspection: entries in registration order (for tests / diagnostics). */
  readonly entries: ReadonlyArray<RegistryEntry<P, Ctx>>;
}

/**
 * Create an isolated registry with an independent entries list.
 *
 * Two calls produce two instances that cannot observe each other's
 * `register` calls — the `_entries` array is local to this closure,
 * not a module-level singleton. A deliberate cross-instance leak test
 * will fail: registering in r1 never appears in r2.
 *
 * The initial entries list is empty; hosts preload their own base widgets
 * by calling `registerBaseWidgets(registry)` from
 * `@aiaiai-pt/widget-system/widgets` at startup, avoiding the
 * hidden-coupling of a baked-in default set.
 */
export function createRegistry<
  P = unknown,
  Ctx = WidgetMatchContext,
>(): WidgetRegistry<P, Ctx> {
  // Local (not module-global) — this is what makes instances isolated.
  const _entries: RegistryEntry<P, Ctx>[] = [];

  const registry: WidgetRegistry<P, Ctx> = {
    register(entry, opts) {
      const exists = _entries.some((e) => e.key === entry.key);
      if (exists) {
        if (!opts?.override) {
          throw new Error(
            `[widget-system] Duplicate registry key "${entry.key}". ` +
              "Pass { override: true } to replace an existing entry intentionally.",
          );
        }
        // Replace the existing entry in-place so its position in the list
        // is preserved. Position matters for tie-breaking: first-registered
        // wins when two entries have equal scores, so silently changing the
        // position of an overridden entry would change which entry wins ties
        // involving other registrations — a surprising and hard-to-debug
        // behaviour. Replacing at the same index keeps the contract stable.
        const idx = _entries.findIndex((e) => e.key === entry.key);
        _entries.splice(idx, 1, entry);
        return;
      }
      _entries.push(entry);
    },

    resolve(ctx) {
      return selectEntry(_entries, ctx);
    },

    get entries() {
      return _entries as ReadonlyArray<RegistryEntry<P, Ctx>>;
    },
  };

  return registry;
}

// ---------------------------------------------------------------------------
// Entry builder helpers
// ---------------------------------------------------------------------------

/**
 * Build a registry entry that matches when `ctx.kind === kind` (score 10).
 * The kind-generic widget — used when no more-specific widget is registered.
 *
 * TH-08: the entry `key` is the known-good literal, never derived from the
 * untrusted `ctx.type` hint.
 */
export function byKind<P>(
  key: string,
  kind: string,
  component: P,
): RegistryEntry<P> {
  return {
    key,
    payload: component,
    tester: (ctx) => (ctx.kind === kind ? 10 : NOT_APPLICABLE),
  };
}

/**
 * Build a registry entry that matches when both `ctx.kind === kind` AND
 * the untrusted `ctx.type` hint equals `key` (score 20). A type-specific
 * widget outranks the kind-generic widget for the same kind, per the
 * JSONForms model.
 *
 * TH-08: `ctx.type` is UNTRUSTED (operator-authored) — it only influences
 * ranking; the resolved key always comes from this entry's `key` field.
 */
export function byTypeOnKind<P>(
  key: string,
  kind: string,
  component: P,
): RegistryEntry<P> {
  return {
    key,
    payload: component,
    tester: (ctx) =>
      ctx.kind === kind && ctx.type === key ? 20 : NOT_APPLICABLE,
  };
}
