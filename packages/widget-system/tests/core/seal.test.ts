/**
 * Unit tests for the seal mechanism — assignSeal and resolveSeal.
 *
 * H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.
 *
 * The point of these tests is that NO SEAL WORD appears in the module under
 * test. Assignment is structural (what the datum's provenance makes it) and
 * the words arrive separately, as declared data. The corpus carries three
 * competing enumerations with no reconciling ruling and one explicitly parked
 * wording question, so a hardcoded enum here would silently decide both.
 *
 * Invariants:
 *   1. future window_start                    → future_window
 *   2. model_derived + current/past window    → model_derived
 *   3. direct reading + current/past window   → direct_reading
 *   4. expired window_end                     → stale, independent of class
 *   5. no window bounds                       → never stale
 *   6. sealRequired ⟺ future window OR model-derived provenance
 *   7. rank: direct_reading > model_derived > future_window, always
 *   8. resolveSeal supplies every word and refuses undeclared ones
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EVIDENCE_CLASS_RANK,
  assignSeal,
  outranks,
  resolveSeal,
  type SealVocabulary,
  type ValueProvenance,
} from "../../src/core/index.ts";

const NOW = new Date("2026-07-28T12:00:00Z");
const FUTURE = "2026-07-29T00:00:00Z";
const PAST = "2026-07-27T00:00:00Z";

function seal(override: Partial<ValueProvenance> = {}) {
  const base: ValueProvenance = { model_derived: false };
  return assignSeal({ ...base, ...override }, NOW);
}

// ─── Evidence class — structural, wordless ───────────────────────────────────

describe("assignSeal — evidence class", () => {
  it("future window_start → future_window", () => {
    expect(seal({ window_start: FUTURE }).evidenceClass).toBe("future_window");
  });

  it("model-derived about a current window → model_derived", () => {
    expect(seal({ model_derived: true }).evidenceClass).toBe("model_derived");
  });

  it("direct reading of a current window → direct_reading", () => {
    expect(seal().evidenceClass).toBe("direct_reading");
  });

  it("a future window outranks model provenance in classification", () => {
    // Both conditions hold; the future window is the stronger statement.
    expect(
      seal({ window_start: FUTURE, model_derived: true }).evidenceClass,
    ).toBe("future_window");
  });

  it("accepts Date objects as well as ISO strings", () => {
    expect(seal({ window_start: new Date(FUTURE) }).evidenceClass).toBe(
      "future_window",
    );
  });
});

// ─── Staleness — orthogonal to both axes ─────────────────────────────────────

describe("assignSeal — staleness", () => {
  it("an expired window_end is stale", () => {
    expect(seal({ window_end: PAST }).stale).toBe(true);
  });

  it("staleness is independent of the evidence class", () => {
    expect(seal({ window_end: PAST, model_derived: true }).stale).toBe(true);
    expect(
      seal({ window_start: FUTURE, window_end: PAST }).evidenceClass,
    ).toBe("future_window");
    expect(seal({ window_start: FUTURE, window_end: PAST }).stale).toBe(true);
  });

  it("no window bounds → never stale", () => {
    expect(seal().stale).toBe(false);
  });

  it("a window that has not closed yet is not stale", () => {
    expect(seal({ window_end: FUTURE }).stale).toBe(false);
  });
});

// ─── Which values need a seal ────────────────────────────────────────────────

describe("assignSeal — which values need a seal", () => {
  it("a future window requires a seal", () => {
    expect(seal({ window_start: FUTURE }).sealRequired).toBe(true);
  });

  it("model-derived provenance requires a seal", () => {
    expect(seal({ model_derived: true }).sealRequired).toBe(true);
  });

  it("a direct reading of a current window does not", () => {
    expect(seal().sealRequired).toBe(false);
  });
});

// ─── The ranking that "measured out-ranks projected" really means ────────────

describe("evidence class ranking", () => {
  it("a reading outranks a model output outranks a forecast", () => {
    expect(outranks("direct_reading", "model_derived")).toBe(true);
    expect(outranks("model_derived", "future_window")).toBe(true);
    expect(outranks("direct_reading", "future_window")).toBe(true);
  });

  it("is antisymmetric and irreflexive", () => {
    expect(outranks("future_window", "direct_reading")).toBe(false);
    expect(outranks("direct_reading", "direct_reading")).toBe(false);
  });

  it("the rank table is frozen — ordering is not runtime-editable", () => {
    expect(Object.isFrozen(EVIDENCE_CLASS_RANK)).toBe(true);
  });
});

// ─── The words arrive as declared data ───────────────────────────────────────

/** Cycle-4's origin ruling: a 3-term PT axis plus the 4-term ICD-203-lite ladder. */
const CYCLE4: SealVocabulary = {
  evidence: {
    direct_reading: { value: "confirmed", label: "confirmado", tone: "positive" },
    model_derived: { value: "inferred", label: "inferido", tone: "info" },
    future_window: { value: "modelled", label: "modelado", tone: "caution" },
  },
  probability: {
    near_certain: { value: "near_certain", label: "quase certo" },
    probable: { value: "probable", label: "provável" },
    uncertain: { value: "uncertain", label: "incerto" },
    unlikely: { value: "unlikely", label: "pouco provável" },
  },
};

