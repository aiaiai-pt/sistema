/**
 * Evidence seal — transport-neutral provenance assignment.
 *
 * H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.
 *
 * ─── The words are NOT here ─────────────────────────────────────────────────
 *
 * This module owns the MECHANISM, never the vocabulary. Nothing in this file,
 * and nothing in the design system, enumerates the seal's words.
 *
 * The corpus carries three competing enumerations with no reconciling ruling:
 * cycle-4's ICD-203-lite ladder {quase certo · provável · incerto · pouco
 * provável} × {confirmado · inferido · modelado}; cycle-6/PRD's narrower
 * {provável · incerto} × {medido · inferido}; and the 2026-07-31 brief's
 * {measured · inferred · projected}. The «previsto» wording is explicitly
 * PARKED. Baking any one of those into code would silently decide both the
 * parked question and the reconciliation.
 *
 * So the axis values are DECLARED DATA — ontology vocabulary rows, the same
 * `{ value, label }` enum-choice mechanism every other declared vocabulary in
 * the estate uses — resolved at read time and handed to the renderer. Widening
 * an axis, re-wording a term, or switching from a 3-term to a 2-term evidence
 * axis is a declaration change with zero code change and no package release.
 *
 * What IS code, because it is structural rather than lexical:
 *   - EvidenceClass  — what the datum's own provenance makes it
 *   - the rank order — a reading outranks a model output outranks a forecast
 *   - assignSeal     — the deterministic product-side assignment
 *   - the laws       — enforced by the renderer (see SealChip)
 *
 * Purity: zero runtime imports — stays under the /core purity guarantee.
 */

/**
 * Provenance metadata for a value that may carry a seal.
 * The host's BFF layer is the authoritative source; this type is the
 * transport-neutral contract it hands down to the assignment function.
 */
export interface ValueProvenance {
  /**
   * ISO 8601 timestamp (or Date) when this value's validity window opens.
   * A window_start in the future makes the value a future-window datum.
   * Undefined means the window is open-ended (no future constraint).
   */
  window_start?: string | Date;
  /**
   * ISO 8601 timestamp (or Date) when this value's validity window closes.
   * A window_end in the past makes the seal stale.
   * Undefined means the window is open-ended (no expiry).
   */
  window_end?: string | Date;
  /**
   * True when the value was produced by a model rather than a direct reading.
   */
  model_derived: boolean;
}

/**
 * What the datum's own provenance makes it — STRUCTURAL, not vocabulary.
 *
 * These three are not seal words and are never displayed. A declared
 * vocabulary maps each class to whatever term that deployment uses, which is
 * how a 2-term evidence axis and a 3-term one are both expressible: a 2-term
 * vocabulary simply maps `future_window` and `model_derived` to the same term.
 *
 * - `direct_reading` — read from an instrument or authoritative source.
 * - `model_derived`  — produced by a model, about a current or past window.
 * - `future_window`  — refers to a window that has not opened yet.
 */
export type EvidenceClass =
  | "direct_reading"
  | "model_derived"
  | "future_window";

/**
 * Authority order, highest first. Structural: a reading outranks a model
 * output, which outranks a forecast. This is what "measured out-ranks
 * projected" means once the words are removed — and it stays true under every
 * one of the corpus's competing enumerations.
 */
export const EVIDENCE_CLASS_RANK: Readonly<Record<EvidenceClass, number>> =
  Object.freeze({
    direct_reading: 3,
    model_derived: 2,
    future_window: 1,
  });

/** True when `a` is the more authoritative class. */
export function outranks(a: EvidenceClass, b: EvidenceClass): boolean {
  return EVIDENCE_CLASS_RANK[a] > EVIDENCE_CLASS_RANK[b];
}

/**
 * The presentation scale the design system owns. Not a vocabulary — a tone a
 * declared term is rendered in. Which word wears which tone is declared beside
 * the word, never inferred from it.
 */
export type SealTone = "positive" | "info" | "caution" | "neutral";

/**
 * One declared term on one axis — the shape an ontology enum choice resolves
 * to. `value` is the English code (identifiers are English by law); `label` is
 * the localized text actually rendered.
 */
