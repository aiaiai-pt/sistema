// #634 S4 — the pure client-side `visible_when` evaluator: the UI subset of
// the platform's ActionPrecondition operators, evaluated against the live
// form value bag. Server owns enforcement; this owns show/hide, so the two
// deliberate divergences (blank-as-absent, unknown-operator fail-open) are
// pinned here as contract.

import { describe, expect, it } from "vitest";

import {
  evaluateVisibleWhen,
  isBlankFormValue,
  sectionVisible,
} from "../components/action-form-visibility";

describe("isBlankFormValue", () => {
  it("treats null / undefined / empty string as blank, real falsy values as present", () => {
    expect(isBlankFormValue(undefined)).toBe(true);
    expect(isBlankFormValue(null)).toBe(true);
    expect(isBlankFormValue("")).toBe(true);
    expect(isBlankFormValue(false)).toBe(false);
    expect(isBlankFormValue(0)).toBe(false);
    expect(isBlankFormValue("0")).toBe(false);
  });
});

describe("evaluateVisibleWhen", () => {
  it("not_null: hidden until the driving field has a value (the canonical example)", () => {
    const cond = { field: "scope", operator: "not_null" };
    expect(evaluateVisibleWhen(cond, { scope: "" })).toBe(false);
    expect(evaluateVisibleWhen(cond, {})).toBe(false);
    expect(evaluateVisibleWhen(cond, { scope: "deep" })).toBe(true);
    expect(evaluateVisibleWhen(cond, { scope: false })).toBe(true);
  });

  it("is_null mirrors not_null over blank form values", () => {
    const cond = { field: "scope", operator: "is_null" };
    expect(evaluateVisibleWhen(cond, { scope: "" })).toBe(true);
    expect(evaluateVisibleWhen(cond, { scope: "x" })).toBe(false);
  });

  it("eq/ne compare loosely across the string-typed form controls", () => {
    expect(
      evaluateVisibleWhen({ field: "n", operator: "eq", value: 3 }, { n: "3" }),
    ).toBe(true);
    expect(
      evaluateVisibleWhen(
        { field: "b", operator: "eq", value: true },
        { b: "true" },
      ),
    ).toBe(true);
    expect(
      evaluateVisibleWhen(
        { field: "s", operator: "ne", value: "a" },
        { s: "b" },
      ),
    ).toBe(true);
    expect(
      evaluateVisibleWhen(
        { field: "s", operator: "eq", value: "a" },
        { s: "b" },
      ),
    ).toBe(false);
  });

  it("ordering operators are vacuously true on a blank actual (server mirror)", () => {
    expect(
      evaluateVisibleWhen({ field: "n", operator: "gt", value: 5 }, { n: "" }),
    ).toBe(true);
    expect(
      evaluateVisibleWhen({ field: "n", operator: "gt", value: 5 }, { n: "7" }),
    ).toBe(true);
    expect(
      evaluateVisibleWhen({ field: "n", operator: "gt", value: 5 }, { n: "3" }),
    ).toBe(false);
    expect(
      evaluateVisibleWhen({ field: "n", operator: "lte", value: 5 }, { n: 5 }),
    ).toBe(true);
  });

  it("in / not_in membership with loose element equality", () => {
    expect(
      evaluateVisibleWhen(
        { field: "kind", operator: "in", value: ["a", "b"] },
        { kind: "b" },
      ),
    ).toBe(true);
    expect(
      evaluateVisibleWhen(
        { field: "kind", operator: "in", value: ["a", "b"] },
        { kind: "c" },
      ),
    ).toBe(false);
    expect(
      evaluateVisibleWhen(
        { field: "kind", operator: "not_in", value: ["a"] },
        { kind: "c" },
      ),
    ).toBe(true);
    // A non-list `in` value can never match; not_in fails open to visible.
    expect(
      evaluateVisibleWhen(
        { field: "kind", operator: "in", value: "a" },
        { kind: "a" },
      ),
    ).toBe(false);
  });

  it("string operators are case-insensitive and blank-safe", () => {
    expect(
      evaluateVisibleWhen(
        { field: "title", operator: "contains", value: "URG" },
        { title: "very urgent" },
      ),
    ).toBe(true);
    expect(
      evaluateVisibleWhen(
        { field: "title", operator: "starts_with", value: "ve" },
        { title: "Very urgent" },
      ),
    ).toBe(true);
    expect(
      evaluateVisibleWhen(
        { field: "title", operator: "ends_with", value: "nt" },
        { title: "urgent" },
      ),
    ).toBe(true);
    expect(
      evaluateVisibleWhen(
        { field: "title", operator: "contains", value: "x" },
        { title: "" },
      ),
    ).toBe(false);
  });

  it("unknown operator / malformed condition fail OPEN to visible", () => {
    expect(
      evaluateVisibleWhen(
        { field: "x", operator: "age_between", value: [1, 2] },
        {},
      ),
    ).toBe(true);
    expect(evaluateVisibleWhen({ field: "x" }, {})).toBe(true);
    expect(evaluateVisibleWhen({ operator: "eq", value: 1 }, {})).toBe(true);
    expect(evaluateVisibleWhen(null, {})).toBe(true);
    expect(evaluateVisibleWhen(undefined, {})).toBe(true);
  });
});

describe("sectionVisible", () => {
  it("no predicate → always visible; predicate drives the answer", () => {
    const bare: Record<string, unknown> = { name: "a", items: [] };
    expect(sectionVisible(bare, {})).toBe(true);
    expect(sectionVisible(null, {})).toBe(true);
    const section: Record<string, unknown> = {
      name: "b",
      items: [],
      visibleWhen: { field: "scope", operator: "eq", value: "deep" },
    };
    expect(sectionVisible(section, { scope: "routine" })).toBe(false);
    expect(sectionVisible(section, { scope: "deep" })).toBe(true);
  });
});

describe("sectionVisible over raw contract sections", () => {
  it("reads the snake_case `visible_when` spelling too (host pass-through)", () => {
    const raw: Record<string, unknown> = {
      key: "followup",
      visible_when: { field: "scope", operator: "not_null" },
    };
    expect(sectionVisible(raw, { scope: "" })).toBe(false);
    expect(sectionVisible(raw, { scope: "deep" })).toBe(true);
  });
});
