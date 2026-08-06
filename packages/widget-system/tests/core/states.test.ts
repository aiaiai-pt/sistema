/**
 * Contract tests for the observable render-state model (S1.3 #58).
 *
 * `resolveWidgetState` is the pure, fail-closed core of the Svelte renderer.
 * These tests pin its full truth table so a no-op renderer cannot pass and a
 * future refactor cannot quietly turn a structural slot soft.
 *
 * Invariants:
 *  1. ready/stale + a matched widget → render the widget (stale flagged for stale).
 *  2. ready/stale + NO match → corrected to `unsupported` (the registry, not the
 *     host, is the authority on whether a widget exists).
 *  3. `loading` is always visible (transient affordance), regardless of importance.
 *  4. Every terminal status is visible on a structural slot, soft-empty on optional.
 *  5. `stateRequest` narrows to the request for ready/stale and null otherwise.
 */

import { describe, it, expect } from "vitest";
import {
  resolveWidgetState,
  stateRequest,
  type WidgetState,
  type WidgetStatus,
} from "../../src/core/index";

const TERMINAL_STATUSES: WidgetStatus[] = [
  "empty",
  "error",
  "unauthorized",
  "timeout",
  "unsupported",
  "overflow",
];

describe("resolveWidgetState — data states", () => {
  it("ready + matched → render the widget, not stale", () => {
    const d = resolveWidgetState("ready", "optional", true);
    expect(d.render).toBe("widget");
    expect(d.stale).toBe(false);
    expect(d.effectiveStatus).toBe("ready");
  });

  it("stale + matched → render the widget, flagged stale", () => {
    const d = resolveWidgetState("stale", "structural", true);
    expect(d.render).toBe("widget");
    expect(d.stale).toBe(true);
    expect(d.effectiveStatus).toBe("stale");
  });

  it("ready but NO match → corrected to unsupported status", () => {
    const d = resolveWidgetState("ready", "optional", false);
    expect(d.render).toBe("status");
    expect(d.effectiveStatus).toBe("unsupported");
  });

  it("stale but NO match → corrected to unsupported status", () => {
    const d = resolveWidgetState("stale", "structural", false);
    expect(d.render).toBe("status");
    expect(d.effectiveStatus).toBe("unsupported");
    // structural → the corrected unsupported status must be visible
    expect(d.visible).toBe(true);
  });

  it("an unsupported correction on an OPTIONAL slot is soft-empty (fail-closed but soft)", () => {
    const d = resolveWidgetState("ready", "optional", false);
    expect(d.visible).toBe(false);
  });
});

describe("resolveWidgetState — loading is always visible", () => {
  it("loading is visible on an optional slot", () => {
    const d = resolveWidgetState("loading", "optional", false);
    expect(d.render).toBe("status");
    expect(d.effectiveStatus).toBe("loading");
    expect(d.visible).toBe(true);
  });

  it("loading is visible on a structural slot", () => {
    expect(resolveWidgetState("loading", "structural", false).visible).toBe(true);
  });
});

describe("resolveWidgetState — terminal statuses fail closed", () => {
  for (const status of TERMINAL_STATUSES) {
    it(`${status}: visible on a structural slot`, () => {
      const d = resolveWidgetState(status, "structural", false);
      expect(d.render).toBe("status");
      expect(d.effectiveStatus).toBe(status);
      expect(d.visible).toBe(true);
    });

    it(`${status}: soft-empty on an optional slot`, () => {
      const d = resolveWidgetState(status, "optional", false);
      expect(d.render).toBe("status");
      expect(d.visible).toBe(false);
    });
  }
});

describe("stateRequest", () => {
  it("returns the request for ready and stale", () => {
    const req = { data: { x: 1 }, props: {} };
    expect(stateRequest({ status: "ready", request: req })).toBe(req);
    expect(stateRequest({ status: "stale", request: req })).toBe(req);
  });

  it("returns null for every payload-free state", () => {
    const payloadFree: WidgetState[] = [
      { status: "loading" },
      { status: "empty" },
      { status: "error" },
      { status: "unauthorized" },
      { status: "timeout" },
      { status: "unsupported" },
      { status: "overflow" },
    ];
    for (const state of payloadFree) {
      expect(stateRequest(state)).toBeNull();
    }
  });
});
