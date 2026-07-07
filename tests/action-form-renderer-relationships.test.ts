// @vitest-environment jsdom
//
// #34 (atelier#669 V1, operator decision D6) — cardinality-aware relationship
// picker. The renderer consumes the form-surface.v1 field summary
// (`type: "relationship"`, `relationship: {relCode, targetTypeCode,
// cardinality}`) AND the derived-action param shape (`object_reference` +
// `multiple: true`):
//   *_to_one      → single-value Combobox WITH edit-time hydration of the
//                   currently-linked row (new `hydrateEntities` host seam);
//   many_to_many  → Combobox search-to-add + removable Tag chips; payload
//                   emits an ID LIST (string[]); [] when cleared.
// The m2m ontology write shape (list-of-ids create/replace/clear) is proven
// by atelier tests/test_live_m2m_rel_write_shape.py — this suite pins the
// renderer half of the contract.

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

function comboboxInput(): HTMLInputElement {
  const el = target!.querySelector("input[role='combobox']");
  expect(el).not.toBeNull();
  return el as HTMLInputElement;
}

async function searchAndPick(label: string, query = "x") {
  const input = comboboxInput();
  input.focus();
  input.value = query;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
  await vi.advanceTimersByTimeAsync(300);
  flushSync();
  const option = [...document.querySelectorAll("li.combobox-item")].find((o) =>
    o.textContent?.includes(label),
  ) as HTMLElement;
  expect(option).not.toBeNull();
  option.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
  );
  flushSync();
}

// ─── *_to_one — single-value Combobox ───────────────────────────────────────

