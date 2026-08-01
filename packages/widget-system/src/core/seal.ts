/**
 * Evidence seal — transport-neutral provenance assignment.
 *
 * H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.
 *
 * `assignSeal` is the ONLY seal source: it reads the value's freshness and
 * model-provenance metadata and returns an evidence state deterministically,
 * without fetching, authorising, or timing anything.
 *
 * Assignment rules (prd.md §5.1 five-answers table):
 *   projected  : window_start > now          — future validity window
 *   inferred   : model_derived + ¬future win — model-derived about the present
 *   measured   : ¬model_derived + ¬future    — direct reading, current/past win
 *   stale flag : window_end < now            — validity window has closed
 *
 * Probability axis: NOT implemented in H1 — no data source.
 * The two-axis model (evidence × probability) is described in prd.md §5.1 #2.
 * Only the evidence axis ships here; `probability` is typed `never` so a
 * future addition remains a non-breaking API extension.
 *
 * Purity: zero runtime imports — stays under the /core purity guarantee
 * enforced by the structural guard, consistent with states.ts.
 */

/**
 * Provenance metadata for a value that may carry a seal.
 * The host's BFF layer is the authoritative source; this type is the
 * transport-neutral contract it hands down to the assignment function.
 */
export interface ValueProvenance {
  /**
   * ISO 8601 timestamp (or Date) when this value's validity window opens.
   * A window_start in the future means the value is `projected`.
   * Undefined means the window is open-ended (no future constraint).
   */
  window_start?: string | Date;
  /**
   * ISO 8601 timestamp (or Date) when this value's validity window closes.
   * A window_end in the past means the seal is `stale`.
   * Undefined means the window is open-ended (no expiry).
   */
  window_end?: string | Date;
  /**
   * True when the value was produced by a model rather than a direct reading.
   * A model-derived value with a current window is `inferred`; with a future
   * window it is `projected`.
   */
  model_derived: boolean;
}

/**
 * The three evidence states — the DS owns this vocabulary (Fork B, 2026-07-26).
 *
 * - `measured`  — direct reading from an instrument or authoritative source.
 * - `inferred`  — derived by a model from current or past data.
 * - `projected` — refers to a future window; not yet observed.
 */
export type EvidenceState = "measured" | "inferred" | "projected";

/**
 * The probability axis — the seal's SECOND, orthogonal vocabulary.
 *
 * - `probable`  — the projection is more likely than not to hold.
 * - `uncertain` — the projection is materially in doubt.
 *
 * Orthogonal to `EvidenceState`: the two never collapse into a single score or
 * a single label. Evidence alone is a valid seal; probability alone is not.
 */
export type Probability = "probable" | "uncertain";

/**
 * The evidence seal for a value. Returned exclusively by `assignSeal`.
 */
export interface Seal {
  /** The DS-owned evidence state for this value. */
  evidence: EvidenceState;
  /**
   * Probability axis (how likely the projected value is to occur).
   *
   * The SLOT is part of the frozen Selo type and of the chip grammar
   * (03-evidence.md §1.1); no H1 data source populates it, so `assignSeal`
   * never sets it and SealChip renders the second chip only when a caller
   * supplies one. Ship evidence-alone — that is a valid seal.
   *
   * Independent of `evidence`: never collapse the two into one score or label.
   */
  probability?: Probability;
  /**
   * True when the validity window has closed (window_end is in the past).
   * A stale seal means the projection horizon has passed; the value
   * requires re-verification or an explicit `not-done` transition.
   */
  stale: boolean;
}

/**
 * Assign an evidence seal from a value's provenance metadata.
 *
 * This is the ONLY seal source. The product calls this deterministically;
 * the model never assigns its own seal (prd.md §5.1 #3).
 *
 * @param value — provenance metadata (from the BFF layer)
 * @param now   — the current time, injectable for testing; pass `new Date()` in production
 * @returns     — the evidence seal: evidence state + stale flag
 */
export function assignSeal(value: ValueProvenance, now: Date): Seal {
  const windowStart =
    value.window_start != null ? new Date(value.window_start) : null;
  const windowEnd =
    value.window_end != null ? new Date(value.window_end) : null;

  // Stale: validity window has closed (window_end is defined and in the past).
  const stale = windowEnd !== null && windowEnd < now;

  // Evidence state: determined by the window position and model provenance.
  let evidence: EvidenceState;
  if (windowStart !== null && windowStart > now) {
    // The value refers to a future window → projected.
    evidence = "projected";
  } else if (value.model_derived) {
    // Model-derived about the present (or past window) → inferred.
    evidence = "inferred";
  } else {
    // Direct reading, current or past window → measured.
    evidence = "measured";
  }

  return { evidence, stale };
}
