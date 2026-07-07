// @vitest-environment jsdom
//
// #634 S3/S4 — ActionFormRenderer honors the contract's section presentation
// keys: `order` (defensive sort), `columns` (two-column grid + span breakout)
// and `visible_when` (LIVE show/hide against the value bag, with the submit
// gate skipping required params inside hidden sections).

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import ActionFormRenderer from "../components/ActionFormRenderer.svelte";

const ACTION = { key: "log_case_inspection", label: "Registar inspeção" };

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
});

function render(props: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(ActionFormRenderer, {
    target,
    props: { action: ACTION, mode: "admin-execute", ...props },
  });
  flushSync();
  return target;
}

const param = (key: string, extra: Record<string, unknown> = {}) => ({
  key,
  label: key,
  type: "string",
  required: false,
  ...extra,
});

// The server contract carries BOTH the flat `parameters` union and the
// compiled `sections` (members ⊆ flat). The renderer seeds its value bag
// from the flat list — a schema without it renders "no fields yet".
function schemaOf(sections: Array<Record<string, unknown>>) {
  return {
    action: ACTION,
    sections,
    parameters: sections.flatMap(
      (section) => (section.parameters as Array<Record<string, unknown>>) ?? [],
    ),
  };
}

describe("section.order (S3)", () => {
  it("renders sections sorted by contract order, not array order", () => {
    const t = render({
      schema: schemaOf([
        { key: "later", label: "Later", order: 20, parameters: [param("b")] },
        { key: "first", label: "First", order: 10, parameters: [param("a")] },
      ]),
    });
    const headings = [...t.querySelectorAll("h4")].map((h) => h.textContent);
    expect(headings).toEqual(["First", "Later"]);
  });
});

describe("section.columns + span (S3)", () => {
  it("a columns:2 section renders the two-col grid; columns:1 stays a stack", () => {
    const t = render({
      schema: schemaOf([
        {
          key: "scope",
          label: "Scope",
          order: 10,
          columns: 2,
          parameters: [param("a"), param("b")],
        },
        {
          key: "outcome",
          label: "Outcome",
          order: 20,
          parameters: [param("c")],
        },
      ]),
    });
    const grids = [...t.querySelectorAll(".rows")];
    expect(grids[0]?.classList.contains("two-col")).toBe(true);
    expect(grids[0]?.getAttribute("data-columns")).toBe("2");
    expect(grids[1]?.classList.contains("two-col")).toBe(false);
  });

  it("narrow fields flow half-width; span:full and wide types break out", () => {
    const t = render({
      schema: schemaOf([
        {
          key: "scope",
          label: "Scope",
          columns: 2,
          parameters: [
            param("plain"),
            param("wide", { span: "full" }),
            param("map", { type: "geo" }),
          ],
        },
      ]),
    });
    const cells = [...t.querySelectorAll(".field-row")];
    expect(cells.map((cell) => cell.classList.contains("span-full"))).toEqual([
      false,
      true,
      true,
    ]);
  });
});

describe("visible_when (S4)", () => {
  const SECTIONS = [
    {
      key: "scope",
      label: "Scope",
      order: 10,
      parameters: [param("scope")],
    },
    {
      key: "followup",
      label: "Follow-up",
      order: 20,
      visible_when: { field: "scope", operator: "not_null" },
      parameters: [param("followup_notes", { required: true })],
    },
  ];

  it("hides the conditional section until the driving value is set, LIVE", () => {
    const t = render({ schema: schemaOf(SECTIONS) });
    let headings = [...t.querySelectorAll("h4")].map((h) => h.textContent);
    expect(headings).toEqual(["Scope"]);

    const input = t.querySelector("input[name='scope']") as HTMLInputElement;
    input.value = "routine";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();

    headings = [...t.querySelectorAll("h4")].map((h) => h.textContent);
    expect(headings).toEqual(["Scope", "Follow-up"]);
  });

  it("required params inside a hidden section do not block submit", async () => {
    const t = render({
      mode: "public-submit",
      onApply: async () => ({ ok: true }),
      schema: schemaOf(SECTIONS),
    });
    // `followup_notes` is required but its section is hidden (scope blank):
    // the gate must NOT count it — only visible work blocks the button.
    const button = t.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(false);

    // Reveal the section → its required param now gates the submit.
    const input = t.querySelector("input[name='scope']") as HTMLInputElement;
    input.value = "routine";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    expect((t.querySelector("button") as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("legacy fold sections (no schema) are unaffected", () => {
    const t = render({
      parameters: [
        param("a", { visibility: { section: "One" } }),
        param("b", { visibility: { section: "Two" } }),
      ],
    });
    const headings = [...t.querySelectorAll("h4")].map((h) => h.textContent);
    expect(headings).toEqual(["One", "Two"]);
  });
});
