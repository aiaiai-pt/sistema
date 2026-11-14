// SSR safety for the four investigations card faces.
//
// Runs in the DEFAULT node env — NO jsdom — so any browser-only global touched
// during server render throws here. That is the point: these faces ship in a
// SvelteKit host whose initial HTML is server-rendered, and a face that only
// works after hydration produces a blank board on first paint.
//
// It is also the strongest available check that the laws hold on the server:
// the earmark and the provenance header must be in the emitted HTML, because
// that HTML is what gets copied, quoted, exported and read by a crawler.

import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import ChartTileMockWidget from "../../src/widgets/ChartTileMockWidget.svelte";
import DefinitionMembersCardWidget from "../../src/widgets/DefinitionMembersCardWidget.svelte";
import EntryStreamWidget from "../../src/widgets/EntryStreamWidget.svelte";
import IndicatorCardWidget from "../../src/widgets/IndicatorCardWidget.svelte";

const term = (value: string, label: string, tone?: string) => ({
  value,
  label,
  ...(tone ? { tone } : {}),
});

describe("investigations faces — server render", () => {
  it("entry-stream renders entries and keeps the log silent on the server", () => {
    const { body } = render(EntryStreamWidget, {
      props: {
        data: {
          entries: [
            { id: "1", kind: "q", body: "porque inundou a baixa?" },
            {
              id: "2",
              kind: "a",
              body: "a maré coincidiu com a chuva",
              seal: { evidence: term("inferred", "inferido", "info") },
            },
          ],
        },
        props: {
          presentation: { q: { variant: "bubble" }, a: { variant: "prose" } },
        },
      },
    });
    expect(body).toContain("porque inundou a baixa?");
    expect(body).toContain('role="log"');
    expect(body).toContain('aria-live="off"');
    // The seal rides the statement into the server HTML.
    expect(body).toContain("a maré coincidiu com a chuva — inferido");
  });

  it("indicator-card renders its numeral without a browser", () => {
    const { body } = render(IndicatorCardWidget, {
      props: {
        data: { value: "12", unit: "ocorrências", provenance: "contagem directa" },
        props: { label: "ABERTAS" },
      },
    });
    expect(body).toContain("12");
    expect(body).toContain("ocorrências");
    expect(body).toContain("contagem directa");
  });

  it("definition-members-card emits the provenance header into the server HTML", () => {
    const { body } = render(DefinitionMembersCardWidget, {
      props: {
        data: { members: [{ label: "Sensor A" }] },
        props: { provenance: "vista de ontologia · sensores activos" },
      },
    });
    const provenanceAt = body.indexOf("vista de ontologia");
    const memberAt = body.indexOf("Sensor A");
    expect(provenanceAt).toBeGreaterThanOrEqual(0);
    // Before any member in the emitted markup, not just in the live DOM.
    expect(memberAt).toBeGreaterThan(provenanceAt);
  });

  it("chart-tile-mock's earmark survives into the server HTML", () => {
    const { body } = render(ChartTileMockWidget, {
      props: { data: {}, props: { earmarkLabel: "SIMULADO" } },
    });
    expect(body).toContain("SIMULADO");
  });

  // NOTE: `svelte/server`'s render() computes `body` LAZILY — the component
  // function does not run until the body is read. So a guard that throws during
  // render surfaces on `.body` access, not on the render() call itself. Asserting
  // on render() alone silently passes whether or not the guard exists, which is
  // exactly the false-green this suite is meant to prevent. Every case below
  // consumes `.body`.
  it("the laws hold on the server too — the guards throw during SSR", () => {
    expect(
      () => render(ChartTileMockWidget, { props: { data: {}, props: {} } }).body,
    ).toThrow(/visible earmark/i);
    expect(
      () =>
        render(DefinitionMembersCardWidget, {
          props: { data: { members: [] }, props: {} },
        }).body,
    ).toThrow(/must declare its provenance/i);
    expect(
      () =>
        render(EntryStreamWidget, {
          props: {
            data: { entries: [{ kind: "undeclared" }] },
            props: { presentation: {} },
          },
        }).body,
    ).toThrow(/has no declared presentation/i);
  });

  it("server output is deterministic across independent renders", () => {
    const once = render(ChartTileMockWidget, {
      props: { data: {}, props: { earmarkLabel: "MOCK" } },
    }).body;
    const twice = render(ChartTileMockWidget, {
      props: { data: {}, props: { earmarkLabel: "MOCK" } },
    }).body;
    expect(once).toBe(twice);
  });
});

// !uws:347 — the native severity chip must be in the FIRST paint: a host that
// server-renders the board shows the chip before hydration, not after.
describe("definition-members-card severity — server render", () => {
  const ssr = (members: Record<string, unknown>[], props: Record<string, unknown> = {}) =>
    render(DefinitionMembersCardWidget, {
      props: { data: { members }, props: { provenance: "p", ...props } },
    }).body;

  const variants: [string, string][] = [
    ["low", "badge-neutral"],
    ["moderate", "badge-info"],
    ["high", "badge-warning"],
    ["critical", "badge-error"],
  ];

  for (const [severity, variantClass] of variants) {
    it(`emits severity «${severity}» as a ${variantClass} chip`, () => {
      const body = ssr([{ label: "Sensor A", severity }]);
      expect(body).toMatch(new RegExp(`class="badge ${variantClass}[ "]`));
      expect(body.match(/class="badge /g)).toHaveLength(1);
      expect(body).toContain("definition-members-card-meta");
    });
  }

  it("emits no chip and no meta group when severity is absent", () => {
    const body = ssr([{ label: "Sensor A", detail: "rua" }]);
    expect(body).not.toContain('class="badge');
    expect(body).not.toContain("definition-members-card-meta");
    expect(body).toContain("rua");
  });

  it("emits no chip for an unknown severity", () => {
    const body = ssr([{ label: "Sensor A", severity: "catastrophic" }]);
    expect(body).not.toContain('class="badge');
    expect(body).not.toContain("catastrophic");
  });

  it("emits the caller's label, falling back to the raw key", () => {
    const body = ssr([
      { label: "A", severity: "critical", severityLabel: "crítica" },
      { label: "B", severity: "moderate" },
    ]);
    // Badge's own markup interleaves whitespace and hydration comments before
    // its children, so match up to the chip's text rather than a literal `>`.
    expect(body).toMatch(/badge-error[^>]*>(?:\s|<!--[^>]*-->)*crítica</);
    expect(body).toMatch(/badge-info[^>]*>(?:\s|<!--[^>]*-->)*moderate</);
  });

  it("emits severityTestId as the chip's data-testid, on drill rows too", () => {
    const body = ssr(
      [{ label: "A", severity: "high", severityTestId: "sev-a", ref: "m1" }],
      { drillLabel: "abrir", onDrill: () => {} },
    );
    expect(body).toContain("definition-members-card-row-action");
    expect(body).toMatch(/<span class="badge badge-warning[^"]*"[^>]*data-testid="sev-a"/);
  });
});
