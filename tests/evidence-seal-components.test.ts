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

// ─── SealChip — the evidence-chip law ────────────────────────────────────────
//
// LAW: "a seal NEVER appears without evidence chips."
//
// Before the guard existed, <SealChip value="4.1 MW" /> mounted happily and
// rendered an EMPTY badge plus an EMPTY sr-text — a value dressed as a sealed
// datum, carrying no evidence at all and announcing nothing to a screen reader.
// An out-of-vocabulary word rendered verbatim as the seal label.
//
// SealChip is a boundary element: it fails loudly rather than render a
// sealless seal, the same policy KpiRegister applies to unsealed projections.

describe("SealChip — law: a seal never renders without its evidence chip", () => {
  it("THROWS when evidence is absent", () => {
    expect(() => render(SealChip, { value: "4.1 MW" })).toThrow(
      /must carry an evidence state/i,
    );
  });

  it("THROWS when evidence is outside the closed vocabulary", () => {
    expect(() =>
      render(SealChip, { value: "4.1 MW", evidence: "vibes" }),
    ).toThrow(/measured.*inferred.*projected/i);
  });

  it.each(["measured", "inferred", "projected"])(
    "accepts %s and renders a non-empty evidence chip and sr-text",
    (evidence) => {
      const el = render(SealChip, { value: "4.1 MW", evidence });
      expect(
        el.querySelector(".seal-chip-badge")!.textContent!.trim(),
      ).not.toBe("");
      expect(el.querySelector(".seal-chip-sr-text")!.textContent).toContain(
        evidence,
      );
    },
  );
});

// ─── SealChip — the two axes ─────────────────────────────────────────────────
//
// LAW: evidence {measured·inferred·projected} and probability {probable·uncertain}
// are orthogonal and NEVER merge into one phrase (03-evidence.md:109-110 —
// "two adjacent chips, never one merged phrase"). Evidence alone is valid;
// probability alone is not (03-evidence.md:80-82, PRD 5.1.2).
//
// No data source populates the probability axis in H1 — the SLOT exists in the
// frozen Selo type and the chip grammar, and renders only when a source fills it.

describe("SealChip — two orthogonal axes, never merged", () => {
  it("renders no probability chip when the axis is unpopulated", () => {
    const el = render(SealChip, { value: "2.3 MW", evidence: "measured" });
    expect(el.querySelector(".seal-chip-probability")).toBeNull();
  });

  it("renders probability as a SEPARATE adjacent chip, not merged with evidence", () => {
    const el = render(SealChip, {
      value: "2.1 m",
      evidence: "inferred",
      probability: "uncertain",
    });
    const evidenceChip = el.querySelector(".seal-chip-badge")!;
    const probabilityChip = el.querySelector(".seal-chip-probability")!;
    expect(probabilityChip).not.toBeNull();
    // Two distinct elements — neither contains the other's word.
    expect(evidenceChip.textContent).toContain("inferred");
    expect(evidenceChip.textContent).not.toContain("uncertain");
    expect(probabilityChip.textContent).toContain("uncertain");
    expect(probabilityChip.textContent).not.toContain("inferred");
    expect(probabilityChip.contains(evidenceChip)).toBe(false);
    expect(evidenceChip.contains(probabilityChip)).toBe(false);
  });

  it("THROWS on probability without evidence — probability alone is not valid", () => {
    expect(() =>
      render(SealChip, { value: "2.1 m", probability: "probable" }),
    ).toThrow(/must carry an evidence state/i);
  });

  it("THROWS on a probability outside the closed vocabulary", () => {
    expect(() =>
      render(SealChip, {
        value: "2.1 m",
        evidence: "inferred",
        probability: "very likely",
      }),
    ).toThrow(/probable.*uncertain/i);
  });

  it("stitches sr-text as «{value} — {evidence}[, {probability}][, stale]»", () => {
    const el = render(SealChip, {
      value: "2,1 m",
      evidence: "inferred",
      probability: "uncertain",
      stale: true,
    });
    expect(el.querySelector(".seal-chip-sr-text")!.textContent!.trim()).toBe(
      "2,1 m — inferred, uncertain, stale",
    );
  });

  it("stitches evidence-alone sr-text without a probability clause", () => {
    const el = render(SealChip, { value: "+14 cm/h", evidence: "measured" });
    expect(el.querySelector(".seal-chip-sr-text")!.textContent!.trim()).toBe(
      "+14 cm/h — measured",
    );
  });

  it("does not announce the value twice — the visual value is aria-hidden", () => {
    const el = render(SealChip, { value: "2.3 MW", evidence: "measured" });
    expect(
      el.querySelector(".seal-chip-value")!.getAttribute("aria-hidden"),
    ).toBe("true");
  });
});

// ─── SealChip — the «why» disclosure ─────────────────────────────────────────
//
// LAW: a «why» is ALWAYS reachable from the seal — one tap/click away
// (03-evidence.md:110-115, :131-133, :139).
// The chip is a real <button> with aria-expanded opening the provenance
// one-liner; click/Enter/Space toggle; Esc closes; the panel carries a visible
// close affordance; the button is named «why — {evidence}».
// Disclosure state lives in component state, never the DOM.

