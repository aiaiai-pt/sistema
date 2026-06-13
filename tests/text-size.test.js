import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  TEXT_SIZE_STEPS,
  DEFAULT_TEXT_SIZE,
  normalizeTextSize,
  increaseTextSize,
  decreaseTextSize,
  isMinTextSize,
  isMaxTextSize,
} from "../components/text-size.js";

// ---------------------------------------------------------------------------
// Text-size preference ladder (#244 C7). Four steps spanning 100–160% let a
// citizen scale the rem-based type system (WCAG 1.4.4 Resize Text). Pure — the
// TextSizeAdjuster renders it; the consumer persists + applies the root scale.
// ---------------------------------------------------------------------------

describe("text-size ladder", () => {
  test("exposes four ascending steps spanning 100–160%", () => {
    assert.deepEqual(TEXT_SIZE_STEPS, [100, 120, 140, 160]);
    assert.equal(DEFAULT_TEXT_SIZE, 100);
  });
});

describe("normalizeTextSize", () => {
  test("passes a valid step through", () => {
    assert.equal(normalizeTextSize(140), 140);
  });
  test("coerces a numeric string to its step (cookie carries strings)", () => {
    assert.equal(normalizeTextSize("120"), 120);
  });
  test("falls back to the default for junk / out-of-ladder values", () => {
    assert.equal(normalizeTextSize(130), DEFAULT_TEXT_SIZE);
    assert.equal(normalizeTextSize("huge"), DEFAULT_TEXT_SIZE);
    assert.equal(normalizeTextSize(undefined), DEFAULT_TEXT_SIZE);
    assert.equal(normalizeTextSize(999), DEFAULT_TEXT_SIZE);
  });
});

describe("increaseTextSize / decreaseTextSize", () => {
  test("increase steps up one rung", () => {
    assert.equal(increaseTextSize(100), 120);
    assert.equal(increaseTextSize(140), 160);
  });
  test("increase clamps at the top rung", () => {
    assert.equal(increaseTextSize(160), 160);
  });
  test("decrease steps down one rung", () => {
    assert.equal(decreaseTextSize(160), 140);
    assert.equal(decreaseTextSize(120), 100);
  });
  test("decrease clamps at the bottom rung", () => {
    assert.equal(decreaseTextSize(100), 100);
  });
  test("normalizes junk before stepping (no NaN escape)", () => {
    assert.equal(increaseTextSize(130), 120); // 130 → default 100 → up
    assert.equal(decreaseTextSize("nope"), 100); // junk → default 100 → clamp
  });
});

describe("isMinTextSize / isMaxTextSize (bound flags for disabling controls)", () => {
  test("min is true only at the bottom rung", () => {
    assert.equal(isMinTextSize(100), true);
    assert.equal(isMinTextSize(120), false);
    assert.equal(isMinTextSize(160), false);
  });
  test("max is true only at the top rung", () => {
    assert.equal(isMaxTextSize(160), true);
    assert.equal(isMaxTextSize(140), false);
    assert.equal(isMaxTextSize(100), false);
  });
  test("junk normalizes to the default (a min, not a max)", () => {
    assert.equal(isMinTextSize(130), true);
    assert.equal(isMaxTextSize(130), false);
  });
});
