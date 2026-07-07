/**
 * Client-side `visible_when` evaluation for action-form sections (#634 S4).
 *
 * The action's server-compiled contract round-trips an OPTIONAL
 * `visible_when` predicate per section (the platform's Foundry-framed
 * ActionPrecondition shape — conditions are data, one vocabulary). The
 * server owns ENFORCEMENT (submission gates); this module owns the pure
 * PRESENTATION concern: live show/hide of a section as the operator types.
 *
 * The operator set is a deliberate SUBSET of the server evaluator
 * (`validation.py::_evaluate_operator`) — the comparisons a form value bag
 * can answer locally. Two deliberate divergences, both UI-safe:
 *
 * - Blank form values (`""`, null, undefined) are treated as ABSENT for
 *   `is_null` / `not_null` — an untouched text input means "no value yet",
 *   so `{field: X, operator: not_null}` reads "shown once X has a value"
 *   (the spec's canonical example).
 * - An operator this subset doesn't know evaluates to VISIBLE (fail-open).
 *   Hiding inputs on an unknown operator would make fields unreachable;
 *   the server's gates still enforce whatever the condition meant.
 */

export interface VisibleWhenCondition {
  field?: string;
  operator?: string;
  value?: unknown;
  [key: string]: unknown;
}

/** Blank = the form has no value for the field yet. `false` and `0` are
 *  real values; only null / undefined / empty-string count as blank. */
export function isBlankFormValue(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function asComparableNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function numericCompare(
  operator: "gt" | "lt" | "gte" | "lte",
  actual: unknown,
  expected: unknown,
): boolean {
  // Mirrors the server: a missing actual is VACUOUSLY satisfied for the
  // ordering operators (the gate that owns refusal runs server-side).
  if (isBlankFormValue(actual)) return true;
  const left = asComparableNumber(actual);
  const right = asComparableNumber(expected);
  if (left === null || right === null) {
    // Fall back to string comparison only when both sides are strings
    // (e.g. ISO dates order lexicographically); otherwise fail open.
    if (typeof actual === "string" && typeof expected === "string") {
      if (operator === "gt") return actual > expected;
      if (operator === "lt") return actual < expected;
      if (operator === "gte") return actual >= expected;
      return actual <= expected;
    }
    return true;
  }
  if (operator === "gt") return left > right;
  if (operator === "lt") return left < right;
  if (operator === "gte") return left >= right;
  return left <= right;
}

function looseEquals(actual: unknown, expected: unknown): boolean {
  if (actual === expected) return true;
  // Form controls carry strings; sheets author typed literals. "3" == 3 and
  // "true" == true are the same answer from the operator's point of view.
  if (typeof expected === "boolean") return String(actual) === String(expected);
  const leftNumber = asComparableNumber(actual);
  const rightNumber = asComparableNumber(expected);
  if (leftNumber !== null && rightNumber !== null)
    return leftNumber === rightNumber;
  return String(actual ?? "") === String(expected ?? "");
}

function stringMatch(
  mode: "contains" | "starts" | "ends",
  actual: unknown,
  expected: unknown,
): boolean {
  if (isBlankFormValue(actual) || isBlankFormValue(expected)) return false;
  const haystack = String(actual).toLowerCase();
  const needle = String(expected).toLowerCase();
  if (mode === "contains") return haystack.includes(needle);
  if (mode === "starts") return haystack.startsWith(needle);
  return haystack.endsWith(needle);
}

/**
 * Evaluate one `visible_when` condition against the live form value bag.
 * Returns whether the section should be VISIBLE.
 */
export function evaluateVisibleWhen(
  condition: VisibleWhenCondition | null | undefined,
  values: Record<string, unknown>,
): boolean {
  if (!condition || typeof condition !== "object") return true;
  const field = typeof condition.field === "string" ? condition.field : "";
  const operator =
    typeof condition.operator === "string" ? condition.operator : "";
  if (!field || !operator) return true;
  const actual = values[field];
  const expected = condition.value;

  switch (operator) {
    case "eq":
      return looseEquals(actual, expected);
    case "ne":
      return !looseEquals(actual, expected);
    case "gt":
    case "lt":
    case "gte":
    case "lte":
      return numericCompare(operator, actual, expected);
    case "in":
      return Array.isArray(expected)
        ? expected.some((entry) => looseEquals(actual, entry))
        : false;
    case "not_in":
      return Array.isArray(expected)
        ? !expected.some((entry) => looseEquals(actual, entry))
        : true;
    case "is_null":
      return isBlankFormValue(actual);
    case "not_null":
      return !isBlankFormValue(actual);
    case "contains":
      return stringMatch("contains", actual, expected);
    case "starts_with":
      return stringMatch("starts", actual, expected);
    case "ends_with":
      return stringMatch("ends", actual, expected);
    default:
      // Unknown operator → fail-open VISIBLE (see module doc).
      return true;
  }
}

/** A section shape carrying an optional predicate. Reads BOTH spellings so
 *  hosts can pass either the renderer's mapped sections (`visibleWhen`) or
 *  raw contract sections (`visible_when`) without an adapter. `unknown` on
 *  purpose: hosts carry their own concrete precondition types; the evaluator
 *  reads the predicate defensively. */
export interface ConditionalSection {
  visibleWhen?: unknown;
  visible_when?: unknown;
}

/** Whether a section is visible given the live value bag. Sections with no
 *  predicate are always visible. Accepts any object shape (fold sections
 *  carry no predicate at all) — the predicate is read defensively. */
export function sectionVisible(
  section: object | null | undefined,
  values: Record<string, unknown>,
): boolean {
  if (!section) return true;
  const bag = section as ConditionalSection;
  const predicate =
    (bag.visibleWhen as VisibleWhenCondition | null | undefined) ??
    (bag.visible_when as VisibleWhenCondition | null | undefined) ??
    null;
  return evaluateVisibleWhen(predicate, values);
}
