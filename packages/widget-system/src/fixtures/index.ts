/**
 * @aiaiai-pt/widget-system/fixtures — versioned CONSUMER CONTRACT fixtures (S2.2 #61).
 *
 * A published, executable contract a consumer (Admin, workspace, Portal) runs
 * against the widget-system implementation IT resolves — proving cross-repo
 * that the package it installed behaves as specified, not just that Sistema's
 * own unit tests pass (#61 non-goal: "no acceptance based solely on unit tests
 * inside Sistema").
 *
 * Design — dependency injection. This module imports ONLY core TYPES, so it is
 * pure and portable: a consumer running it in a plain Node/vitest environment
 * carries no svelte/echarts peer just to load the fixtures. The consumer wires
 * the surface it resolved (`createRegistry`, `byKind`, `resolveWidgetState`, …,
 * and — when it has the svelte/widget layer — `registerBaseWidgets` + the
 * generic widget key/kind constants + `safeEmbedSrc`) into `runContract`.
 *
 * Coverage (#61 AC): registry isolation · dispatch order · native chart ·
 * embedded analysis · complete states · SSR determinism.
 *
 * The FIXTURE schema is versioned independently of the package
 * (`CONTRACT_VERSION`): a consumer pins the fixture version it verified against
 * and attaches the result as parity evidence.
 */

import type {
  Match,
  RegistryEntry,
  SlotImportance,
  StateDecision,
  WidgetMatchContext,
  WidgetRegistry,
  WidgetStatus,
} from "../core/index.ts";

/**
 * Fixture-contract schema version. Bumped only when the SHAPE of the contract
 * changes (a case added/removed/redefined), independently of the package
 * SemVer. Consumers pin this in their migration evidence.
 */
export const CONTRACT_VERSION = "1.1.0";

/** Every observable widget status — the "complete states" enumeration (#61). */
export const ALL_WIDGET_STATUSES: readonly WidgetStatus[] = [
  "loading",
  "ready",
  "stale",
  "empty",
  "error",
  "unauthorized",
  "timeout",
  "unsupported",
  "overflow",
] as const;

/**
 * The generic (core) surface a consumer must inject. Always required — these
 * carry no svelte/echarts peer.
 */
export interface CoreContract {
  createRegistry: <P>() => WidgetRegistry<P>;
  byKind: <P>(key: string, kind: string, component: P) => RegistryEntry<P>;
  byTypeOnKind: <P>(key: string, kind: string, component: P) => RegistryEntry<P>;
  selectEntry: <P>(
    entries: ReadonlyArray<RegistryEntry<P>>,
    ctx: WidgetMatchContext,
  ) => Match<P> | null;
  resolveWidgetState: (
    status: WidgetStatus,
    importance: SlotImportance,
    matched: boolean,
  ) => StateDecision;
  NOT_APPLICABLE: number;
}

/**
 * The svelte/widget layer a consumer MAY inject. Present when the consumer has
 * the `/widgets` subpath wired (Admin/Portal do). When absent, the native-chart
 * and embedded-analysis cases are reported skipped rather than failed, so a
 * core-only consumer can still run the generic contract.
 */
export interface WidgetLayerContract {
  registerBaseWidgets: (registry: WidgetRegistry<unknown>) => void;
  NATIVE_CHART_KIND: string;
  NATIVE_CHART_KEY: string;
  EMBEDDED_ANALYSIS_KIND: string;
  EMBEDDED_ANALYSIS_KEY: string;
  safeEmbedSrc: (raw: string) => string | null;
  /** The card faces. Present once a consumer resolves a version that ships them. */
  INDICATOR_CARD_KIND?: string;
  INDICATOR_CARD_KEY?: string;
}

// ---------------------------------------------------------------------------
// Cross-host placement fixtures
// ---------------------------------------------------------------------------