export interface SealTerm {
  /** English code, as declared. */
  value: string;
  /** Localized label — what a reader and a screen reader receive. */
  label: string;
  /** How the design system should render it. Defaults to neutral. */
  tone?: SealTone;
}

/**
 * The declared vocabulary for both axes, resolved at read time and handed to
 * the renderer. Supplying it is the ONLY way words enter the seal.
 *
 * `evidence` is total over EvidenceClass so every datum resolves to a term;
 * two classes may legitimately share one term.
 * `probability` is keyed by declared code — deliberately an open record, since
 * its enumeration is unsettled and is nobody's call to fix in code.
 */
export interface SealVocabulary {
  evidence: Readonly<Record<EvidenceClass, SealTerm>>;
  probability?: Readonly<Record<string, SealTerm>>;
}

/** What `assignSeal` determines from provenance alone — still wordless. */
export interface SealAssignment {
  /** What the datum's provenance makes it. */
  evidenceClass: EvidenceClass;
  /** True when the validity window has closed. Orthogonal to both axes. */
  stale: boolean;
  /**
   * True when this value may not render unsealed: its window is later than now,
   * or its provenance includes a model. A direct reading of a current or past
   * window needs no seal.
   */
  sealRequired: boolean;
}

/** A seal with its words resolved — what a renderer can actually render. */
export interface ResolvedSeal {
  evidence: SealTerm;
  evidenceClass: EvidenceClass;
  probability?: SealTerm;
  stale: boolean;
}

/**
 * Assign an evidence seal from a value's provenance metadata.
 *
 * This is the ONLY seal source, and it is deterministic product code: the
 * model never assigns its own seal. It reads the datum's own provenance
 * against an injected `now` and returns no words at all.
 *
 * @param value — provenance metadata (from the BFF layer)
 * @param now   — the current time, injectable for testing
 */
export function assignSeal(value: ValueProvenance, now: Date): SealAssignment {
  const windowStart =
    value.window_start != null ? new Date(value.window_start) : null;
  const windowEnd =
    value.window_end != null ? new Date(value.window_end) : null;

  // Stale: the validity window has closed.
  const stale = windowEnd !== null && windowEnd < now;

  const isFutureWindow = windowStart !== null && windowStart > now;

  let evidenceClass: EvidenceClass;
  if (isFutureWindow) {
    evidenceClass = "future_window";
  } else if (value.model_derived) {
    evidenceClass = "model_derived";
  } else {
    evidenceClass = "direct_reading";
  }

  // A value needs a seal when its window is later than now OR its provenance
  // includes a model. A direct reading of a current/past window does not.
  const sealRequired = isFutureWindow || value.model_derived;

  return { evidenceClass, stale, sealRequired };
}

/**
 * Resolve an assignment against a declared vocabulary.
 *
 * Throws when the vocabulary does not cover the assigned class, or when a
 * probability code is not declared — a missing declaration is a data defect and
 * must not degrade into an unsealed or half-worded value.
 *
 * @param assignment      — from assignSeal
 * @param vocabulary      — declared terms, resolved at read time
 * @param probabilityCode — declared probability code, when the datum carries one
 */
export function resolveSeal(
  assignment: SealAssignment,
  vocabulary: SealVocabulary,
  probabilityCode?: string,
): ResolvedSeal {
  const evidence = vocabulary.evidence?.[assignment.evidenceClass];
  if (!evidence) {
    throw new Error(
      "[seal] The declared vocabulary has no evidence term for class " +
        `"${assignment.evidenceClass}". Every class must resolve to a term; ` +
        "two classes may share one.",
    );
  }

  let probability: SealTerm | undefined;
  if (probabilityCode !== undefined) {
    probability = vocabulary.probability?.[probabilityCode];
    if (!probability) {
      throw new Error(
        `[seal] Probability code "${probabilityCode}" is not declared in the ` +
          "vocabulary. Declare it, or omit it — evidence alone is a valid seal.",
      );
    }
  }

  return {
    evidence,
    evidenceClass: assignment.evidenceClass,
    probability,
    stale: assignment.stale,
  };
}
