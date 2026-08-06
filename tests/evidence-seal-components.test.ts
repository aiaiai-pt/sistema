// @vitest-environment jsdom
//
// Rendered component tests for the H1 Slice 2 evidence seal primitives.
//
// The governing rule for this whole file: the design system owns the LAWS and a
// presentation tone scale, and owns NO seal words. The corpus carries three
// competing enumerations with no reconciling ruling, and the «previsto» wording
// is explicitly parked, so any enum baked into a component would silently decide
// both. These tests therefore assert the laws hold for arbitrary declared
// vocabularies — including all three of the corpus's — and assert that no
// vocabulary appears in the source at all.
//
// westeuropeco/atelier-urban-workspace#57

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import CaminhoStateChip from "../components/CaminhoStateChip.svelte";
import KpiRegister from "../components/KpiRegister.svelte";
import SealChip from "../components/SealChip.svelte";

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

// ─── the three competing enumerations, verbatim from the corpus ──────────────
//
// None of these is canonical; that reconciliation is an open operator call.
// They exist here as DATA to prove the component is indifferent to which wins.

/** The 2026-07-31 brief: a 3-term evidence axis, English. */
const BRIEF_VOCAB = {
  evidence: {
    direct_reading: { value: "measured", label: "measured", tone: "positive" },
    model_derived: { value: "inferred", label: "inferred", tone: "info" },
    future_window: { value: "projected", label: "projected", tone: "caution" },
  },
} as const;

/** Cycle-4's origin ruling: {confirmado · inferido · modelado} × the ICD-203-lite ladder. */
const CYCLE4_VOCAB = {
  evidence: {
    direct_reading: {
      value: "confirmed",
      label: "confirmado",
      tone: "positive",
    },
    model_derived: { value: "inferred", label: "inferido", tone: "info" },
    future_window: { value: "modelled", label: "modelado", tone: "caution" },
  },
  probability: {
    near_certain: { value: "near_certain", label: "quase certo" },
    probable: { value: "probable", label: "provável" },
    uncertain: { value: "uncertain", label: "incerto" },
    unlikely: { value: "unlikely", label: "pouco provável" },
  },
} as const;

/** Cycle-6 / PRD: a narrower 2-term evidence axis — two classes share one term. */
const CYCLE6_VOCAB = {
  evidence: {
    direct_reading: { value: "measured", label: "medido", tone: "positive" },
    model_derived: { value: "inferred", label: "inferido", tone: "info" },
    future_window: { value: "inferred", label: "inferido", tone: "info" },
  },
  probability: {
    probable: { value: "probable", label: "provável" },
    uncertain: { value: "uncertain", label: "incerto" },
  },
} as const;

// ─── The mechanism: one component, every enumeration, zero code change ────────