describe("relationship field summary — *_to_one (single)", () => {
  const PARAM = {
    key: "rel:organization",
    label: "Organization",
    type: "relationship",
    required: false,
    relationship: {
      relCode: "organization",
      targetTypeCode: "organization",
      cardinality: "many_to_one",
    },
  };

  it("renders a Combobox and searches through the seam with targetTypeCode", async () => {
    vi.useFakeTimers();
    const searchEntities = vi
      .fn()
      .mockResolvedValue([{ value: "org-1", label: "Roads Dept" }]);
    render({ parameters: [PARAM], searchEntities });

    const input = comboboxInput();
    expect(input.disabled).toBe(false);
    input.focus();
    input.value = "ro";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    await vi.advanceTimersByTimeAsync(300);
    expect(searchEntities).toHaveBeenCalledWith(
      "organization",
      "ro",
      undefined,
    );
    flushSync();
    expect(document.querySelector("[role='option']")?.textContent).toContain(
      "Roads Dept",
    );
  });

  it("hydrates the currently-linked row on edit — label, not id", async () => {
    const hydrateEntities = vi
      .fn()
      .mockResolvedValue([{ value: "org-7", label: "Parks & Gardens" }]);
    render({
      parameters: [{ ...PARAM, default_value: "org-7" }],
      searchEntities: vi.fn().mockResolvedValue([]),
      hydrateEntities,
    });
    await vi.waitFor(() => {
      expect(hydrateEntities).toHaveBeenCalledWith("organization", ["org-7"]);
    });
    flushSync();
    const input = comboboxInput();
    expect(input.value).toBe("Parks & Gardens");
    expect(input.value).not.toBe("org-7");
  });

  it("selection lands the id STRING in raw_values; unset emits null", async () => {
    vi.useFakeTimers();
    const searchEntities = vi
      .fn()
      .mockResolvedValue([{ value: "org-1", label: "Roads Dept" }]);
    const seen: Record<string, unknown>[] = [];
    render({
      parameters: [PARAM],
      searchEntities,
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    // Unset single relationship → null (the string|null wire contract), not "".
    expect(lastRawValues(seen)["rel:organization"]).toBeNull();

    await searchAndPick("Roads Dept", "ro");
    expect(lastRawValues(seen)["rel:organization"]).toBe("org-1");
  });

  it("renders DISABLED without a searchEntities seam (the file convention)", () => {
    render({ parameters: [PARAM] });
    expect(comboboxInput().disabled).toBe(true);
  });
});

// ─── many_to_many — chips + search-to-add ───────────────────────────────────

describe("relationship field summary — many_to_many (chips)", () => {
  const M2M = {
    key: "rel:inspectors",
    label: "Inspectors",
    type: "relationship",
    required: false,
    relationship: {
      relCode: "inspectors",
      targetTypeCode: "staff_member",
      cardinality: "many_to_many",
    },
  };

  it("renders the multi picker, never a single-select over the list", () => {
    const t = render({
      parameters: [M2M],
      searchEntities: vi.fn().mockResolvedValue([]),
    });
    expect(t.querySelector("[data-testid='afr-rel-multi']")).not.toBeNull();
    // The combobox inside is the search-to-add draft — it must never hold the
    // selection itself (single-pick of an m2m field impossible by construction).
    expect(comboboxInput().value).toBe("");
  });

  it("hydrates currently-linked rows as removable chips with labels", async () => {
    const hydrateEntities = vi.fn().mockResolvedValue([
      { value: "u-1", label: "Ana Silva" },
      { value: "u-2", label: "Rui Costa" },
    ]);
    const t = render({
      parameters: [{ ...M2M, default_value: ["u-1", "u-2"] }],
      searchEntities: vi.fn().mockResolvedValue([]),
      hydrateEntities,
    });
    await vi.waitFor(() => {
      expect(hydrateEntities).toHaveBeenCalledWith("staff_member", [
        "u-1",
        "u-2",
      ]);
    });
    flushSync();
    const chips = [...t.querySelectorAll(".tag")].map((c) =>
      c.textContent?.trim(),
    );
    expect(chips).toEqual(["Ana Silva", "Rui Costa"]);
    expect(t.querySelectorAll("button[aria-label='Remove tag']")).toHaveLength(
      2,
    );
  });

  it("search-to-add appends to the ID LIST in raw_values", async () => {
    vi.useFakeTimers();
    const searchEntities = vi
      .fn()
      .mockResolvedValue([{ value: "u-3", label: "Marta Reis" }]);
    const seen: Record<string, unknown>[] = [];
    render({
      parameters: [{ ...M2M, default_value: ["u-1"] }],
      searchEntities,
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    expect(lastRawValues(seen)["rel:inspectors"]).toEqual(["u-1"]);

    await searchAndPick("Marta Reis");
    expect(lastRawValues(seen)["rel:inspectors"]).toEqual(["u-1", "u-3"]);
    // The draft combobox resets after the pick — ready for the next add.
    expect(comboboxInput().value).toBe("");
  });

  it("chip removal shrinks the list; removing every chip emits []", async () => {
    const hydrateEntities = vi.fn().mockResolvedValue([
      { value: "u-1", label: "Ana Silva" },
      { value: "u-2", label: "Rui Costa" },
    ]);
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [{ ...M2M, default_value: ["u-1", "u-2"] }],
      searchEntities: vi.fn().mockResolvedValue([]),
      hydrateEntities,
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    await vi.waitFor(() => expect(hydrateEntities).toHaveBeenCalled());
    flushSync();

    const removeButtons = () =>
      [
        ...t.querySelectorAll("button[aria-label='Remove tag']"),
      ] as HTMLButtonElement[];
    // A typeless button inside the renderer's <form> is a SUBMIT button —
    // chip removal must never submit the form.
    expect(removeButtons()[0].type).toBe("button");
    removeButtons()[0].click();
    flushSync();
    expect(lastRawValues(seen)["rel:inspectors"]).toEqual(["u-2"]);

    removeButtons()[0].click();
    flushSync();
    expect(lastRawValues(seen)["rel:inspectors"]).toEqual([]);
  });

  it("an already-picked id never re-offers in the dropdown (no double-add)", async () => {
    vi.useFakeTimers();
    const searchEntities = vi.fn().mockResolvedValue([
      { value: "u-1", label: "Ana Silva" },
      { value: "u-3", label: "Marta Reis" },
    ]);
    render({
      parameters: [{ ...M2M, default_value: ["u-1"] }],
      searchEntities,
    });
    const input = comboboxInput();
    input.focus();
    input.value = "a";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    await vi.advanceTimersByTimeAsync(300);
    flushSync();
    const options = [...document.querySelectorAll("li.combobox-item")].map(
      (o) => o.textContent ?? "",
    );
    expect(options.join(" ")).toContain("Marta Reis");
    expect(options.join(" ")).not.toContain("Ana Silva");
  });

  it("a required m2m with zero picks blocks submit; a pick unblocks it", async () => {
    vi.useFakeTimers();
    const searchEntities = vi
      .fn()
      .mockResolvedValue([{ value: "u-3", label: "Marta Reis" }]);
    const t = render({
      parameters: [{ ...M2M, required: true }],
      searchEntities,
      onApply: vi.fn().mockResolvedValue({ ok: true }),
    });
    const submit = () =>
      t.querySelector(".submit-area button") as HTMLButtonElement;
    expect(submit()).not.toBeNull();
    expect(submit().disabled).toBe(true);

    await searchAndPick("Marta Reis");
    expect(submit().disabled).toBe(false);
  });
});

// ─── derived-action param lane (`object_reference` + multiple) ──────────────

describe("object_reference param with multiple: true (derived-action lane)", () => {
  it("gets the same multi picker as an m2m relationship", () => {
    const t = render({
      parameters: [
        {
          key: "inspectors",
          label: "Inspectors",
          type: "object_reference",
          object_type: "staff_member",
          multiple: true,
        },
      ],
      searchEntities: vi.fn().mockResolvedValue([]),
    });
    expect(t.querySelector("[data-testid='afr-rel-multi']")).not.toBeNull();
  });

  it("single object_reference behavior is unchanged (empty-string bag seed)", () => {
    const seen: Record<string, unknown>[] = [];
    render({
      parameters: [
        {
          key: "target_team",
          label: "Team",
          type: "object_reference",
          object_type: "organization",
        },
      ],
      searchEntities: vi.fn().mockResolvedValue([]),
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    // The legacy action lane keeps its "" seed — only `relationship`-typed
    // summaries speak the string|null wire contract.
    expect(lastRawValues(seen)["target_team"]).toBe("");
  });
});

// ─── hydration resilience ───────────────────────────────────────────────────

describe("hydration fallbacks", () => {
  it("without a hydrateEntities seam, chips fall back to raw ids (never crash)", () => {
    const t = render({
      parameters: [
        {
          key: "rel:inspectors",
          label: "Inspectors",
          type: "relationship",
          default_value: ["u-9"],
          relationship: {
            relCode: "inspectors",
            targetTypeCode: "staff_member",
            cardinality: "many_to_many",
          },
        },
      ],
      searchEntities: vi.fn().mockResolvedValue([]),
    });
    const chips = [...t.querySelectorAll(".tag")].map((c) =>
      c.textContent?.trim(),
    );
    expect(chips).toEqual(["u-9"]);
  });

  it("a failed hydration keeps the raw id visible (label upgrade is best-effort)", async () => {
    const hydrateEntities = vi.fn().mockRejectedValue(new Error("boom"));
    const t = render({
      parameters: [
        {
          key: "rel:inspectors",
          label: "Inspectors",
          type: "relationship",
          default_value: ["u-9"],
          relationship: {
            relCode: "inspectors",
            targetTypeCode: "staff_member",
            cardinality: "many_to_many",
          },
        },
      ],
      searchEntities: vi.fn().mockResolvedValue([]),
      hydrateEntities,
    });
    await vi.waitFor(() => expect(hydrateEntities).toHaveBeenCalled());
    flushSync();
    const chips = [...t.querySelectorAll(".tag")].map((c) =>
      c.textContent?.trim(),
    );
    expect(chips).toEqual(["u-9"]);
  });
});
