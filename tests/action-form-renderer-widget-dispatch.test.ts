// @vitest-environment jsdom
//
// #36 + #37 (atelier#669 V1) — widget-first dispatch: the form-surface.v1
// field summary carries render intent in `widget` (derived-action params in
// `ui_schema.widget`); the renderer dispatches on it, falling back to the
// param `type` so every legacy action-lane form stays byte-identical.
//   #36: textarea / toggle / slug primitives (toggle emits BOOLEAN, never
//        "yes"/"no" strings; textarea is full-width-only; slug is an
//        input-type refinement).
//   #37: date-only DatePicker whose payload serializes YYYY-MM-DD with no
//        time component and no timezone/DST shift.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import ActionFormRenderer from "../components/ActionFormRenderer.svelte";
import {
  dateOnlyToDate,
  dateToDateOnly,
  widgetKind,
} from "../components/action-form-renderer-widgets";
import { fieldSpansFull } from "../components/action-form-renderer-layouts";

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

// ─── widget-kind resolution ─────────────────────────────────────────────────

describe("widgetKind (dispatch vocabulary)", () => {
  it("prefers the field summary's widget, then ui_schema.widget, then type", () => {
    expect(widgetKind({ type: "text", widget: "textarea" })).toBe("textarea");
    expect(widgetKind({ type: "bool", ui_schema: { widget: "toggle" } })).toBe(
      "toggle",
    );
    expect(widgetKind({ type: "string" })).toBe("string");
  });
});

// ─── #36 textarea ───────────────────────────────────────────────────────────

describe("textarea widget", () => {
  const PARAM = {
    key: "description",
    label: "Description",
    type: "text",
    widget: "textarea",
  };

  it("renders a real <textarea>, and input lands in raw_values", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [PARAM],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    const textarea = t.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    textarea.value = "Long form text";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    expect(lastRawValues(seen)["description"]).toBe("Long form text");
  });

  it("is full-width-only in a two-column section", () => {
    expect(fieldSpansFull({ ...PARAM, span: "half" }, 2)).toBe(true);
  });

  it("threads error and readonly", () => {
    const t = render({
      parameters: [{ ...PARAM, visibility: "readonly", payload: "include" }],
      fieldErrors: { description: "Too long" },
    });
    const textarea = t.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(true);
    expect(t.textContent).toContain("Too long");
  });
});

// ─── #36 toggle ─────────────────────────────────────────────────────────────

describe("toggle widget", () => {
  const PARAM = {
    key: "is_active",
    label: "Active",
    type: "boolean",
    widget: "toggle",
  };

  it("renders the DS switch and emits a BOOLEAN, never a string", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [PARAM],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    const toggle = t.querySelector("[role='switch']") as HTMLButtonElement;
    expect(toggle).not.toBeNull();
    expect(lastRawValues(seen)["is_active"]).toBe(false);
    toggle.click();
    flushSync();
    expect(lastRawValues(seen)["is_active"]).toBe(true);
    expect(toggle.getAttribute("aria-checked")).toBe("true");
  });

  it("honors default_value true and readonly renders it disabled", () => {
    const t = render({
      parameters: [
        {
          ...PARAM,
          default_value: true,
          visibility: "readonly",
          payload: "include",
        },
      ],
    });
    const toggle = t.querySelector("[role='switch']") as HTMLButtonElement;
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(toggle.disabled).toBe(true);
  });

  it("a bare bool param WITHOUT the toggle widget keeps the legacy Yes/No select", () => {
    const t = render({
      parameters: [{ key: "flag", label: "Flag", type: "bool" }],
    });
    expect(t.querySelector("[role='switch']")).toBeNull();
    expect(t.querySelector("select")).not.toBeNull();
  });
});

// ─── #36 slug ───────────────────────────────────────────────────────────────

describe("slug widget", () => {
  it("renders a text input with the slug typing refinements", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [
        { key: "code", label: "Code", type: "text", widget: "slug" },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    const input = t.querySelector("input[name='code']") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.getAttribute("spellcheck")).toBe("false");
    expect(input.getAttribute("autocapitalize")).toBe("none");
    input.value = "waste-collection";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    expect(lastRawValues(seen)["code"]).toBe("waste-collection");
  });
});

// ─── #37 date-only ──────────────────────────────────────────────────────────

describe("date-only widget", () => {
  it("serialization round-trips across DST boundaries with no off-by-one", () => {
    // 2026-03-29 is the EU spring-forward date; toISOString() on a local
    // midnight Date shifts it a day west of UTC — these helpers must not.
    for (const day of [
      "2026-03-29",
      "2026-10-25",
      "2026-01-01",
      "2026-12-31",
    ]) {
      const parsed = dateOnlyToDate(day);
      expect(parsed).not.toBeNull();
      expect(dateToDateOnly(parsed as Date)).toBe(day);
    }
    expect(dateOnlyToDate("")).toBeNull();
    expect(dateOnlyToDate("not-a-date")).toBeNull();
  });

  it("widget 'date' renders the date-only DatePicker, not the datetime picker", () => {
    const t = render({
      parameters: [
        { key: "due_on", label: "Due on", type: "date", widget: "date" },
      ],
    });
    expect(t.querySelector(".datepicker")).not.toBeNull();
    expect(t.querySelector(".datetimepicker")).toBeNull();
  });

  it("carries a YYYY-MM-DD default through raw_values VERBATIM", () => {
    const seen: Record<string, unknown>[] = [];
    render({
      parameters: [
        {
          key: "due_on",
          label: "Due on",
          type: "date",
          widget: "date",
          default_value: "2026-03-29",
        },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    expect(lastRawValues(seen)["due_on"]).toBe("2026-03-29");
  });
});