/** Cycle-6 / PRD: a narrower 2-term axis — two classes share one term. */
const CYCLE6: SealVocabulary = {
  evidence: {
    direct_reading: { value: "measured", label: "medido", tone: "positive" },
    model_derived: { value: "inferred", label: "inferido", tone: "info" },
    future_window: { value: "inferred", label: "inferido", tone: "info" },
  },
  probability: {
    probable: { value: "probable", label: "provável" },
    uncertain: { value: "uncertain", label: "incerto" },
  },
};

describe("resolveSeal — the vocabulary is data", () => {
  it("resolves the same datum differently under different declarations", () => {
    const assignment = seal({ window_start: FUTURE });

    expect(resolveSeal(assignment, CYCLE4).evidence.label).toBe("modelado");
    // The 2-term axis maps future_window onto the model-derived term — a
    // narrower vocabulary, expressed without any code change.
    expect(resolveSeal(assignment, CYCLE6).evidence.label).toBe("inferido");
  });

  it("carries the English code alongside the localized label", () => {
    const resolved = resolveSeal(seal(), CYCLE6);
    expect(resolved.evidence.value).toBe("measured");
    expect(resolved.evidence.label).toBe("medido");
  });

  it("resolves a 4-term probability ladder the narrower vocabulary lacks", () => {
    const resolved = resolveSeal(seal(), CYCLE4, "near_certain");
    expect(resolved.probability?.label).toBe("quase certo");
    expect(() => resolveSeal(seal(), CYCLE6, "near_certain")).toThrow(
      /not declared/i,
    );
  });

  it("evidence alone is valid — probability is simply absent", () => {
    const resolved = resolveSeal(seal(), CYCLE4);
    expect(resolved.evidence).toBeDefined();
    expect(resolved.probability).toBeUndefined();
  });

  it("carries staleness through untouched", () => {
    expect(resolveSeal(seal({ window_end: PAST }), CYCLE4).stale).toBe(true);
  });

  it("THROWS when the declaration does not cover an assigned class", () => {
    const partial = {
      evidence: { direct_reading: { value: "measured", label: "medido" } },
    } as unknown as SealVocabulary;
    expect(() => resolveSeal(seal({ model_derived: true }), partial)).toThrow(
      /no evidence term for class/i,
    );
  });

  it("THROWS on an undeclared probability code rather than dropping it", () => {
    expect(() => resolveSeal(seal(), CYCLE4, "vibes")).toThrow(/not declared/i);
  });
});

// ─── The module itself must carry no vocabulary ──────────────────────────────

describe("the seal module enumerates no seal words", () => {
  it("seal.ts hardcodes none of the corpus's competing terms", () => {
    const source = readFileSync(
      join(import.meta.dirname, "../../src/core/seal.ts"),
      "utf-8",
    )
      // Strip prose: the doc comment names the corpus's words precisely in
      // order to explain why none of them are baked in.
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    const SEAL_WORDS = [
      "measured",
      "inferred",
      "projected",
      "confirmado",
      "inferido",
      "modelado",
      "medido",
      "previsto",
      "provável",
      "incerto",
    ];
    const found = SEAL_WORDS.filter((word) =>
      new RegExp(`\\b${word}\\b`, "i").test(source),
    );
    expect(
      found,
      `seal.ts hardcodes seal vocabulary: ${found.join(", ")}`,
    ).toEqual([]);
  });
});