describe("SealChip — law: a «why» is always reachable from the seal", () => {
  const WHY = "the 16:00 window has already passed";

  it("exposes the seal as a real button when a why is provided", () => {
    const el = render(SealChip, {
      value: "−18 cm",
      evidence: "projected",
      why: WHY,
    });
    const trigger = el.querySelector("button.seal-chip-why-trigger");
    expect(trigger).not.toBeNull();
    expect(trigger!.tagName).toBe("BUTTON");
    expect(trigger!.getAttribute("aria-expanded")).toBe("false");
  });

  it("names the why button «why — {evidence}»", () => {
    const el = render(SealChip, {
      value: "−18 cm",
      evidence: "projected",
      why: WHY,
    });
    expect(
      el
        .querySelector("button.seal-chip-why-trigger")!
        .getAttribute("aria-label"),
    ).toBe("why — projected");
  });

  it("one click reveals the provenance one-liner and flips aria-expanded", () => {
    const el = render(SealChip, {
      value: "−18 cm",
      evidence: "projected",
      why: WHY,
    });
    const trigger = el.querySelector<HTMLButtonElement>(
      "button.seal-chip-why-trigger",
    )!;
    expect(el.querySelector(".seal-chip-why-panel")).toBeNull();

    trigger.click();
    flushSync();

    const panel = el.querySelector(".seal-chip-why-panel");
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain(WHY);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    // The panel is the element the trigger points at.
    expect(trigger.getAttribute("aria-controls")).toBe(panel!.id);
    expect(panel!.id).not.toBe("");
  });

  it("Escape inside the disclosure closes it", () => {
    const el = render(SealChip, {
      value: "−18 cm",
      evidence: "projected",
      why: WHY,
    });
    const trigger = el.querySelector<HTMLButtonElement>(
      "button.seal-chip-why-trigger",
    )!;
    trigger.click();
    flushSync();
    expect(el.querySelector(".seal-chip-why-panel")).not.toBeNull();

    el.querySelector(".seal-chip")!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    flushSync();

    expect(el.querySelector(".seal-chip-why-panel")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("the open disclosure carries a visible close affordance (Esc/X parity)", () => {
    const el = render(SealChip, {
      value: "−18 cm",
      evidence: "projected",
      why: WHY,
    });
    el.querySelector<HTMLButtonElement>(
      "button.seal-chip-why-trigger",
    )!.click();
    flushSync();

    const close = el.querySelector<HTMLButtonElement>(".seal-chip-why-close")!;
    expect(close).not.toBeNull();
    // Named for AT, and it actually closes.
    expect(close.getAttribute("aria-label")).toMatch(/close/i);
    close.click();
    flushSync();
    expect(el.querySelector(".seal-chip-why-panel")).toBeNull();
  });

  it("keeps disclosure state in component state, not on the DOM chip", () => {
    const el = render(SealChip, {
      value: "−18 cm",
      evidence: "projected",
      why: WHY,
    });
    el.querySelector<HTMLButtonElement>(
      "button.seal-chip-why-trigger",
    )!.click();
    flushSync();
    // The proto held disclosure state in a data-attribute; that is a recorded
    // residual (cycle4.md:542) and must not come back.
    expect(el.querySelector(".seal-chip")!.hasAttribute("data-why")).toBe(
      false,
    );
    expect(el.querySelector(".seal-chip")!.hasAttribute("data-selo")).toBe(
      false,
    );
  });

  it("stays a plain span when no why is supplied (no empty disclosure)", () => {
    const el = render(SealChip, { value: "2.3 MW", evidence: "measured" });
    expect(el.querySelector("button.seal-chip-why-trigger")).toBeNull();
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

  it("carries the why through to the projected value's seal", () => {
    const el = render(KpiRegister, {
      label: "WATER LEVEL",
      measuredValue: "+14 cm/h",
      projectedValue: "−18 cm",
      projectedSeal: { evidence: "projected", stale: false },
      projectedWhy: "derived from the 14:00–16:00 tide model run",
    });
    const trigger = el.querySelector<HTMLButtonElement>(
      "button.seal-chip-why-trigger",
    )!;
    expect(trigger).not.toBeNull();
    trigger.click();
    flushSync();
    expect(el.querySelector(".seal-chip-why-panel")!.textContent).toContain(
      "tide model run",
    );
  });

  it("carries the probability axis through to the projected value's seal", () => {
    const el = render(KpiRegister, {
      label: "WATER LEVEL",
      measuredValue: "+14 cm/h",
      projectedValue: "−18 cm",
      projectedSeal: {
        evidence: "projected",
        probability: "uncertain",
        stale: false,
      },
    });
    expect(el.querySelector(".seal-chip-probability")!.textContent).toContain(
      "uncertain",
    );
  });

  it("measured out-ranks projected in what a screen reader reaches first", () => {
    const el = render(KpiRegister, {
      label: "WATER LEVEL",
      measuredValue: "+14 cm/h",
      projectedValue: "−18 cm",
      projectedSeal: { evidence: "projected", stale: false },
    });
    // The register's own AT order: the measured number is plain text reached
    // before the projected value's stitched seal phrase.
    const text = el.textContent!;
    expect(text.indexOf("+14 cm/h")).toBeGreaterThanOrEqual(0);
    expect(text.indexOf("−18 cm")).toBeGreaterThan(text.indexOf("+14 cm/h"));
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
