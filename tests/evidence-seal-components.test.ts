// @vitest-environment jsdom
//
// Rendered component tests for the H1 Slice 2 evidence seal primitives:
//   SealChip — sr-text invariant (seal survives quotation)
//   KpiRegister — dev-throw on unsealed projected; measured out-ranks projected
//   CaminhoStateChip — four worded states
//
// westeuropeco/atelier-urban-workspace#57

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import SealChip from "../components/SealChip.svelte";
import KpiRegister from "../components/KpiRegister.svelte";
import CaminhoStateChip from "../components/CaminhoStateChip.svelte";

// ─── helpers ─────────────────────────────────────────────────────────────────

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) {
    try {
      unmount(component);
    } catch {
      /* ignore unmount errors from components that threw on mount */
    }
    component = undefined;
  }
  target?.remove();
  target = undefined;
});

function render<P extends Record<string, unknown>>(
  Component: Parameters<typeof mount>[0],
  props: P,
): HTMLElement {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(Component, { target, props });
  flushSync();
  return target;
}

// ─── SealChip ────────────────────────────────────────────────────────────────

describe("SealChip — sr-text invariant (seal survives quotation)", () => {
  it("renders the value text", () => {
    const el = render(SealChip, { value: "2.3 MW", evidence: "measured" });
    const valueEl = el.querySelector(".seal-chip-value");
    expect(valueEl).not.toBeNull();
    expect(valueEl!.textContent).toBe("2.3 MW");
  });

  it("sr-only span is present and contains the evidence state word", () => {
    const el = render(SealChip, { value: "2.3 MW", evidence: "measured" });
    const srText = el.querySelector(".seal-chip-sr-text");
    expect(srText).not.toBeNull();
    expect(srText!.textContent).toContain("measured");
  });

  it("sr-text for projected contains 'projected'", () => {
    const el = render(SealChip, { value: "4.1 MW", evidence: "projected" });
    const srText = el.querySelector(".seal-chip-sr-text");
    expect(srText).not.toBeNull();
    expect(srText!.textContent).toContain("projected");
  });

  it("sr-text for inferred contains 'inferred'", () => {
    const el = render(SealChip, { value: "3.0 MW", evidence: "inferred" });
    const srText = el.querySelector(".seal-chip-sr-text");
    expect(srText).not.toBeNull();
    expect(srText!.textContent).toContain("inferred");
  });

  it("stale SealChip sr-text contains 'stale'", () => {
    const el = render(SealChip, {
      value: "1.9 MW",
      evidence: "projected",
      stale: true,
    });
    const srText = el.querySelector(".seal-chip-sr-text");
    expect(srText).not.toBeNull();
    expect(srText!.textContent).toContain("stale");
  });

  it("visual badge is aria-hidden so AT does not double-announce", () => {
    const el = render(SealChip, { value: "2.3 MW", evidence: "measured" });
    const badge = el.querySelector(".seal-chip-badge");
    expect(badge).not.toBeNull();
    expect(badge!.getAttribute("aria-hidden")).toBe("true");
  });

  it("carries evidence state class on the outer element", () => {
    const el = render(SealChip, { value: "2.3 MW", evidence: "projected" });
    const chip = el.querySelector(".seal-chip");
    expect(chip!.classList.contains("seal-chip-projected")).toBe(true);
  });

  it("carries stale class when stale prop is true", () => {
    const el = render(SealChip, {
      value: "1.9 MW",
      evidence: "projected",
      stale: true,
    });
    const chip = el.querySelector(".seal-chip");
    expect(chip!.classList.contains("seal-chip-stale")).toBe(true);
  });

  it("sr-text appears AFTER value in DOM (so citation order is value → seal)", () => {
    const el = render(SealChip, { value: "2.3 MW", evidence: "measured" });
    const children = [...el.querySelector(".seal-chip")!.children];
    const valueIdx = children.findIndex((c) =>
      c.classList.contains("seal-chip-value"),
    );
    const srIdx = children.findIndex((c) =>
      c.classList.contains("seal-chip-sr-text"),
    );
    expect(valueIdx).toBeGreaterThanOrEqual(0);
    expect(srIdx).toBeGreaterThanOrEqual(0);
    // sr-text must follow the value in DOM order (citation carries "value seal")
    expect(srIdx).toBeGreaterThan(valueIdx);
  });
});

// ─── KpiRegister ─────────────────────────────────────────────────────────────

