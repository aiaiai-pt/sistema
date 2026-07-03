// @vitest-environment jsdom
//
// #629 PR1b — ActionFormRenderer widget-coverage union with the staff modal:
// the `datetime` branch (DateTimePicker), the `object_reference` branch
// (Combobox + injected searchEntities seam, disabled without it), and the
// sectionName precedence flip to ui_schema-FIRST (mirroring the BFF
// `_parameter_section` in action_schema.py).

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import ActionFormRenderer from "../components/ActionFormRenderer.svelte";

const ACTION = { key: "escalate", label: "Escalate" };

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

describe("datetime parameter", () => {
  it("renders the DS DateTimePicker, not a plain text input", () => {
    const t = render({
      parameters: [
        { key: "due_at", label: "Due at", type: "datetime", required: false },
      ],
    });
    expect(t.querySelector(".datetimepicker")).not.toBeNull();
    // The generic string fallback would render a labelled text Input instead.
    expect(t.querySelector("input[name='due_at']")).toBeNull();
  });

  it("carries an ISO default_value string through to raw_values verbatim", () => {
    const seen: Record<string, unknown>[] = [];
    render({
      parameters: [
        {
          key: "due_at",
          label: "Due at",
          type: "datetime",
          required: false,
          default_value: "2026-07-03T10:30:00.000Z",
        },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    flushSync();
    const last = seen[seen.length - 1] as {
      form?: { raw_values?: Record<string, unknown> };
    };
    expect(last?.form?.raw_values?.due_at).toBe("2026-07-03T10:30:00.000Z");
  });
});

describe("object_reference parameter", () => {
  const PARAM = {
    key: "target_team",
    label: "Team",
    type: "object_reference",
    required: true,
    object_type: "organization",
    object_filter: { org_type: "team" },
  };

  function comboboxInput(): HTMLInputElement {
    const el = target!.querySelector("input[role='combobox']");
    expect(el).not.toBeNull();
    return el as HTMLInputElement;
  }

  it("renders a DISABLED combobox when no searchEntities seam is injected (the file convention)", () => {
    render({ parameters: [PARAM] });
    expect(comboboxInput().disabled).toBe(true);
  });

  it("calls the seam with (object_type, query, object_filter) after the search debounce", async () => {
    vi.useFakeTimers();
    const searchEntities = vi
      .fn()
      .mockResolvedValue([{ value: "team-1", label: "Roads" }]);
    render({ parameters: [PARAM], searchEntities });

    const input = comboboxInput();
    expect(input.disabled).toBe(false);
    input.focus();
    input.value = "ro";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();

    await vi.advanceTimersByTimeAsync(300); // Combobox onsearch debounce
    expect(searchEntities).toHaveBeenCalledWith("organization", "ro", {
      org_type: "team",
    });

    // The resolved items reach the listbox…
    flushSync();
    const option = document.querySelector("[role='option']");
    expect(option?.textContent).toContain("Roads");
  });

  it("selection lands the entity id in raw_values", async () => {
    vi.useFakeTimers();
    const searchEntities = vi
      .fn()
      .mockResolvedValue([{ value: "team-1", label: "Roads" }]);
    const seen: Record<string, unknown>[] = [];
    render({
      parameters: [PARAM],
      searchEntities,
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });

    const input = comboboxInput();
    input.focus();
    input.value = "ro";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    await vi.advanceTimersByTimeAsync(300);
    flushSync();

    const option = document.querySelector("li.combobox-item") as HTMLElement;
    expect(option).not.toBeNull();
    // The Combobox selects on mousedown (preventDefault keeps input focus).
    option.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
    flushSync();

    const last = seen[seen.length - 1] as {
      form?: { raw_values?: Record<string, unknown> };
    };
    expect(last?.form?.raw_values?.target_team).toBe("team-1");
  });

  it("drops a stale response that resolves after a newer query", async () => {
    vi.useFakeTimers();
    let resolveFirst: (items: unknown[]) => void = () => {};
    const searchEntities = vi
      .fn()
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirst = resolve)),
      )
      .mockResolvedValue([{ value: "team-2", label: "Parks" }]);
    render({ parameters: [PARAM], searchEntities });

    const input = comboboxInput();
    input.focus();
    // First query — its response is withheld.
    input.value = "ro";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    await vi.advanceTimersByTimeAsync(300);
    // Second query — resolves immediately.
    input.value = "pa";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    await vi.advanceTimersByTimeAsync(300);
    flushSync();
    expect(document.querySelector("[role='option']")?.textContent).toContain(
      "Parks",
    );

    // The slow FIRST response arrives late — it must not clobber the newer items.
    resolveFirst([{ value: "team-1", label: "Roads" }]);
    await vi.advanceTimersByTimeAsync(0);
    flushSync();
    expect(document.querySelector("[role='option']")?.textContent).toContain(
      "Parks",
    );
  });
});

