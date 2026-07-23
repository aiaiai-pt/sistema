/**
 * @aiaiai-pt/widget-system/core
 *
 * Generic widget registry, dispatch, display transforms, and chart utilities.
 * Zero Atelier imports. Zero BFF/tenant/auth/ontology vocabulary.
 *
 * S1.2 (#57): full implementation of registry, dispatch, and render decisions.
 */

// ---------------------------------------------------------------------------
// WidgetRenderRequest — the generic per-widget data contract (BD-PROPS-01)
// ---------------------------------------------------------------------------

/**
 * The generic per-widget data contract. Every widget in
 * `@aiaiai-pt/widget-system/widgets` receives this shape.
 * No Atelier vocabulary; no BFF paths; no ontology schema.
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
// Dispatch — tester/priority core (generic over payload P and request R)
// ---------------------------------------------------------------------------

/** Tester sentinel — "this entry does not apply to this request". */
export const NOT_APPLICABLE = -1;

/**
 * A tester ranks a registry entry against a render request.
 * Returns a score > NOT_APPLICABLE when the entry applies; NOT_APPLICABLE
 * when it does not. Higher scores win; ties resolve to first-registered.
 *
 * `type` is the operator-authored widget type hint (UNTRUSTED — used only
 * to influence ranking; the resolved key always comes from the entry, never
 * from the type string — TH-08).
 */
export type WidgetTester<R = WidgetRenderRequest> = (
  request: R,
  type?: string,
) => number;

/** An entry in the widget registry. */
export interface RegistryEntry<P, R = WidgetRenderRequest> {
  /** Known-good literal key — safe to render in data attributes (TH-08). */
  key: string;
  payload: P;
  tester: WidgetTester<R>;
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
  | { render: "widget" }
  | { render: "empty" }
  | { render: "error" };

/**
 * Run every tester against the request; highest applicable score wins.
 * Ties resolve to the first-registered entry (stable, deterministic).
 * Returns `null` when no entry is applicable.
 *
 * TH-08: the returned `key` comes from the matched entry, never from the
 * request's type hint.
 */
export function selectEntry<P, R>(
  entries: ReadonlyArray<RegistryEntry<P, R>>,
  request: R,
  type?: string,
): Match<P> | null {
  let best: RegistryEntry<P, R> | null = null;
  let bestScore: number = NOT_APPLICABLE;
  for (const entry of entries) {
    const score = entry.tester(request, type);
    // Strictly greater: first-registered wins ties.
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  if (best === null) return null;
  // TH-08: key from the matched entry, never from the request.
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
  return importance === "structural" ? { render: "error" } : { render: "empty" };
}

// ---------------------------------------------------------------------------
// Registry — isolated factory (BD-REG-01)
// ---------------------------------------------------------------------------

/** Opaque registry handle returned by createRegistry(). */
export interface WidgetRegistry<P = unknown, R = WidgetRenderRequest> {
  /**
   * Register a widget entry.
   * Throws when the key already exists unless `override: true` is passed
   * (deterministic duplicate policy — no silent clobbering).
   */
  register(entry: RegistryEntry<P, R>, opts?: { override?: boolean }): void;
  /** Resolve a request to its widget. Returns null when no entry applies. */
  resolve(request: R, type?: string): Match<P> | null;
  /** Introspection: entries in registration order (for tests / diagnostics). */
  readonly entries: ReadonlyArray<RegistryEntry<P, R>>;
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
 * at startup, avoiding the hidden-coupling of a baked-in default set.
 */
export function createRegistry<
  P = unknown,
  R = WidgetRenderRequest,
>(): WidgetRegistry<P, R> {
  // Local (not module-global) — this is what makes instances isolated.
  const _entries: RegistryEntry<P, R>[] = [];

  const registry: WidgetRegistry<P, R> = {
    register(entry, opts) {
      const exists = _entries.some((e) => e.key === entry.key);
      if (exists) {
        if (!opts?.override) {
          throw new Error(
            `[widget-system] Duplicate registry key "${entry.key}". ` +
              "Pass { override: true } to replace an existing entry intentionally.",
          );
        }
        // Remove the existing entry, then append the replacement at the end
        // so the override wins ties (last-in position, but score determines
        // the winner anyway; override replaces the entry, not the position).
        const idx = _entries.findIndex((e) => e.key === entry.key);
        _entries.splice(idx, 1);
      }
      _entries.push(entry);
    },

    resolve(request, type) {
      return selectEntry(_entries, request, type);
    },

    get entries() {
      return _entries as ReadonlyArray<RegistryEntry<P, R>>;
    },
  };

  return registry;
}

// ---------------------------------------------------------------------------
// Entry builder helpers
// ---------------------------------------------------------------------------

/**
 * Build a registry entry that matches when `request.kind === kind` (score 10).
 * The kind-generic widget — used when no more-specific widget is registered.
 *
 * TH-08: the entry `key` is the known-good literal, never derived from the
 * untrusted `type` hint.
 */
export function byKind<P, R extends { kind?: string }>(
  key: string,
  kind: string,
  component: P,
): RegistryEntry<P, R> {
  return {
    key,
    payload: component,
    tester: (request) => (request.kind === kind ? 10 : NOT_APPLICABLE),
  };
}

/**
 * Build a registry entry that matches when both `request.kind === kind` AND
 * the untrusted `type` hint equals `key` (score 20). A type-specific widget
 * outranks the kind-generic widget for the same kind, per the JSONForms model.
 *
 * TH-08: `type` is UNTRUSTED (operator-authored) — it only influences ranking;
 * the resolved key always comes from this entry's `key` field.
 */
export function byTypeOnKind<P, R extends { kind?: string }>(
  key: string,
  kind: string,
  component: P,
): RegistryEntry<P, R> {
  return {
    key,
    payload: component,
    tester: (request, type) =>
      request.kind === kind && type === key ? 20 : NOT_APPLICABLE,
  };
}