describe("KpiRegister — boundary invariants", () => {
  it("renders measured value at display scale (large)", () => {
    const el = render(KpiRegister, {
      label: "ENERGY OUTPUT",
      measuredValue: "2.3 MW",
    });
    const measuredEl = el.querySelector(".kpi-register-measured-value");
    expect(measuredEl).not.toBeNull();
    expect(measuredEl!.textContent).toBe("2.3 MW");
  });

  it("renders the overline label", () => {
    const el = render(KpiRegister, {
      label: "ENERGY OUTPUT",
      measuredValue: "2.3 MW",
    });
    const labelEl = el.querySelector(".kpi-register-label");
    expect(labelEl).not.toBeNull();
    expect(labelEl!.textContent).toContain("ENERGY OUTPUT");
  });

  it("THROWS when projected value has no seal (boundary guard)", () => {
    // mount() throws synchronously because the guard is in the script body
    expect(() => {
      render(KpiRegister, {
        label: "ENERGY OUTPUT",
        measuredValue: "2.3 MW",
        projectedValue: "4.1 MW",
        // projectedSeal intentionally omitted — must throw
      });
    }).toThrow("[KpiRegister]");
  });

  it("does NOT throw when projected value has a seal", () => {
    expect(() => {
      render(KpiRegister, {
        label: "ENERGY OUTPUT",
        measuredValue: "2.3 MW",
        projectedValue: "4.1 MW",
        projectedSeal: { evidence: "projected", stale: false },
      });
    }).not.toThrow();
  });

  it("renders projected row when sealed projected value is provided", () => {
    const el = render(KpiRegister, {
      label: "ENERGY OUTPUT",
      measuredValue: "2.3 MW",
      projectedValue: "4.1 MW",
      projectedSeal: { evidence: "projected", stale: false },
    });
    const projectedRow = el.querySelector(".kpi-register-projected");
    expect(projectedRow).not.toBeNull();
  });

  it("measured value appears before projected in DOM (measured out-ranks)", () => {
    const el = render(KpiRegister, {
      label: "ENERGY OUTPUT",
      measuredValue: "2.3 MW",
      projectedValue: "4.1 MW",
      projectedSeal: { evidence: "projected", stale: false },
    });
    const register = el.querySelector(".kpi-register")!;
    const children = [...register.children];
    const measuredIdx = children.findIndex((c) =>
      c.classList.contains("kpi-register-measured"),
    );
    const projectedIdx = children.findIndex((c) =>
      c.classList.contains("kpi-register-projected"),
    );
    expect(measuredIdx).toBeGreaterThanOrEqual(0);
    expect(projectedIdx).toBeGreaterThanOrEqual(0);
    // measured must appear BEFORE projected in the DOM
    expect(measuredIdx).toBeLessThan(projectedIdx);
  });

  it("does not render projected row when no projected value is given", () => {
    const el = render(KpiRegister, {
      label: "ENERGY OUTPUT",
      measuredValue: "2.3 MW",
    });
    expect(el.querySelector(".kpi-register-projected")).toBeNull();
  });

  it("projected row contains a SealChip with the evidence state", () => {
    const el = render(KpiRegister, {
      label: "ENERGY OUTPUT",
      measuredValue: "2.3 MW",
      projectedValue: "4.1 MW",
      projectedSeal: { evidence: "projected", stale: false },
    });
    const sealChip = el.querySelector(".seal-chip");
    expect(sealChip).not.toBeNull();
    expect(sealChip!.classList.contains("seal-chip-projected")).toBe(true);
  });
});

// ─── CaminhoStateChip ────────────────────────────────────────────────────────

describe("CaminhoStateChip — four worded states", () => {
  const CASES: Array<[string, string]> = [
    ["to-verify", "To verify"],
    ["verified", "Verified"],
    ["not-verified", "Not verified"],
    ["not-done", "Not done"],
  ];

  for (const [state, word] of CASES) {
    it(`state "${state}" renders the word "${word}"`, () => {
      const el = render(CaminhoStateChip, { state });
      const chip = el.querySelector(".caminho-chip");
      expect(chip).not.toBeNull();
      expect(chip!.textContent?.trim()).toBe(word);
    });
  }

  it("carries the state as a CSS modifier class", () => {
    const el = render(CaminhoStateChip, { state: "verified" });
    const chip = el.querySelector(".caminho-chip");
    expect(chip!.classList.contains("caminho-chip-verified")).toBe(true);
  });

  it("all four states render distinct visible text (no icon-only encoding)", () => {
    const labels = new Set<string>();
    for (const [state] of CASES) {
      const el = render(CaminhoStateChip, { state });
      const text = el.querySelector(".caminho-chip")!.textContent?.trim() ?? "";
      expect(text.length).toBeGreaterThan(0);
      labels.add(text);
      component ? unmount(component) : undefined;
      component = undefined;
      target?.remove();
      target = undefined;
    }
    // All four states must render DIFFERENT labels
    expect(labels.size).toBe(4);
  });
});
