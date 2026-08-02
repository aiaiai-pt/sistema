/**
 * @aiaiai-pt/widget-system/core — observable render states (S1.3 #58).
 *
 * The generic, transport-neutral state model a host hands the renderer. The
 * widget-system never fetches, authorises, or times anything itself: a host
 * resolves its own transport/provider/policy and reports the OUTCOME as a
 * `WidgetState`. This file is pure (zero runtime imports) so it stays under the
 * `/core` purity guarantee enforced by the structural guard.
 *
 * Two ideas here:
 *  1. `WidgetState` — the discriminated union of every observable state a slot
 *     can be in. `ready`/`stale` carry a `WidgetRenderRequest` (the data to
 *     render); the rest are terminal status states with no payload.
 *  2. `resolveWidgetState` — the pure, fail-closed decision the Svelte renderer
 *     consumes: given the reported status, the slot's importance, and whether a
 *     widget actually matched, decide whether to render the widget (optionally
 *     flagged stale) or a status, and — for a status — whether it is VISIBLE
 *     (structural slots must never silently vanish) or soft-empty (optional).
 */

import type { WidgetRenderRequest } from "./index";

/**
 * Every observable status a widget slot can report. `ready`/`stale` mean "there
 * is data to render"; the remainder are terminal presentation states.
 *
 * - `loading`      — the host is still resolving; show a busy affordance.
 * - `ready`        — data resolved; render the widget.
 * - `stale`        — data resolved but known out of date; render + flag it.
 * - `empty`        — resolved to nothing (no rows / no result).
 * - `error`        — the host's resolution failed.
 * - `unauthorized` — the caller may not see this slot's data.
 * - `timeout`      — resolution exceeded the host's budget.
 * - `unsupported`  — no widget in the registry matches the context.
 * - `overflow`     — the result exceeds what this slot can render.
 */
export type WidgetStatus =
  | "loading"
  | "ready"
  | "stale"
  | "empty"
  | "error"
  | "unauthorized"
  | "timeout"
  | "unsupported"
  | "overflow";

/**
 * The state a host reports for one slot. `ready`/`stale` carry the render
 * request; every other state is payload-free. `error` may carry a non-UI
 * `detail` for diagnostics/logging — never a user-facing string (D9: all
 * user-visible copy is caller-supplied via the renderer's `messages`).
 */
export type WidgetState =
  | { status: "loading" }
  | { status: "ready"; request: WidgetRenderRequest }
  | { status: "stale"; request: WidgetRenderRequest }
  | { status: "empty" }
  | { status: "error"; detail?: string }
  | { status: "unauthorized" }
  | { status: "timeout" }
  | { status: "unsupported" }
  | { status: "overflow" };

/** The importance of a slot — drives the fail-closed decision (D5/decideRender). */
export type SlotImportance = "optional" | "structural";

/**
 * Extract the render request from a state, or `null` when the state carries no
 * data (every state except `ready`/`stale`). Pure narrowing helper.
 */
export function stateRequest(state: WidgetState): WidgetRenderRequest | null {
  return state.status === "ready" || state.status === "stale"
    ? state.request
    : null;
}

/**
 * The renderer's decision for one slot.
 *
 * - `render: "widget"` — mount the matched widget with the render request.
 *   `stale` is true when the reported status was `stale` (render + flag).
 * - `render: "status"` — show a status affordance for `effectiveStatus`.
 *   `visible` is true when the status must be shown (a structural slot, or the
 *   always-shown transient `loading`); false means soft-empty — the slot
 *   collapses to nothing (the optional-slot contract).
 */
export interface StateDecision {
  render: "widget" | "status";
  /**
   * The status after correction: a reported `ready`/`stale` with NO matching
   * widget becomes `unsupported` (the registry, not the host, is the authority
   * on whether a widget exists for the context).
   */
  effectiveStatus: WidgetStatus;
  /** Only meaningful when `render === "widget"`. */
  stale: boolean;
  /** Only meaningful when `render === "status"`. */
  visible: boolean;
}

/**
 * The fail-closed core of the renderer (pure — unit-testable without a DOM).
 *
 * Decision table:
 *  - reported `ready`/`stale` AND a widget matched → render the widget (flag
 *    stale for `stale`).
 *  - reported `ready`/`stale` but NO widget matched → `unsupported` status: the
 *    host claimed data but nothing can render it. Corrected here so a missing
 *    registration can never render as a silent blank on a structural slot.
 *  - every other status → a status affordance. It is VISIBLE when the slot is
 *    `structural` (must not vanish) or the status is the transient `loading`
 *    (always shown); otherwise it is soft-empty (optional slots fail soft, per
 *    `decideRender`).
 *
 * This mirrors `decideRender` (structural→visible, optional→soft) but over the
 * full 9-state model instead of the 3-way widget/empty/error outcome.
 */
export function resolveWidgetState(
  status: WidgetStatus,
  importance: SlotImportance,
  matched: boolean,
): StateDecision {
  const hasData = status === "ready" || status === "stale";

  if (hasData && matched) {
    return {
      render: "widget",
      effectiveStatus: status,
      stale: status === "stale",
      visible: true,
    };
  }

  // Host reported data but the registry has no widget for the context.
  const effectiveStatus: WidgetStatus = hasData ? "unsupported" : status;

  // `loading` is a transient affordance shown regardless of importance; every
  // terminal status is visible only when the slot is structural (fail-closed).
  const visible = effectiveStatus === "loading" || importance === "structural";

  return { render: "status", effectiveStatus, stale: false, visible };
}