describe("SealChip — the vocabulary is data, not code", () => {
  it("renders the brief's 3-term English axis", () => {
    const el = render(SealChip, {
      value: "−18 cm",
      evidence: BRIEF_VOCAB.evidence.future_window,
    });
    expect(el.querySelector(".seal-chip-badge")!.textContent).toContain(
      "projected",
    );
  });

  it("renders cycle-4's PT axis and 4-term ladder — same component", () => {
    const el = render(SealChip, {
      value: "2,1 m",
      evidence: CYCLE4_VOCAB.evidence.future_window,
      probability: CYCLE4_VOCAB.probability.near_certain,
    });
    expect(el.querySelector(".seal-chip-badge")!.textContent).toContain(
      "modelado",
    );
    expect(el.querySelector(".seal-chip-probability")!.textContent).toContain(
      "quase certo",
    );
  });

  it("renders cycle-6's narrower 2-term axis, where two classes share one term", () => {
    const modelled = render(SealChip, {
      value: "2,1 m",
      evidence: CYCLE6_VOCAB.evidence.model_derived,
    });
    expect(modelled.querySelector(".seal-chip-badge")!.textContent).toContain(
      "inferido",
    );
    // A 2-term axis collapses future_window onto the same word — legal, and
    // expressible without touching a line of component code.
    expect(CYCLE6_VOCAB.evidence.future_window.label).toBe(
      CYCLE6_VOCAB.evidence.model_derived.label,
    );
  });

  it("renders a term nobody has proposed yet — the axis is genuinely open", () => {
    const el = render(SealChip, {
      value: "9 kt",
      evidence: { value: "attested", label: "attested by survey", tone: "info" },
      probability: { value: "wager", label: "better than even" },
    });
    expect(el.querySelector(".seal-chip-badge")!.textContent).toContain(
      "attested by survey",
    );
    expect(el.querySelector(".seal-chip-probability")!.textContent).toContain(
      "better than even",
    );
  });

  it("keeps the English code on the datum while rendering the localized label", () => {
    const el = render(SealChip, {
      value: "2,1 m",
      evidence: CYCLE6_VOCAB.evidence.direct_reading,
    });
    // Identifiers are English by law; the label is what a reader receives.
    expect(el.querySelector(".seal-chip")!.getAttribute("data-evidence")).toBe(
      "measured",
    );
    expect(el.querySelector(".seal-chip-badge")!.textContent).toContain(
      "medido",
    );
  });
});

// ─── No vocabulary may hide in the source ────────────────────────────────────

describe("the design system enumerates no seal words", () => {
  const sources = [
    "components/SealChip.svelte",
    "components/KpiRegister.svelte",
    "tokens/components.css",
  ];

  // Every seal word from every competing enumeration in the corpus.
  const SEAL_WORDS = [
    "measured",
    "inferred",
    "projected",
    "confirmado",
    "inferido",
    "modelado",
    "medido",
    "previsto",
    "quase certo",
    "provável",
    "incerto",
    "pouco provável",
  ];

  for (const source of sources) {
    it(`${source} contains no seal vocabulary`, () => {
      const root = join(import.meta.dirname, "..");
      // Strip the prose blocks: doc comments legitimately discuss the corpus's
      // words in order to explain why none of them are hardcoded. What must
      // stay clean is the executable part.
      const text = readFileSync(join(root, source), "utf-8")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");

      const found = SEAL_WORDS.filter((word) =>
        new RegExp(`\\b${word.replace(/\s/g, "\\s")}\\b`, "i").test(text),
      );
      expect(
        found,
        `${source} hardcodes seal vocabulary: ${found.join(", ")}. ` +
          "The words are declared data; the design system owns only the laws.",
      ).toEqual([]);
    });
  }
});

// ─── LAW: never label-alone; no seal without its evidence chip ───────────────

describe("SealChip — law: a seal never renders without its evidence chip", () => {
  it("THROWS when the evidence term is absent", () => {
    expect(() => render(SealChip, { value: "4.1 MW" })).toThrow(
      /evidence axis needs a declared term/i,
    );
  });

  it("THROWS when the evidence term has an empty label", () => {
    expect(() =>
      render(SealChip, {
        value: "4.1 MW",
        evidence: { value: "x", label: "  " },
      }),
    ).toThrow(/non-empty label/i);
  });

  it("THROWS on probability without evidence — probability alone is not valid", () => {
    expect(() =>
      render(SealChip, {
        value: "2.1 m",
        probability: { value: "probable", label: "provável" },
      }),
    ).toThrow(/evidence axis needs a declared term/i);
  });

  it("accepts evidence alone — evidence-alone IS a valid seal", () => {
    const el = render(SealChip, {
      value: "+14 cm/h",
      evidence: CYCLE6_VOCAB.evidence.direct_reading,
    });
    expect(el.querySelector(".seal-chip-badge")!.textContent!.trim()).not.toBe(
      "",
    );
    expect(el.querySelector(".seal-chip-probability")).toBeNull();
  });

  it("THROWS on a tone outside the design system's own scale", () => {
    expect(() =>
      render(SealChip, {
        value: "2.1 m",
        evidence: { value: "x", label: "x", tone: "chartreuse" },
      }),
    ).toThrow(/tone scale is/i);
  });
});

