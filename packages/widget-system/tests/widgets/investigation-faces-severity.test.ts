// @vitest-environment jsdom
//
// definition-members-card — the NATIVE severity chip (!uws:347).
//
// A member MAY carry `severity` (low | moderate | high | critical). It renders
// as the design-system Badge, on plain and drill rows alike, beside the label in
// a right-aligned meta group with the detail. The widget owns the variant
// mapping and no words: the chip's text is the caller's `severityLabel`, falling
// back to the raw key, and its test id is the caller's `severityTestId`. An
// absent or unknown severity renders no chip and nothing in its place.
//
// The server-render half lives in investigation-faces-ssr.test.ts.

import {
  createRawSnippet,
  flushSync,
  mount,
  unmount,
  type ComponentProps,
} from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import DefinitionMembersCardWidget from "../../src/widgets/DefinitionMembersCardWidget.svelte";

type MembersCardProps = ComponentProps<typeof DefinitionMembersCardWidget>;
type Mounted = ReturnType<typeof mount>;

let target: HTMLElement | undefined;
let component: Mounted | undefined;

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  target?.remove();
  target = undefined;
});

function renderCard(props: MembersCardProps): HTMLElement {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(DefinitionMembersCardWidget, { target, props });
  flushSync();
  return target;
}

/** One row's worth of member data, as the host hands it over. */
function card(
  members: Record<string, unknown>[],
  props: Record<string, unknown> = {},
): MembersCardProps {
  return { data: { members }, props: { provenance: "p", ...props } };
}

// Badge emits whitespace around its own optional dot/icon slots, so chip text
// is compared trimmed.
const chips = (el: HTMLElement) =>
  Array.from(el.querySelectorAll<HTMLElement>(".definition-members-card-row .badge"));

describe("definition-members-card — severity chip", () => {
  const variants: [string, string][] = [
    ["low", "badge-neutral"],
    ["moderate", "badge-info"],
    ["high", "badge-warning"],
    ["critical", "badge-error"],
  ];

  for (const [severity, variantClass] of variants) {
    it(`maps severity «${severity}» to the design-system Badge ${variantClass}`, () => {
      const el = renderCard(card([{ label: "Sensor A", severity, ref: "m1" }]));
      const [chip, ...rest] = chips(el);
      expect(rest).toHaveLength(0);
      expect(chip).toBeDefined();
      expect(chip.tagName).toBe("SPAN");
      expect([...chip.classList]).toContain("badge");
      expect([...chip.classList]).toContain(variantClass);
    });
  }

  it("absent severity: no chip, no meta group — the row is today's row", () => {
    const el = renderCard(card([{ label: "Sensor A", detail: "rua da Boavista" }]));
    const row = el.querySelector(".definition-members-card-row")!;
    expect(row.querySelector(".badge")).toBeNull();
    expect(row.querySelector(".definition-members-card-meta")).toBeNull();
    // label then detail, as direct children — nothing in the chip's place.
    expect(Array.from(row.children).map((c) => c.className.split(" ")[0])).toEqual([
      "definition-members-card-label",
      "definition-members-card-detail",
    ]);
    expect(row.textContent).toBe("Sensor A rua da Boavista");
  });

  it("unknown severity: no chip, and the row reads as if it were absent", () => {
    const el = renderCard(
      card([
        { label: "A", detail: "d", severity: "catastrophic", severityLabel: "x" },
        { label: "B", severity: "toString" },
        { label: "C", severity: 3 },
      ]),
    );
    expect(chips(el)).toHaveLength(0);
    expect(el.querySelector(".definition-members-card-meta")).toBeNull();
    expect(el.textContent).not.toContain("catastrophic");
    expect(el.textContent).not.toContain("x");
  });

  it("chip text is the caller's severityLabel (D9)", () => {
    const el = renderCard(
      card([{ label: "A", severity: "critical", severityLabel: "crítica" }]),
    );
    expect(chips(el)[0].textContent!.trim()).toBe("crítica");
  });

  it("falls back to the raw key when severityLabel is absent or empty", () => {
    const el = renderCard(
      card([
        { label: "A", severity: "high" },
        { label: "B", severity: "low", severityLabel: "" },
      ]),
    );
    expect(chips(el).map((c) => c.textContent!.trim())).toEqual(["high", "low"]);
  });

  it("puts severityTestId on the chip as data-testid, and nothing when absent", () => {
    const el = renderCard(
      card([
        { label: "A", severity: "moderate", severityTestId: "member-severity-m1" },
        { label: "B", severity: "moderate" },
      ]),
    );
    const [withId, withoutId] = chips(el);
    expect(withId.getAttribute("data-testid")).toBe("member-severity-m1");
    expect(el.querySelector('[data-testid="member-severity-m1"]')).toBe(withId);
    expect(withoutId.hasAttribute("data-testid")).toBe(false);
  });

  it("keeps detail and chip together BESIDE the label, after it", () => {
    const el = renderCard(
      card([{ label: "Sensor A", detail: "rua", severity: "high", severityLabel: "alta" }]),
    );
    const row = el.querySelector(".definition-members-card-row")!;
    const [label, meta] = Array.from(row.children) as HTMLElement[];
    expect(row.children).toHaveLength(2);
    expect(label.className).toContain("definition-members-card-label");
    expect(meta.className).toContain("definition-members-card-meta");
    const [detail, chip] = Array.from(meta.children) as HTMLElement[];
    expect(detail.className).toContain("definition-members-card-detail");
    expect(detail.textContent).toBe("rua");
    expect([...chip.classList]).toContain("badge-warning");
    expect(chip.textContent!.trim()).toBe("alta");
  });

  it("renders the chip on drill rows too, and drilling still echoes the ref", () => {
    const onDrill = vi.fn();
    const el = renderCard(
      card(
        [
          { label: "A", severity: "critical", severityTestId: "sev-a", ref: "m1" },
          { label: "B", ref: "m2" },
        ],
        { drillLabel: "abrir", onDrill },
      ),
    );
    const buttons = el.querySelectorAll<HTMLButtonElement>(
      ".definition-members-card-row-action",
    );
    expect(buttons).toHaveLength(2);
    const chip = buttons[0].querySelector<HTMLElement>('[data-testid="sev-a"]')!;
    expect([...chip.classList]).toContain("badge-error");
    expect(buttons[1].querySelector(".badge")).toBeNull();
    chip.click();
    expect(onDrill).toHaveBeenCalledWith("m1");
  });

  it("the row snippet override still wins over the native row", () => {
    const row = createRawSnippet((member: () => { label: string }) => ({
      render: () => `<p class="custom-row">${member().label}</p>`,
    }));
    const el = renderCard({
      ...card([{ label: "A", severity: "high", severityTestId: "sev-a" }]),
      row,
    });
    expect(el.querySelector(".custom-row")!.textContent).toBe("A");
    expect(el.querySelector(".definition-members-card-row")).toBeNull();
    expect(el.querySelector('[data-testid="sev-a"]')).toBeNull();
  });
});