/**
 * A widget kind is proven by CROSS-HOST PLACEMENT: it must drop into slots
 * opened by any host. A kind that only ever renders on one board is unproven,
 * so these fixtures carry two REAL host slot shapes and assert that the same
 * registered entry answers both.
 *
 * The projection under test is the fixed bridge contract (spec-889): a host's
 * declared block projects into TWO separate things —
 *   Block → WidgetMatchContext  { kind, type? }        (selection)
 *   Block → WidgetRenderRequest { data, props, locale } (render)
 * — and no host vocabulary crosses into widget-system. These fixtures encode
 * the SELECTION half, which is the half that decides whether a kind travels.
 *
 * The two shapes are deliberately unlike each other: different declaration
 * vocabulary, different data provenance (a client board binding vs a
 * server-resolved admin extras read), different callbacks. If a face had
 * absorbed anything host-shaped, one of them would fail to project.
 */
export interface HostSlotFixture {
  /** Which host opened the slot — for evidence, never for dispatch. */
  readonly host: string;
  /** The slot the host opens (board track, extras band, …). */
  readonly slot: string;
  /** The host's own declared block, in that host's own vocabulary. */
  readonly block: Readonly<Record<string, unknown>>;
  /** What a correct adapter must project for SELECTION. */
  readonly expectedContext: WidgetMatchContext;
}

/**
 * Two hosts, one kind. The workspace declares an indicator on an exploration
 * board track; the admin declares one as an `extras` block on a stored
 * `admin_page`, whose value is resolved server-side before render.
 */
export const CROSS_HOST_INDICATOR_SLOTS: readonly HostSlotFixture[] = [
  {
    host: "workspace",
    slot: "board-track",
    block: {
      block_type: "board_card",
      binding: { kind: "indicator", code: "open_occurrences" },
      importance: "optional",
    },
    expectedContext: { kind: "indicator" },
  },
  {
    host: "admin",
    slot: "extras-band",
    block: {
      block_type: "admin_page_extra",
      binding: { kind: "indicator", entity: "occurrence", measure: "count" },
      importance: "optional",
    },
    expectedContext: { kind: "indicator" },
  },
] as const;

/**
 * The SELECTION half of the bridge, as the contract specifies it: read the
 * declared binding kind and the optional type hint, coerce to plain strings,
 * and carry nothing else across. A consumer's real adapter must agree with this
 * on these fixtures.
 */
export function projectMatchContext(
  block: Readonly<Record<string, unknown>>,
): WidgetMatchContext {
  const binding = (block.binding ?? {}) as { kind?: unknown };
  const type = (block as { type?: unknown }).type;
  return {
    kind: String(binding.kind ?? ""),
    ...(typeof type === "string" ? { type } : {}),
  };
}

export type WidgetSystemContract = CoreContract & Partial<WidgetLayerContract>;

/** Framework-agnostic assertion sink — throws (or records) on failure. */
export type Assert = (condition: boolean, message: string) => void;

export type CaseOutcome = "passed" | "skipped";