// ─── LAW: two orthogonal axes, never mixed in one phrase ─────────────────────

describe("SealChip — two orthogonal axes, never merged", () => {
  it("renders the axes as two separate adjacent chips", () => {
    const el = render(SealChip, {
      value: "2,1 m",
      evidence: CYCLE4_VOCAB.evidence.model_derived,
      probability: CYCLE4_VOCAB.probability.uncertain,
    });
    const evidenceChip = el.querySelector(".seal-chip-badge")!;
    const probabilityChip = el.querySelector(".seal-chip-probability")!;

    expect(evidenceChip.textContent).toContain("inferido");
    expect(evidenceChip.textContent).not.toContain("incerto");
    expect(probabilityChip.textContent).toContain("incerto");
    expect(probabilityChip.textContent).not.toContain("inferido");
    // Neither contains the other: two elements, never one merged phrase.
    expect(probabilityChip.contains(evidenceChip)).toBe(false);
    expect(evidenceChip.contains(probabilityChip)).toBe(false);
  });

  it("stitches sr-text as «{value} — {evidence}[, {probability}][, stale]»", () => {
    const el = render(SealChip, {
      value: "2,1 m",
      evidence: CYCLE4_VOCAB.evidence.model_derived,
      probability: CYCLE4_VOCAB.probability.uncertain,
      stale: true,
      staleLabel: "obsoleto",
    });
    expect(el.querySelector(".seal-chip-sr-text")!.textContent!.trim()).toBe(
      "2,1 m — inferido, incerto, obsoleto",
    );
  });

  it("stitches evidence-alone sr-text with no probability clause", () => {
    const el = render(SealChip, {
      value: "+14 cm/h",
      evidence: BRIEF_VOCAB.evidence.direct_reading,
    });
    expect(el.querySelector(".seal-chip-sr-text")!.textContent!.trim()).toBe(
      "+14 cm/h — measured",
    );
  });

  it("treats stale as an orthogonal state, not a vocabulary member", () => {
    const el = render(SealChip, {
      value: "1,9 MW",
      evidence: BRIEF_VOCAB.evidence.future_window,
      stale: true,
    });
    // Same evidence term, plus a separate state — the term is untouched.
    expect(el.querySelector(".seal-chip")!.getAttribute("data-evidence")).toBe(
      "projected",
    );
    expect([...el.querySelector(".seal-chip")!.classList]).toContain(
      "seal-chip-stale",
    );
  });

  it("does not announce the value twice — the visual value is aria-hidden", () => {
    const el = render(SealChip, {
      value: "2.3 MW",
      evidence: BRIEF_VOCAB.evidence.direct_reading,
    });
    expect(
      el.querySelector(".seal-chip-value")!.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(
      el.querySelector(".seal-chip-badge")!.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("sr-text follows the value in DOM order, so a citation reads value → seal", () => {
    const el = render(SealChip, {
      value: "2.3 MW",
      evidence: BRIEF_VOCAB.evidence.direct_reading,
    });
    const children = [...el.querySelector(".seal-chip")!.children];
    const valueIdx = children.findIndex((c) =>
      c.classList.contains("seal-chip-value"),
    );
    const srIdx = children.findIndex((c) =>
      c.classList.contains("seal-chip-sr-text"),
    );
    expect(valueIdx).toBeGreaterThanOrEqual(0);
    expect(srIdx).toBeGreaterThan(valueIdx);
  });
});

// ─── LAW: a «why» is always reachable, one tap away ──────────────────────────

describe("SealChip — law: a «why» is always reachable from the seal", () => {
  const WHY = "the 16:00 window has already passed";
  const base = {
    value: "−18 cm",
    evidence: BRIEF_VOCAB.evidence.future_window,
    why: WHY,
  };

  it("exposes the seal as a real button when a why is provided", () => {
    const el = render(SealChip, base);
    const trigger = el.querySelector("button.seal-chip-why-trigger");
    expect(trigger).not.toBeNull();
    expect(trigger!.tagName).toBe("BUTTON");
    expect(trigger!.getAttribute("aria-expanded")).toBe("false");
  });

  it("names the why trigger from the caller's localized pattern", () => {
    const el = render(SealChip, { ...base, whyLabel: "porquê — {term}" });
    expect(
      el
        .querySelector("button.seal-chip-why-trigger")!
        .getAttribute("aria-label"),
    ).toBe("porquê — projected");
  });

  it("one click reveals the provenance one-liner and flips aria-expanded", () => {
    const el = render(SealChip, base);
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
    expect(trigger.getAttribute("aria-controls")).toBe(panel!.id);
    expect(panel!.id).not.toBe("");
  });

  it("Escape inside the disclosure closes it", () => {
    const el = render(SealChip, base);
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
    const el = render(SealChip, { ...base, closeLabel: "Fechar" });
    el.querySelector<HTMLButtonElement>("button.seal-chip-why-trigger")!.click();
    flushSync();

    const close = el.querySelector<HTMLButtonElement>(".seal-chip-why-close")!;
    expect(close).not.toBeNull();
    expect(close.getAttribute("aria-label")).toBe("Fechar");
    close.click();
    flushSync();
    expect(el.querySelector(".seal-chip-why-panel")).toBeNull();
  });

  it("keeps disclosure state in component state, not on the DOM chip", () => {
    const el = render(SealChip, base);
    el.querySelector<HTMLButtonElement>("button.seal-chip-why-trigger")!.click();
    flushSync();
    // The proto held disclosure state in a data-attribute; that is a recorded
    // residual and must not come back.
    expect(el.querySelector(".seal-chip")!.hasAttribute("data-why")).toBe(false);
    expect(el.querySelector(".seal-chip")!.hasAttribute("data-selo")).toBe(
      false,
    );
  });

  it("stays a plain span when no why is supplied (no empty disclosure)", () => {
    const el = render(SealChip, {
      value: "2.3 MW",
      evidence: BRIEF_VOCAB.evidence.direct_reading,
    });
    expect(el.querySelector("button.seal-chip-why-trigger")).toBeNull();
  });
});

// ─── KpiRegister ─────────────────────────────────────────────────────────────

const readingSeal = {
  evidence: BRIEF_VOCAB.evidence.direct_reading,
  evidenceClass: "direct_reading",
  stale: false,
};
const forecastSeal = {
  evidence: BRIEF_VOCAB.evidence.future_window,
  evidenceClass: "future_window",
  stale: false,
};

describe("KpiRegister — boundary invariants", () => {
  it("renders the overline label and the primary value", () => {
    const el = render(KpiRegister, {
      label: "WATER LEVEL",
      primaryValue: "+14 cm/h",
    });
    expect(el.querySelector(".kpi-register-label")!.textContent).toBe(
      "WATER LEVEL",
    );
    expect(el.querySelector(".kpi-register-primary")!.textContent).toContain(
      "+14 cm/h",
    );
  });

  it("THROWS when the secondary value carries no seal", () => {
    expect(() =>
      render(KpiRegister, {
        label: "WATER LEVEL",
        primaryValue: "+14 cm/h",
        secondaryValue: "−18 cm",
      }),
    ).toThrow(/secondary value must carry a seal/i);
  });

  it("does NOT throw when the secondary value carries a seal", () => {
    expect(() =>
      render(KpiRegister, {
        label: "WATER LEVEL",
        primaryValue: "+14 cm/h",
        secondaryValue: "−18 cm",
        secondarySeal: forecastSeal,
      }),
    ).not.toThrow();
  });

  it("does not render a secondary register when no secondary value is given", () => {
    const el = render(KpiRegister, {
      label: "WATER LEVEL",
      primaryValue: "+14 cm/h",
    });
    expect(el.querySelector(".kpi-register-secondary")).toBeNull();
  });

  it("carries the why through to the secondary value's seal", () => {
    const el = render(KpiRegister, {
      label: "WATER LEVEL",
      primaryValue: "+14 cm/h",
      secondaryValue: "−18 cm",
      secondarySeal: forecastSeal,
      secondaryWhy: "derived from the 14:00–16:00 tide model run",
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
});

// ─── LAW: the more authoritative value out-ranks, structurally ───────────────

describe("KpiRegister — law: the more authoritative value out-ranks", () => {
  const props = {
    label: "WATER LEVEL",
    primaryValue: "+14 cm/h",
    primarySeal: readingSeal,
    secondaryValue: "−18 cm",
    secondarySeal: forecastSeal,
  };

  it("places the primary register before the secondary in DOM order", () => {
    const el = render(KpiRegister, props);
    const children = [...el.querySelector(".kpi-register")!.children];
    const primaryIdx = children.findIndex((c) =>
      c.classList.contains("kpi-register-primary"),
    );
    const secondaryIdx = children.findIndex((c) =>
      c.classList.contains("kpi-register-secondary"),
    );
    expect(primaryIdx).toBeGreaterThanOrEqual(0);
    expect(secondaryIdx).toBeGreaterThan(primaryIdx);
  });

  it("reaches the primary value first in screen-reader reading order", () => {
    const el = render(KpiRegister, props);
    const text = el.textContent!;
    expect(text.indexOf("+14 cm/h")).toBeGreaterThanOrEqual(0);
    expect(text.indexOf("−18 cm")).toBeGreaterThan(text.indexOf("+14 cm/h"));
  });

  it("THROWS when a more authoritative value is seated in the lower register", () => {
    expect(() =>
      render(KpiRegister, {
        label: "WATER LEVEL",
        primaryValue: "−18 cm",
        primarySeal: forecastSeal,
        secondaryValue: "+14 cm/h",
        secondarySeal: readingSeal,
      }),
    ).toThrow(/out-ranks the primary/i);
  });

  it("enforces the ranking by class, so it holds for any vocabulary", () => {
    // Same structural violation, expressed entirely in cycle-4's PT terms.
    expect(() =>
      render(KpiRegister, {
        label: "NÍVEL",
        primaryValue: "−18 cm",
        primarySeal: {
          evidence: CYCLE4_VOCAB.evidence.future_window,
          evidenceClass: "future_window",
          stale: false,
        },
        secondaryValue: "+14 cm/h",
        secondarySeal: {
          evidence: CYCLE4_VOCAB.evidence.direct_reading,
          evidenceClass: "direct_reading",
          stale: false,
        },
      }),
    ).toThrow(/out-ranks the primary/i);
  });
});

// ─── CaminhoStateChip ────────────────────────────────────────────────────────

describe("CaminhoStateChip — four worded states", () => {
  const cases: [string, string][] = [
    ["to-verify", "To verify"],
    ["verified", "Verified"],
    ["not-verified", "Not verified"],
    ["not-done", "Not done"],
  ];

  for (const [state, word] of cases) {
    it(`state "${state}" renders the word "${word}"`, () => {
      const el = render(CaminhoStateChip, { state });
      expect(el.textContent!.trim()).toBe(word);
    });
  }

  it("carries the state as a CSS modifier class", () => {
    const el = render(CaminhoStateChip, { state: "verified" });
    expect(
      el
        .querySelector(".caminho-chip")!
        .classList.contains("caminho-chip-verified"),
    ).toBe(true);
  });

  it("all four states render distinct visible text (no icon-only encoding)", () => {
    const words = new Set<string>();
    for (const [state] of cases) {
      const el = render(CaminhoStateChip, { state });
      words.add(el.textContent!.trim());
    }
    expect(words.size).toBe(4);
  });
});
