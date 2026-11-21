// @vitest-environment jsdom
//
// A choice field with no declared default starts EMPTY.
//
// `initialValue` seeded every `enum`/`select` parameter that had no
// `default_value` with its FIRST option. The form then showed a value nobody
// chose and submitted it. On Atelier DEV (atelier#2838, 2026-11-20) every
// staff create of a location wrote `location_level: "building"`,
// `location_zone_purpose: "access_control"`, … that the person never touched.
//
// Contract pinned here:
//   - optional, no default → the placeholder shows, the bag holds "" (unset);
//   - required, no default → same, and submit stays blocked until the person
//     picks (never a silent first option);
//   - a declared default still pre-selects;
//   - picking the first option on purpose still sends it.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import ActionFormRenderer from "../components/ActionFormRenderer.svelte";

const ACTION = { key: "__create", label: "New location" };
const LEVELS = [
  { value: "building", label: "Building" },
  { value: "floor", label: "Floor" },
];

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

function rawValues(seen: Record<string, unknown>[]): Record<string, unknown> {
  const last = seen[seen.length - 1] as {
    form?: { raw_values?: Record<string, unknown> };
  };
  return last?.form?.raw_values ?? {};
}

function select(t: HTMLElement, name: string): HTMLSelectElement {
  const el = t.querySelector(
    `select[name='${name}']`,
  ) as HTMLSelectElement | null;
  expect(el, `${name} renders`).not.toBeNull();
  return el!;
}

describe("choice field with no declared default", () => {
  it.each(["enum", "select"])(
    "optional %s starts unset, not on its first option",
    (type) => {
      const seen: Record<string, unknown>[] = [];
      const t = render({
        parameters: [{ key: "level", label: "Level", type, options: LEVELS }],
        onchange: (payload: Record<string, unknown>) => seen.push(payload),
      });
      expect(select(t, "level").value).toBe("");
      expect(rawValues(seen).level).toBe("");
    },
  );

  it("required enum starts unset and blocks submit until the person picks", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [
        {
          key: "level",
          label: "Level",
          type: "enum",
          required: true,
          options: LEVELS,
        },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
      onApply: async () => ({ ok: true }),
    });
    const button = Array.from(t.querySelectorAll("button")).find((b) =>
      /submit|new location|apply/i.test(b.textContent ?? ""),
    ) as HTMLButtonElement | undefined;
    expect(select(t, "level").value).toBe("");
    expect(rawValues(seen).level).toBe("");
    expect(button, "submit renders").toBeDefined();
    expect(button!.disabled).toBe(true);

    const el = select(t, "level");
    el.value = "floor";
    el.dispatchEvent(new Event("change", { bubbles: true }));
    flushSync();
    expect(rawValues(seen).level).toBe("floor");
    expect(button!.disabled).toBe(false);
  });

  it("a declared default still pre-selects", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [
        {
          key: "level",
          label: "Level",
          type: "enum",
          options: LEVELS,
          default_value: "floor",
        },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    expect(select(t, "level").value).toBe("floor");
    expect(rawValues(seen).level).toBe("floor");
  });

  it("picking the first option on purpose sends it", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [
        { key: "level", label: "Level", type: "enum", options: LEVELS },
      ],
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    const el = select(t, "level");
    el.value = "building";
    el.dispatchEvent(new Event("change", { bubbles: true }));
    flushSync();
    expect(rawValues(seen).level).toBe("building");
  });
});
