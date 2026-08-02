// @vitest-environment jsdom
//
// The four investigations card FACES as registered widget kinds.
//
// The governing rule, same as the evidence seal's: these widgets own LAWS and
// generic presentation variants, and own NO product vocabulary and NO copy. Kind
// codes, agent terms, status terms, seal terms and every visible word arrive as
// declared data. A face that baked any of them in could not travel between a
// board, a profile and a painel — which is the whole reason they are registry
// kinds rather than components in a product package.
//
// westeuropeco/atelier-urban-workspace#57 lane follow-on

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry } from "../../src/core/index";
import {
  CHART_TILE_MOCK_KEY,
  CHART_TILE_MOCK_KIND,
  ChartTileMockWidget,
  DEFINITION_MEMBERS_CARD_KEY,
  DEFINITION_MEMBERS_CARD_KIND,
  DefinitionMembersCardWidget,
  ENTRY_STREAM_KEY,
  ENTRY_STREAM_KIND,
  EntryStreamWidget,
  INDICATOR_CARD_KEY,
  INDICATOR_CARD_KIND,
  IndicatorCardWidget,
  registerBaseWidgets,
  type WidgetComponent,
} from "../../src/widgets/index";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) {
    try {
      unmount(component);
    } catch {
      /* components that threw on mount */
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

/** A term already resolved from a declared vocabulary. */
const term = (value: string, label: string, tone?: string) => ({
  value,
  label,
  ...(tone ? { tone } : {}),
});

// ─── Registration ────────────────────────────────────────────────────────────

describe("the four faces are registered widget kinds", () => {
  const cases: [string, string][] = [
    [ENTRY_STREAM_KIND, ENTRY_STREAM_KEY],
    [INDICATOR_CARD_KIND, INDICATOR_CARD_KEY],
    [DEFINITION_MEMBERS_CARD_KIND, DEFINITION_MEMBERS_CARD_KEY],
    [CHART_TILE_MOCK_KIND, CHART_TILE_MOCK_KEY],
  ];

  for (const [kind, key] of cases) {
    it(`kind "${kind}" resolves to "${key}"`, () => {
      const registry = createRegistry<WidgetComponent>();
      registerBaseWidgets(registry);
      expect(registry.resolve({ kind })?.key).toBe(key);
    });
  }

  it("the faces do not collide with the pre-existing chart/embed kinds", () => {
    const registry = createRegistry<WidgetComponent>();
    registerBaseWidgets(registry);
    expect(registry.resolve({ kind: "chart" })?.key).toBe("native-chart");
    expect(registry.resolve({ kind: "embed" })?.key).toBe("embedded-analysis");
  });

  it("an unknown kind still resolves to nothing — no heuristic fallback", () => {
    const registry = createRegistry<WidgetComponent>();
    registerBaseWidgets(registry);
    expect(registry.resolve({ kind: "no-such-kind" })).toBeNull();
  });
});

// ─── No vocabulary and no copy may hide in a face ────────────────────────────

describe("the faces carry no product vocabulary and no copy", () => {
  const sources = [
    "EntryStreamWidget.svelte",
    "IndicatorCardWidget.svelte",
    "DefinitionMembersCardWidget.svelte",
    "ChartTileMockWidget.svelte",
  ];

  // Declared vocabulary from the workspace sheet plus the seal's competing
  // enumerations — none of it may be baked into a face.
  const VOCABULARY = [
    "question",
    "answer",
    "system",
    "planner",
    "platform",
    "automation",
    "pergunta",
    "resposta",
    "medido",
    "inferido",
    "modelado",
    "previsto",
    "provável",
    "incerto",
    "exploração",
    "investigation",
  ];

  for (const source of sources) {
    it(`${source} bakes in no declared vocabulary`, () => {
      const text = readFileSync(
        join(import.meta.dirname, "../../src/widgets", source),
        "utf-8",
      )
        // Prose legitimately names the vocabulary to explain why it is absent.
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");

      const found = VOCABULARY.filter((word) =>
        new RegExp(`["'\`]${word}["'\`]`, "i").test(text),
      );
      expect(
        found,
        `${source} hardcodes declared vocabulary: ${found.join(", ")}`,
      ).toEqual([]);
    });
  }
});

// ─── entry-stream ────────────────────────────────────────────────────────────

const PRESENTATION = {
  q: { variant: "bubble", align: "end", label: "pergunta" },
  a: { variant: "prose" },
  sys: { variant: "quiet" },
};

const streamData = {
  entries: [
    { id: "1", kind: "q", at: "14:02", body: "porque inundou a baixa?" },
    {
      id: "2",
      kind: "a",
      at: "14:03",
      body: "a maré coincidiu com a chuva",
      citations: [{ label: "maré 16:00", ref: "c1" }],
      seal: { evidence: term("inferred", "inferido", "info") },
    },
    { id: "3", kind: "sys", at: "14:04", body: "vista fixada" },
  ],
};

describe("entry-stream", () => {
  it("renders each entry in its DECLARED variant, not by kind name", () => {
    const el = render(EntryStreamWidget, {
      data: streamData,
      props: { presentation: PRESENTATION },
    });
    expect(el.querySelector('[data-kind="q"]')!.classList).toContain(
      "entry-stream-bubble",
    );
    expect(el.querySelector('[data-kind="a"]')!.classList).toContain(
      "entry-stream-prose",
    );
    expect(el.querySelector('[data-kind="sys"]')!.classList).toContain(
      "entry-stream-quiet",
    );
  });

  it("re-declaring the SAME kinds to different variants changes the face", () => {
    // The proof that the mapping is data: identical entries, different arrangement.
    const el = render(EntryStreamWidget, {
      data: streamData,
      props: {
        presentation: { ...PRESENTATION, sys: { variant: "bubble" } },
      },
    });
    expect(el.querySelector('[data-kind="sys"]')!.classList).toContain(
      "entry-stream-bubble",
    );
  });

  it("LAW: an entry whose kind is not declared THROWS rather than falling back", () => {
    expect(() =>
      render(EntryStreamWidget, {
        data: { entries: [{ kind: "undeclared", body: "x" }] },
        props: { presentation: PRESENTATION },
      }),
    ).toThrow(/has no declared presentation/i);
  });

  it("rejects a variant outside the generic set", () => {
    expect(() =>
      render(EntryStreamWidget, {
        data: { entries: [{ kind: "q", body: "x" }] },
        props: { presentation: { q: { variant: "shouty" } } },
      }),
    ).toThrow(/Unknown variant/i);
  });

  it("renders citations as chips and calls back with the opaque ref", () => {
    const onCitation = vi.fn();
    const el = render(EntryStreamWidget, {
      data: streamData,
      props: { presentation: PRESENTATION, onCitation },
    });
    const chip = el.querySelector<HTMLButtonElement>(
      ".entry-stream-citation-action",
    )!;
    expect(chip.textContent).toContain("maré 16:00");
    chip.click();
    expect(onCitation).toHaveBeenCalledWith("c1");
  });

  it("renders a sealed body through SealChip so the seal rides the statement", () => {
    const el = render(EntryStreamWidget, {
      data: streamData,
      props: { presentation: PRESENTATION },
    });
    const sr = el.querySelector(".seal-chip-sr-text")!;
    expect(sr.textContent).toContain("a maré coincidiu com a chuva — inferido");
  });

  it("ONE LIVE REGION: the log never announces on its own", () => {
    const el = render(EntryStreamWidget, {
      data: streamData,
      props: { presentation: PRESENTATION },
    });
    const log = el.querySelector('[role="log"]')!;
    expect(log.getAttribute("aria-live")).toBe("off");
  });

  it("exposes keyboard jumps to either end of the record", () => {
    const el = render(EntryStreamWidget, {
      data: streamData,
      props: {
        presentation: PRESENTATION,
        toStartLabel: "ao início",
        toEndLabel: "ao fim",
      },
    });
    const jumps = el.querySelectorAll<HTMLButtonElement>(".entry-stream-jump");
    expect(jumps.length).toBe(2);
    jumps[1].click();
    flushSync();
    expect(document.activeElement).toBe(
      el.querySelectorAll(".entry-stream-entry")[2],
    );
  });

  it("omits the reading controls entirely when no copy is supplied", () => {
    const el = render(EntryStreamWidget, {
      data: streamData,
      props: { presentation: PRESENTATION },
    });
    expect(el.querySelector(".entry-stream-nav")).toBeNull();
  });
});

// ─── indicator-card ──────────────────────────────────────────────────────────

describe("indicator-card", () => {
  it("renders the numeral and its unit", () => {
    const el = render(IndicatorCardWidget, {
      data: { value: "12", unit: "ocorrências" },
      props: { label: "ABERTAS" },
    });
    expect(el.querySelector(".indicator-card-value")!.textContent).toBe("12");
    expect(el.querySelector(".indicator-card-unit")!.textContent).toBe(
      "ocorrências",
    );
  });

  it("LAW: it never fetches — drill is a callback carrying the opaque ref", () => {
    const onDrill = vi.fn();
    const el = render(IndicatorCardWidget, {
      data: { value: "12", drillRef: { view: "open" } },
      props: { drillLabel: "ver os 12 →", onDrill },
    });
    el.querySelector<HTMLButtonElement>(".indicator-card-drill")!.click();
    expect(onDrill).toHaveBeenCalledWith({ view: "open" });
  });

  it("omits the drill affordance when the caller supplies no copy for it", () => {
    const el = render(IndicatorCardWidget, {
      data: { value: "12" },
      props: { onDrill: () => {} },
    });
    expect(el.querySelector(".indicator-card-drill")).toBeNull();
  });

  it("renders a sealed value through SealChip, with provenance as its why", () => {
    const el = render(IndicatorCardWidget, {
      data: {
        value: "2,1",
        unit: "m",
        provenance: "modelo de maré 14:00–16:00",
        seal: { evidence: term("projected", "modelado", "caution") },
      },
      props: { whyLabel: "porquê — {term}" },
    });
    expect(el.querySelector(".seal-chip-sr-text")!.textContent).toContain(
      "2,1 m — modelado",
    );
    expect(
      el
        .querySelector(".seal-chip-why-trigger")!
        .getAttribute("aria-label"),
    ).toBe("porquê — modelado");
    // Not printed twice: the seal's why carries it.
    expect(el.querySelector(".indicator-card-provenance")).toBeNull();
  });

  it("shows the provenance line when the value is unsealed", () => {
    const el = render(IndicatorCardWidget, {
      data: { value: "12", provenance: "contagem directa" },
      props: {},
    });
    expect(el.querySelector(".indicator-card-provenance")!.textContent).toBe(
      "contagem directa",
    );
  });

  it("renders a declared status term in its declared tone", () => {
    const el = render(IndicatorCardWidget, {
      data: { value: "12", status: term("rising", "a subir", "caution") },
      props: {},
    });
    const chip = el.querySelector(".indicator-card-status")!;
    expect(chip.textContent).toBe("a subir");
    expect([...chip.classList]).toContain("seal-tone-caution");
  });
});

// ─── definition-members-card ─────────────────────────────────────────────────

const membersData = {
  members: [
    { label: "Sensor A", detail: "rua da Boavista", ref: "m1" },
    { label: "Sensor B", ref: "m2" },
  ],
};

describe("definition-members-card", () => {
  it("LAW: members are NEVER a naked list — no provenance, no render", () => {
    expect(() =>
      render(DefinitionMembersCardWidget, {
        data: membersData,
        props: { title: "MEMBROS" },
      }),
    ).toThrow(/must declare its provenance/i);
  });

  it("also refuses a whitespace-only provenance header", () => {
    expect(() =>
      render(DefinitionMembersCardWidget, {
        data: membersData,
        props: { provenance: "   " },
      }),
    ).toThrow(/must declare its provenance/i);
  });

  it("puts the provenance header BEFORE any member in reading order", () => {
    const el = render(DefinitionMembersCardWidget, {
      data: membersData,
      props: { provenance: "vista de ontologia · sensores activos" },
    });
    const text = el.textContent!;
    expect(text.indexOf("vista de ontologia")).toBeGreaterThanOrEqual(0);
    expect(text.indexOf("Sensor A")).toBeGreaterThan(
      text.indexOf("vista de ontologia"),
    );
  });

  it("uses the caller's count, never members.length", () => {
    // A truncated page must not under-report the set.
    const el = render(DefinitionMembersCardWidget, {
      data: membersData,
      props: { provenance: "p", countLabel: "312 membros" },
    });
    expect(el.querySelector(".definition-members-card-count")!.textContent).toBe(
      "312 membros",
    );
  });

  it("drill and expand are callbacks carrying opaque refs", () => {
    const onDrill = vi.fn();
    const onExpand = vi.fn();
    const el = render(DefinitionMembersCardWidget, {
      data: membersData,
      props: {
        provenance: "p",
        drillLabel: "abrir",
        onDrill,
        expandLabel: "ver todos",
        onExpand,
      },
    });
    el.querySelectorAll<HTMLButtonElement>(
      ".definition-members-card-row-action",
    )[1].click();
    expect(onDrill).toHaveBeenCalledWith("m2");
    el.querySelector<HTMLButtonElement>(".definition-members-card-expand")!.click();
    expect(onExpand).toHaveBeenCalled();
  });

  it("renders a caller-supplied empty line rather than inventing one", () => {
    const el = render(DefinitionMembersCardWidget, {
      data: { members: [] },
      props: { provenance: "p", emptyLabel: "sem membros" },
    });
    expect(el.querySelector(".definition-members-card-empty")!.textContent).toBe(
      "sem membros",
    );
    // No copy of its own: without the caller's word, nothing is asserted.
    const bare = render(DefinitionMembersCardWidget, {
      data: { members: [] },
      props: { provenance: "p" },
    });
    expect(bare.querySelector(".definition-members-card-empty")).toBeNull();
  });
});

// ─── chart-tile-mock ─────────────────────────────────────────────────────────

describe("chart-tile-mock", () => {
  it("LAW: a mock never renders unmarked", () => {
    expect(() => render(ChartTileMockWidget, { data: {}, props: {} })).toThrow(
      /must carry a visible earmark/i,
    );
    expect(() =>
      render(ChartTileMockWidget, { data: {}, props: { earmarkLabel: "  " } }),
    ).toThrow(/must carry a visible earmark/i);
  });

  it("the earmark is real DOM text, so it survives copy and screen readers", () => {
    const el = render(ChartTileMockWidget, {
      data: {},
      props: { earmarkLabel: "SIMULADO" },
    });
    const mark = el.querySelector(".chart-tile-mock-earmark")!;
    expect(mark.textContent).toBe("SIMULADO");
    // Not a watermark: it is not hidden from assistive tech.
    expect(mark.getAttribute("aria-hidden")).toBeNull();
    expect(el.textContent).toContain("SIMULADO");
  });

  it("names its own replacement so the debt is legible in the UI", () => {
    const el = render(ChartTileMockWidget, {
      data: {},
      props: { earmarkLabel: "MOCK", replacementRef: "#36", replacementLabel: "substituído por" },
    });
    expect(el.querySelector(".chart-tile-mock-replacement")!.textContent).toContain(
      "#36",
    );
  });

  it("the plot is decorative and carries no numbers to misread", () => {
    const el = render(ChartTileMockWidget, {
      data: { series: [1, 2, 3] },
      props: { earmarkLabel: "MOCK" },
    });
    const plot = el.querySelector(".chart-tile-mock-plot")!;
    expect(plot.getAttribute("aria-hidden")).toBe("true");
    expect(plot.textContent!.trim()).toBe("");
  });

  it("ignores caller data for the bar shape — a mock must stay obviously a mock", () => {
    const a = render(ChartTileMockWidget, {
      data: { series: [1] },
      props: { earmarkLabel: "MOCK" },
    });
    const heightsA = [...a.querySelectorAll(".chart-tile-mock-bar")].map((b) =>
      b.getAttribute("style"),
    );
    unmount(component!);
    component = undefined;
    target?.remove();

    const b = render(ChartTileMockWidget, {
      data: { series: [99, 99, 99, 99] },
      props: { earmarkLabel: "MOCK" },
    });
    const heightsB = [...b.querySelectorAll(".chart-tile-mock-bar")].map((x) =>
      x.getAttribute("style"),
    );
    expect(heightsA).toEqual(heightsB);
  });
});