describe("sectionName precedence (BFF _parameter_section parity)", () => {
  function sectionHeadings(t: HTMLElement): string[] {
    return [...t.querySelectorAll("h4")].map((h) => h.textContent ?? "");
  }

  it("ui_schema.section wins over visibility.section (the flip)", () => {
    const t = render({
      parameters: [
        {
          key: "a",
          label: "A",
          type: "string",
          ui_schema: { section: "From UI Schema" },
          visibility: { section: "From Visibility" },
        },
      ],
    });
    expect(sectionHeadings(t)).toEqual(["From UI Schema"]);
  });

  it("section_label outranks section within the same carrier", () => {
    const t = render({
      parameters: [
        {
          key: "a",
          label: "A",
          type: "string",
          ui_schema: { section_label: "Pretty Label", section: "raw-key" },
        },
      ],
    });
    expect(sectionHeadings(t)).toEqual(["Pretty Label"]);
  });

  it("falls back through visibility to Details (legacy parity)", () => {
    const t = render({
      parameters: [
        {
          key: "a",
          label: "A",
          type: "string",
          visibility: { section: "Legacy Section" },
        },
        { key: "b", label: "B", type: "string" },
      ],
    });
    expect(sectionHeadings(t)).toEqual(["Legacy Section", "Details"]);
  });

  it("an empty ui_schema.section_label falls through the whole chain (Python `or` semantics)", () => {
    const t = render({
      parameters: [
        {
          key: "a",
          label: "A",
          type: "string",
          ui_schema: { section_label: "" },
          visibility: { section: "Visibility Wins" },
        },
      ],
    });
    expect(sectionHeadings(t)).toEqual(["Visibility Wins"]);
  });
});

describe("admin-execute chrome (#629 follow-up — 0.44.1)", () => {
  const PARAMS = [
    { key: "comment", label: "Comment", type: "string", required: true },
    { key: "note", label: "Note", type: "string", required: false },
  ];

  it("suppresses the renderer header (the HOST container owns the heading)", () => {
    const t = render({ parameters: PARAMS });
    expect(t.querySelector(".renderer-header")).toBeNull();
    expect(t.textContent).not.toContain("Placement preview");
  });

  it("field meta is the quiet Required hint, never the type-debug line", () => {
    const t = render({ parameters: PARAMS });
    const metas = [...t.querySelectorAll(".field-meta")].map((m) => m.textContent?.trim());
    expect(metas).toEqual(["Required"]);
    expect(t.textContent).not.toContain("/ string");
  });

  it("admin-preview keeps the operator chrome (parity)", () => {
    const t = render({ parameters: PARAMS, mode: "admin-preview" });
    expect(t.textContent).toContain("Placement preview");
    expect(t.textContent).toContain("Required / string");
  });

  it("public-submit is untouched (header shown, quiet hint)", () => {
    const t = render({ parameters: PARAMS, mode: "public-submit" });
    expect(t.querySelector(".renderer-header")).not.toBeNull();
    expect(t.textContent).not.toContain("Placement preview");
    const metas = [...t.querySelectorAll(".field-meta")].map((m) => m.textContent?.trim());
    expect(metas).toEqual(["Required"]);
  });
});
