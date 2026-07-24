/**
 * @aiaiai-pt/widget-system/core
 *
 * Generic widget registry, dispatch, display transforms, and chart utilities.
 * Zero Atelier imports. Zero BFF/tenant/auth/ontology vocabulary.
 *
 * S1.1 (#56): type stubs only — implementation follows in S1.2 (#57).
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
// Dispatch — tester/priority core (generic over payload P)
// ---------------------------------------------------------------------------

/** Tester sentinel — "this entry does not apply to this request". */
export const NOT_APPLICABLE = -1;

/**
 * A tester ranks a registry entry against a render request.
 * Returns a score > NOT_APPLICABLE when the entry applies; NOT_APPLICABLE
 * when it does not. Higher scores win ties resolve to first-registered.
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
 * STUB — not yet implemented. S1.2 (#57) fills this in.
 */
export function selectEntry<P, R>(
  _entries: ReadonlyArray<RegistryEntry<P, R>>,
  _request: R,
  _type?: string,
): Match<P> | null {
  throw new Error("selectEntry: not yet implemented — S1.2 #57");
}

/**
 * Fail-closed render decision given whether a widget matched and data resolved.
 *
 * STUB — not yet implemented. S1.2 (#57) fills this in.
 */
export function decideRender(
  _importance: "optional" | "structural" | undefined,
  _matched: boolean,
  _dataOk: boolean,
): RenderDecision {
  throw new Error("decideRender: not yet implemented — S1.2 #57");
}

// ---------------------------------------------------------------------------
// Registry — isolated factory (BD-REG-01)
// ---------------------------------------------------------------------------

/** Opaque registry handle returned by createRegistry(). */
export interface WidgetRegistry<P = unknown, R = WidgetRenderRequest> {
  /**
   * Register a widget entry. Duplicate keys without `override: true` throw
   * loudly (deterministic duplicate policy).
   */
  register(entry: RegistryEntry<P, R>, opts?: { override?: boolean }): void;
  /** Resolve a request to its widget. Returns null when no entry applies. */
  resolve(request: R, type?: string): Match<P> | null;
  /** Introspection: the current entries in registration order (for tests). */
  readonly entries: ReadonlyArray<RegistryEntry<P, R>>;
}

/**
 * Create an isolated registry preloaded with the base DS widgets.
 * Two calls return two independent instances — they cannot observe
 * each other's `register` calls.
 *
 * STUB — not yet implemented. S1.2 (#57) fills this in.
 */
export function createRegistry<
  P = unknown,
  R = WidgetRenderRequest,
>(): WidgetRegistry<P, R> {
  throw new Error("createRegistry: not yet implemented — S1.2 #57");
}

/**
 * Build a registry entry that matches when `request.type === key`
 * (score 20 — type-specific wins over kind-generic).
 *
 * STUB — not yet implemented.
 */
export function byType<P, R extends { type?: string }>(
  key: string,
  component: P,
): RegistryEntry<P, R> {
  throw new Error("byType: not yet implemented — S1.2 #57");
}

/**
 * Build a registry entry that matches a string kind on the request
 * (score 10 — generic).
 *
 * STUB — not yet implemented.
 */
export function byKind<P, R extends { kind?: string }>(
  key: string,
  kind: string,
  component: P,
): RegistryEntry<P, R> {
  throw new Error("byKind: not yet implemented — S1.2 #57");
}
