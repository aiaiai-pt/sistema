/**
 * Text-size preference ladder (#244 C7 — DS accessibility pack).
 *
 * Four steps spanning 100–160% let a citizen scale the rem-based type system
 * (WCAG 1.4.4 Resize Text) without breaking the layout. Pure logic: the
 * `TextSizeAdjuster` component renders the controls, and the consumer persists
 * the choice (cookie) + applies it as a root font-scale via the
 * `:root[data-text-size="N"]` layer in tokens/semantic.css. Kept dependency-free
 * + framework-agnostic so it is unit-testable with `node:test`.
 */

/** The valid text-size steps, ascending (percent of the base root font-size). */
export const TEXT_SIZE_STEPS = [100, 120, 140, 160];

/** The default (no preference) — the bottom rung. */
export const DEFAULT_TEXT_SIZE = 100;

/**
 * Clamp an arbitrary value to a valid ladder step. The cookie can carry junk or
 * a numeric string (`"120"`), so coerce + validate; anything off-ladder falls
 * back to the default. Idempotent.
 * @param {unknown} value
 * @returns {number}
 */
export function normalizeTextSize(value) {
  const n = Number(value);
  return TEXT_SIZE_STEPS.includes(n) ? n : DEFAULT_TEXT_SIZE;
}

/**
 * The next step up, clamped at the top rung.
 * @param {unknown} value
 * @returns {number}
 */
export function increaseTextSize(value) {
  const i = TEXT_SIZE_STEPS.indexOf(normalizeTextSize(value));
  return TEXT_SIZE_STEPS[Math.min(i + 1, TEXT_SIZE_STEPS.length - 1)];
}

/**
 * The next step down, clamped at the bottom rung.
 * @param {unknown} value
 * @returns {number}
 */
export function decreaseTextSize(value) {
  const i = TEXT_SIZE_STEPS.indexOf(normalizeTextSize(value));
  return TEXT_SIZE_STEPS[Math.max(i - 1, 0)];
}

/**
 * Whether the value is at the bottom rung (decrease control should be disabled).
 * @param {unknown} value
 * @returns {boolean}
 */
export function isMinTextSize(value) {
  return normalizeTextSize(value) === TEXT_SIZE_STEPS[0];
}

/**
 * Whether the value is at the top rung (increase control should be disabled).
 * @param {unknown} value
 * @returns {boolean}
 */
export function isMaxTextSize(value) {
  return (
    normalizeTextSize(value) === TEXT_SIZE_STEPS[TEXT_SIZE_STEPS.length - 1]
  );
}
