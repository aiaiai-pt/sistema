// @vitest-environment jsdom
//
// #41 (atelier#669 V1) — cross-cutting field plumbing:
//   payload include|exclude (operator decision D3): a form-surface.v1
//     `visibility: "readonly"` summary defaults OUT of raw_values;
//     `payload: "include"` declares prefill-and-send; `payload: "exclude"`
//     hides a visible field from the wire. The LEGACY action-lane shape
//     (`visibility: {editable:false}` object, no payload key) keeps its #252
//     ride-the-payload behavior — only the new string-shape lane flips.
//   default_value honored from the field summary (guarded through the filter);
//   per-field server-error binding (new `fieldErrors` prop);
//   loading / empty / disabled as first-class field props.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import ActionFormRenderer from "../components/ActionFormRenderer.svelte";

const ACTION = { key: "__update", label: "Edit record" };

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
  vi.useRealTimers();
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

function lastRawValues(
  seen: Record<string, unknown>[],
): Record<string, unknown> {
  const last = seen[seen.length - 1] as {
    form?: { raw_values?: Record<string, unknown> };
  };
  return last?.form?.raw_values ?? {};
}

// ─── payload include|exclude (D3) ───────────────────────────────────────────

describe("payload semantics — form-surface.v1 lane (visibility as string)", () => {
  it("a readonly summary defaults OUT of raw_values but still renders its value", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [
        {
          key: "reference",
          label: "Reference",
          type: "string",
          visibility: "readonly",
          default_value: "OCC-2026-001",
        },
        { key: "title", label: "Title", type: "string" },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    const bag = lastRawValues(seen);
    expect("reference" in bag).toBe(false);
    expect("title" in bag).toBe(true);
    // The field still RENDERS (readonly, value shown) — it's off the wire,
    // not off the screen.
    const input = t.querySelector(
      "input[name='reference']",
    ) as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe("OCC-2026-001");
    expect(input.readOnly).toBe(true);
  });

  it("payload:'include' declares prefill-and-send on a readonly summary", () => {
    const seen: Record<string, unknown>[] = [];
    render({
      parameters: [
        {
          key: "reporter_email",
          label: "Reporter",
          type: "string",
          visibility: "readonly",
          payload: "include",
          default_value: "ana@example.pt",
        },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    expect(lastRawValues(seen)["reporter_email"]).toBe("ana@example.pt");
  });

  it("payload:'exclude' takes a visible, editable field off the wire", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [
        {
          key: "preview_only",
          label: "Preview only",
          type: "string",
          payload: "exclude",
        },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    expect("preview_only" in lastRawValues(seen)).toBe(false);
    const input = t.querySelector(
      "input[name='preview_only']",
    ) as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.readOnly).toBe(false);
  });

  it("legacy action-lane readonly (object visibility, no payload key) still rides — the #252 pin", () => {
    const seen: Record<string, unknown>[] = [];
    render({
      parameters: [
        {
          key: "citizen_name",
          label: "Name",
          type: "string",
          editable: false,
          visibility: { visible: true, editable: false },
          default_value: "Ana Silva",
        },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    expect(lastRawValues(seen)["citizen_name"]).toBe("Ana Silva");
  });
});

// ─── default_value through the filter ───────────────────────────────────────

describe("default_value from the field summary", () => {
  it("seeds the input display AND raw_values for a plain visible field", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [
        {
          key: "priority_note",
          label: "Priority note",
          type: "string",
          default_value: "routine",
        },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    const input = t.querySelector(
      "input[name='priority_note']",
    ) as HTMLInputElement;
    expect(input.value).toBe("routine");
    expect(lastRawValues(seen)["priority_note"]).toBe("routine");
  });
});

// ─── per-field server-error binding ─────────────────────────────────────────

describe("per-field error binding (fieldErrors prop)", () => {
  it("binds the error to ITS field only", () => {
    const t = render({
      parameters: [
        { key: "title", label: "Title", type: "string" },
        { key: "budget", label: "Budget", type: "number" },
      ],
      fieldErrors: { budget: "Must be a positive amount" },
    });
    const budget = t.querySelector("input[name='budget']") as HTMLInputElement;
    const title = t.querySelector("input[name='title']") as HTMLInputElement;
    expect(budget.getAttribute("aria-invalid")).toBe("true");
    expect(title.getAttribute("aria-invalid")).toBeNull();
    const alerts = [...t.querySelectorAll("[role='alert']")].map((a) =>
      a.textContent?.trim(),
    );
    expect(alerts).toEqual(["Must be a positive amount"]);
  });

  it("binds on the select branch too", () => {
    const t = render({
      parameters: [
        {
          key: "state",
          label: "State",
          type: "enum",
          options: [{ value: "open", label: "Open" }],
        },
      ],
      fieldErrors: { state: "Illegal transition" },
    });
    const select = t.querySelector("select") as HTMLSelectElement;
    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(t.textContent).toContain("Illegal transition");
  });

  it("binds on the relationship combobox branch", () => {
    const t = render({
      parameters: [
        {
          key: "rel:organization",
          label: "Organization",
          type: "relationship",
          relationship: {
            relCode: "organization",
            targetTypeCode: "organization",
            cardinality: "many_to_one",
          },
        },
      ],
      searchEntities: vi.fn().mockResolvedValue([]),
      fieldErrors: { "rel:organization": "Organization is required" },
    });
    const input = t.querySelector("input[role='combobox']") as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(t.textContent).toContain("Organization is required");
  });
});

// ─── loading / empty / disabled field states ────────────────────────────────

describe("field states", () => {
  it("parameter.disabled renders a disabled control", () => {
    const t = render({
      parameters: [
        { key: "title", label: "Title", type: "string", disabled: true },
      ],
    });
    const input = t.querySelector("input[name='title']") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("parameter.loading renders the field inert until the host resolves it", () => {
    const t = render({
      parameters: [
        {
          key: "assignee",
          label: "Assignee",
          type: "enum",
          loading: true,
          options: [],
        },
      ],
    });
    const select = t.querySelector("select") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it("an option-driven field with ZERO options gets the empty state, not a dead control", () => {
    const t = render({
      parameters: [
        { key: "category", label: "Category", type: "enum", options: [] },
      ],
    });
    const select = t.querySelector("select") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
    expect(t.textContent).toContain("No options available");
  });
});
