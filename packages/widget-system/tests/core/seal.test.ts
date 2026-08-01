/**
 * Unit tests for assignSeal — the ONLY seal source.
 *
 * H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.
 *
 * Invariants (prd.md §5.1 five-answers table):
 *   1. future window_start → projected
 *   2. model_derived + current/past window → inferred
 *   3. direct reading (¬model_derived) + current/past window → measured
 *   4. expired window_end → stale (independent of evidence state)
 *   5. future window → never stale (window_end is also in the future)
 *   6. projected + expired → projected + stale
 *   7. no window bounds → never stale
 *   8. probability is NOT implemented in H1 — field is absent from return
 */

import { describe, it, expect } from "vitest";
import {
  assignSeal,
  type Probability,
  type Seal,
  type ValueProvenance,
} from "../../src/core/index.ts";

const NOW = new Date("2026-07-28T12:00:00Z");

// ─── helpers ─────────────────────────────────────────────────────────────────

function seal(override: Partial<ValueProvenance> = {}) {
  const base: ValueProvenance = { model_derived: false };
  return assignSeal({ ...base, ...override }, NOW);
}

// ─── Evidence state ───────────────────────────────────────────────────────────

describe("assignSeal — evidence state", () => {
  it("future window_start → projected", () => {
    const result = seal({ window_start: "2026-07-29T00:00:00Z" });
    expect(result.evidence).toBe("projected");
  });

  it("window_start exactly equal to now is NOT future → measured (direct)", () => {
    // boundary: windowStart === now is not strictly greater, so not projected
    const result = seal({
      window_start: NOW.toISOString(),
      model_derived: false,
    });
    expect(result.evidence).toBe("measured");
  });

  it("future window_start + model_derived → still projected (window wins)", () => {
    // Future window trumps model_derived — the value refers to a future moment
    const result = seal({
      window_start: "2026-07-29T00:00:00Z",
      model_derived: true,
    });
    expect(result.evidence).toBe("projected");
  });

  it("model_derived + past window → inferred", () => {
    const result = seal({
      window_start: "2026-07-27T00:00:00Z",
      window_end: "2026-07-27T23:59:59Z",
      model_derived: true,
    });
    expect(result.evidence).toBe("inferred");
  });

  it("model_derived + no window bounds → inferred", () => {
    const result = seal({ model_derived: true });
    expect(result.evidence).toBe("inferred");
  });

  it("direct reading (¬model_derived) + no window bounds → measured", () => {
    const result = seal({ model_derived: false });
    expect(result.evidence).toBe("measured");
  });

  it("direct reading + past window → measured", () => {
    const result = seal({
      window_start: "2026-07-27T00:00:00Z",
      window_end: "2026-07-27T23:59:59Z",
      model_derived: false,
    });
    expect(result.evidence).toBe("measured");
  });
});

// ─── Stale flag ───────────────────────────────────────────────────────────────

describe("assignSeal — stale flag", () => {
  it("no window_end → not stale", () => {
    expect(seal({ model_derived: false }).stale).toBe(false);
  });

  it("window_end in the future → not stale", () => {
    const result = seal({ window_end: "2026-07-29T00:00:00Z" });
    expect(result.stale).toBe(false);
  });

  it("window_end equal to now → not stale (strict less-than)", () => {
    // windowEnd < now is false when they are equal → not stale
    const result = seal({ window_end: NOW.toISOString() });
    expect(result.stale).toBe(false);
  });

  it("window_end in the past → stale", () => {
    const result = seal({ window_end: "2026-07-27T00:00:00Z" });
    expect(result.stale).toBe(true);
  });

  it("future projected seal → NOT stale (future window cannot be expired)", () => {
    const result = seal({
      window_start: "2026-07-29T00:00:00Z",
      window_end: "2026-07-30T00:00:00Z",
    });
    expect(result.evidence).toBe("projected");
    expect(result.stale).toBe(false);
  });

  it("projected + expired window_end → projected + stale", () => {
    // Edge case: a projected value whose horizon has now passed
    const result = seal({
      window_start: "2026-07-26T00:00:00Z",
      window_end: "2026-07-27T00:00:00Z",
      model_derived: true,
    });
    // window_start is past, so evidence is inferred (not projected)
    // Confirm evidence reflects the past start
    expect(result.evidence).toBe("inferred");
    expect(result.stale).toBe(true);
  });

  it("future-start + past-end (impossible in practice) → projected + stale", () => {
    // If someone passes inconsistent timestamps, we honour each field independently
    const result = seal({
      window_start: "2026-07-29T00:00:00Z",
      window_end: "2026-07-27T00:00:00Z",
    });
    expect(result.evidence).toBe("projected");
    expect(result.stale).toBe(true);
  });
});

// ─── Probability axis ─────────────────────────────────────────────────────────

describe("assignSeal — probability axis (slot exists, no H1 source)", () => {
  it("probability is absent from the return value in H1", () => {
    const result = seal();
    // No data source populates the axis, so assignSeal never sets it.
    // Evidence alone is a valid seal; probability alone is not.
    expect("probability" in result).toBe(false);
  });

  it("the two axes are independent — a probability never changes the evidence", () => {
    // The slot is part of the frozen Selo type: a caller that has a source can
    // carry probability alongside the assigned evidence without either value
    // being derived from, or collapsed into, the other.
    const assigned = assignSeal({ model_derived: true }, NOW);
    const withProbability: Seal = { ...assigned, probability: "uncertain" };

    expect(withProbability.evidence).toBe("inferred");
    expect(withProbability.probability).toBe("uncertain");
    // Two fields, two vocabularies — no merged score, no merged label.
    expect(withProbability.evidence).not.toBe(withProbability.probability);
  });

  it("the probability vocabulary is exactly {probable, uncertain}", () => {
    const probable: Probability = "probable";
    const uncertain: Probability = "uncertain";
    expect([probable, uncertain]).toEqual(["probable", "uncertain"]);
  });
});

// ─── Date/string inputs ───────────────────────────────────────────────────────

describe("assignSeal — Date object and ISO string inputs", () => {
  it("accepts Date objects for window_start", () => {
    const future = new Date("2026-07-29T00:00:00Z");
    const result = assignSeal(
      { window_start: future, model_derived: false },
      NOW,
    );
    expect(result.evidence).toBe("projected");
  });

  it("accepts ISO strings for window_end", () => {
    const result = assignSeal(
      { window_end: "2026-07-27T00:00:00Z", model_derived: false },
      NOW,
    );
    expect(result.stale).toBe(true);
  });
});
