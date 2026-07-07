// @vitest-environment jsdom
//
// #38 (atelier#669 V1) — json editor widget + its invalid-state contract.
// The parse/emit pipeline is a PURE module (json-editor-contract) because
// CodeMirror cannot be edit-driven under jsdom (probed: synthetic
// beforeinput is ignored) — the live editing path is exercised on the rig.
// Component tests pin the shell: initial pretty-print, chrome, readonly.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import JsonEditor from "../components/JsonEditor.svelte";
import ActionFormRenderer from "../components/ActionFormRenderer.svelte";
import {
  evaluateJsonDraft,
  formatJsonValue,
} from "../components/json-editor-contract";

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

function render(Component: unknown, props: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(Component as never, { target, props });
  flushSync();
  return target;
}

// ─── the pure contract ──────────────────────────────────────────────────────

describe("json draft contract (pure)", () => {
  it("valid JSON round-trips through format → evaluate", () => {
    const value = { a: 1, nested: { list: [1, 2, 3] } };
    const result = evaluateJsonDraft(formatJsonValue(value));
    expect(result).toEqual({ ok: true, value });
  });

  it("invalid JSON yields an error and NEVER a value (no half-parse)", () => {
    const result = evaluateJsonDraft('{"a": 1,,}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Invalid JSON");
    expect("value" in result).toBe(false);
  });

  it("empty and {} are distinct", () => {
    expect(evaluateJsonDraft("")).toEqual({ ok: true, value: null });
    expect(evaluateJsonDraft("  \n ")).toEqual({ ok: true, value: null });
    expect(evaluateJsonDraft("{}")).toEqual({ ok: true, value: {} });
  });

  it("format renders null/undefined as an empty editor", () => {
    expect(formatJsonValue(null)).toBe("");
    expect(formatJsonValue(undefined)).toBe("");
  });
});

// ─── the widget shell ───────────────────────────────────────────────────────

describe("JsonEditor (widget shell)", () => {
  it("pretty-prints the initial value into the code editor", () => {
    const t = render(JsonEditor, {
      label: "METADATA",
      value: { kind: "sensor", tags: ["air"] },
    });
    const content = t.querySelector(".cm-content");
    expect(content?.textContent).toContain('"kind": "sensor"');
    expect(t.textContent).toContain("METADATA");
  });

  it("shows the external (server) error through the field chrome", () => {
    const t = render(JsonEditor, {
      label: "METADATA",
      value: {},
      error: "Schema rejected",
    });
    const alert = t.querySelector("[role='alert']");
    expect(alert?.textContent).toContain("Schema rejected");
  });

  it("readonly renders a non-editable editor", () => {
    const t = render(JsonEditor, { value: { a: 1 }, readonly: true });
    const content = t.querySelector(".cm-content") as HTMLElement;
    expect(content.getAttribute("contenteditable")).toBe("false");
  });
});

// ─── renderer dispatch ──────────────────────────────────────────────────────

describe("json widget (renderer dispatch)", () => {
  it("kind 'json' mounts the JsonEditor over the bag value", () => {
    const t = render(ActionFormRenderer, {
      action: { key: "__update", label: "Edit" },
      mode: "admin-execute",
      parameters: [
        {
          key: "metadata",
          label: "Metadata",
          type: "json",
          widget: "json",
          default_value: { source: "import" },
        },
      ],
    });
    const content = t.querySelector(".cm-content");
    expect(content).not.toBeNull();
    expect(content?.textContent).toContain('"source": "import"');
  });
});