export interface ContractCase {
  readonly name: string;
  /** Returns "skipped" when the case needs an un-injected optional dependency. */
  readonly run: (c: WidgetSystemContract, assert: Assert) => CaseOutcome;
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

const isolationCase: ContractCase = {
  name: "registry isolation — two registries never observe each other",
  run(c, assert) {
    const r1 = c.createRegistry<string>();
    const r2 = c.createRegistry<string>();
    r1.register(c.byKind("kpi-widget", "kpi", "K"));
    assert(r1.resolve({ kind: "kpi" })?.key === "kpi-widget", "r1 resolves its own entry");
    assert(r2.resolve({ kind: "kpi" }) === null, "r2 cannot see r1's registration");
    return "passed";
  },
};

const dispatchOrderCase: ContractCase = {
  name: "dispatch order — type-specific (20) outranks kind-generic (10); ties → first-registered",
  run(c, assert) {
    const r = c.createRegistry<string>();
    r.register(c.byKind("generic", "kpi", "G"));
    r.register(c.byTypeOnKind("specific", "kpi", "S"));
    assert(r.resolve({ kind: "kpi" })?.key === "generic", "no type hint → kind-generic wins");
    assert(
      r.resolve({ kind: "kpi", type: "specific" })?.key === "specific",
      "matching type hint → type-specific outranks generic",
    );

    // Tie-break: two equal-score entries resolve to the first registered.
    const tie = c.createRegistry<string>();
    tie.register(c.byKind("first", "list", "F"));
    tie.register({
      key: "second",
      payload: "X",
      tester: (ctx) => (ctx.kind === "list" ? 10 : c.NOT_APPLICABLE),
    });
    assert(tie.resolve({ kind: "list" })?.key === "first", "equal scores → first-registered wins");

    // No applicable entry → null (fail-closed).
    assert(r.resolve({ kind: "unmatched" }) === null, "no applicable entry → null");
    return "passed";
  },
};

const nativeChartCase: ContractCase = {
  name: "native chart — kind-generic chart resolves to the native-chart key",
  run(c, assert) {
    if (!c.registerBaseWidgets || !c.NATIVE_CHART_KIND || !c.NATIVE_CHART_KEY) return "skipped";
    const r = c.createRegistry<unknown>();
    c.registerBaseWidgets(r);
    const m = r.resolve({ kind: c.NATIVE_CHART_KIND });
    assert(m !== null, "chart kind resolves a widget");
    assert(m?.key === c.NATIVE_CHART_KEY, "chart kind → native-chart key");
    return "passed";
  },
};

const embeddedAnalysisCase: ContractCase = {
  name: "embedded analysis — embed kind resolves to embedded-analysis; URL sanitised",
  run(c, assert) {
    if (
      !c.registerBaseWidgets ||
      !c.EMBEDDED_ANALYSIS_KIND ||
      !c.EMBEDDED_ANALYSIS_KEY ||
      !c.safeEmbedSrc
    ) {
      return "skipped";
    }
    const r = c.createRegistry<unknown>();
    c.registerBaseWidgets(r);
    const m = r.resolve({ kind: c.EMBEDDED_ANALYSIS_KIND });
    assert(m?.key === c.EMBEDDED_ANALYSIS_KEY, "embed kind → embedded-analysis key");

    // A chart context must never resolve to the embed widget (distinct kinds).
    if (c.NATIVE_CHART_KIND) {
      const chart = r.resolve({ kind: c.NATIVE_CHART_KIND });
      assert(chart?.key !== c.EMBEDDED_ANALYSIS_KEY, "chart kind never resolves the embed widget");
    }

    // Sanitiser: https passes; javascript: is rejected (fail-closed).
    assert(c.safeEmbedSrc("https://analytics.example/embed/1") !== null, "https embed URL allowed");
    assert(c.safeEmbedSrc("javascript:alert(1)") === null, "javascript: scheme rejected");
    return "passed";
  },
};

const completeStatesCase: ContractCase = {
  name: "complete states — all 9 statuses decided; structural stays visible, optional fails soft",
  run(c, assert) {
    // ready/stale WITH a match → render the widget (stale flagged).
    assert(
      c.resolveWidgetState("ready", "optional", true).render === "widget",
      "ready + matched → widget",
    );
    const staleDecision = c.resolveWidgetState("stale", "structural", true);
    assert(staleDecision.render === "widget" && staleDecision.stale === true, "stale + matched → widget flagged stale");

    // ready/stale WITHOUT a match → corrected to unsupported status.
    const orphan = c.resolveWidgetState("ready", "structural", false);
    assert(
      orphan.render === "status" && orphan.effectiveStatus === "unsupported",
      "data reported but no widget → unsupported status",
    );

    // With matched=false every status renders a status affordance (never a
    // widget). Structural slots stay visible for all 9; optional slots collapse
    // for all except the always-shown transient `loading`.
    for (const status of ALL_WIDGET_STATUSES) {
      const structural = c.resolveWidgetState(status, "structural", false);
      const optional = c.resolveWidgetState(status, "optional", false);
      assert(structural.render === "status", `structural ${status} (no match) → status`);
      assert(structural.visible === true, `structural ${status} is visible (never vanishes)`);
      assert(optional.render === "status", `optional ${status} (no match) → status`);
      assert(
        optional.visible === (status === "loading"),
        `optional ${status} fails soft except loading`,
      );
    }
    return "passed";
  },
};

const ssrDeterminismCase: ContractCase = {
  name: "SSR determinism — the pure decision core yields identical output across evaluations",
  run(c, assert) {
    // The renderer's decision core is pure: the same inputs must yield an
    // identical decision every call, so an SSR pass and a client pass agree
    // (no hydration mismatch from environment-dependent state).
    for (const status of ALL_WIDGET_STATUSES) {
      for (const importance of ["optional", "structural"] as SlotImportance[]) {
        for (const matched of [true, false]) {
          const a = c.resolveWidgetState(status, importance, matched);
          const b = c.resolveWidgetState(status, importance, matched);
          assert(
            JSON.stringify(a) === JSON.stringify(b),
            `resolveWidgetState(${status}, ${importance}, ${matched}) is deterministic`,
          );
        }
      }
    }
    // Registry resolution is likewise deterministic for a fixed registry.
    const r = c.createRegistry<string>();
    r.register(c.byKind("w", "kpi", "W"));
    assert(
      JSON.stringify(r.resolve({ kind: "kpi" })) === JSON.stringify(r.resolve({ kind: "kpi" })),
      "registry resolution is deterministic",
    );
    return "passed";
  },
};

/**
 * CROSS-HOST PLACEMENT — the acceptance for a widget kind.
 *
 * Same registered entry, two different hosts' slots, two different declaration
 * vocabularies. This is the case that fails if a face quietly grows a
 * host-shaped assumption.
 */
const crossHostPlacementCase: ContractCase = {
  name: "cross-host placement — one kind answers slots opened by two hosts",
  run(c, assert) {
    if (
      !c.registerBaseWidgets ||
      !c.INDICATOR_CARD_KIND ||
      !c.INDICATOR_CARD_KEY
    ) {
      // A consumer on a version predating the card faces skips rather than fails.
      return "skipped";
    }

    const registry = c.createRegistry<unknown>();
    c.registerBaseWidgets(registry);

    const resolvedKeys: string[] = [];
    for (const fixture of CROSS_HOST_INDICATOR_SLOTS) {
      const ctx = projectMatchContext(fixture.block);
      assert(
        ctx.kind === fixture.expectedContext.kind,
        `${fixture.host}/${fixture.slot}: projects kind "${fixture.expectedContext.kind}"`,
      );
      const match = registry.resolve(ctx);
      assert(
        match !== null,
        `${fixture.host}/${fixture.slot}: the declared kind resolves to a widget`,
      );
      assert(
        match?.key === c.INDICATOR_CARD_KEY,
        `${fixture.host}/${fixture.slot}: resolves to ${c.INDICATOR_CARD_KEY}`,
      );
      resolvedKeys.push(match?.key ?? "");
    }

    assert(
      resolvedKeys.length === CROSS_HOST_INDICATOR_SLOTS.length,
      "every host slot resolved",
    );
    // The point of the case: not merely that each resolved, but that they
    // resolved to the SAME registered entry. Two hosts, one face.
    assert(
      new Set(resolvedKeys).size === 1,
      "both hosts resolve to the SAME registered entry — the card travels",
    );
    return "passed";
  },
};

/** All contract cases, in a stable order. */
export const CONTRACT_CASES: readonly ContractCase[] = [
  isolationCase,
  dispatchOrderCase,
  nativeChartCase,
  embeddedAnalysisCase,
  completeStatesCase,
  ssrDeterminismCase,
  crossHostPlacementCase,
] as const;

export interface ContractRunResult {
  readonly version: string;
  readonly cases: ReadonlyArray<{ name: string; outcome: CaseOutcome }>;
}

/**
 * Run the full contract against an injected implementation. Throws (via the
 * injected `assert`) on the first violation; returns the per-case outcomes
 * (passed/skipped) a consumer attaches as parity evidence.
 */
export function runContract(c: WidgetSystemContract, assert: Assert): ContractRunResult {
  const cases = CONTRACT_CASES.map((cse) => ({ name: cse.name, outcome: cse.run(c, assert) }));
  return { version: CONTRACT_VERSION, cases };
}
