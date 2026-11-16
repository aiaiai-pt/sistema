// @vitest-environment jsdom
/**
 * #2672 L4 — consumer-overridable label props.
 *
 * For each component that gained label props: (a) default unchanged,
 * (b) override rendered. Tests mount the real component in jsdom.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { flushSync, mount, unmount } from "svelte";

let target: HTMLElement | undefined;
let app: Record<string, unknown> | undefined;

afterEach(() => {
  if (app) unmount(app);
  target?.remove();
  app = undefined;
  target = undefined;
});

function el(): HTMLElement {
  target = document.createElement("div");
  document.body.appendChild(target);
  return target;
}

// ─── Combobox ───────────────────────────────────────────────────────────────

describe("Combobox label props", () => {
  async function renderCombobox(props: Record<string, unknown> = {}) {
    const Combobox = (await import("../components/Combobox.svelte")).default;
    app = mount(Combobox, {
      target: el(),
      props: { items: [], onsearch: vi.fn(), loading: false, ...props },
    });
    flushSync();
  }

  it("default noResultsLabel is 'No results found'", async () => {
    await renderCombobox();
    // Open the dropdown by focusing the input
    const input = target!.querySelector("input") as HTMLInputElement;
    input.focus();
    input.value = "x";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    const empty = target!.querySelector(".combobox-empty");
    expect(empty?.textContent?.trim()).toBe("No results found");
  });

  it("overridden noResultsLabel renders", async () => {
    await renderCombobox({ noResultsLabel: "Sem resultados" });
    const input = target!.querySelector("input") as HTMLInputElement;
    input.focus();
    input.value = "x";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    const empty = target!.querySelector(".combobox-empty");
    expect(empty?.textContent?.trim()).toBe("Sem resultados");
  });

  it("default searchingLabel is 'Searching…'", async () => {
    await renderCombobox({ loading: true });
    const input = target!.querySelector("input") as HTMLInputElement;
    input.focus();
    input.value = "x";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    const empty = target!.querySelector(".combobox-empty");
    expect(empty?.textContent?.trim()).toBe("Searching…");
  });

  it("overridden searchingLabel renders", async () => {
    await renderCombobox({ loading: true, searchingLabel: "A pesquisar…" });
    const input = target!.querySelector("input") as HTMLInputElement;
    input.focus();
    input.value = "x";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    const empty = target!.querySelector(".combobox-empty");
    expect(empty?.textContent?.trim()).toBe("A pesquisar…");
  });
});

// ─── Pagination ─────────────────────────────────────────────────────────────

describe("Pagination label props", () => {
  async function renderPagination(props: Record<string, unknown> = {}) {
    const Pagination = (await import("../components/Pagination.svelte"))
      .default;
    app = mount(Pagination, {
      target: el(),
      props: { mode: "cursor", has_next: true, has_prev: true, ...props },
    });
    flushSync();
  }

  it("default labels are PREV / NEXT", async () => {
    await renderPagination();
    const buttons = [...target!.querySelectorAll(".pagination-nav span")];
    const labels = buttons.map((b) => b.textContent?.trim());
    expect(labels).toContain("PREV");
    expect(labels).toContain("NEXT");
  });

  it("overridden prevLabel / nextLabel render", async () => {
    await renderPagination({ prevLabel: "ANTERIOR", nextLabel: "SEGUINTE" });
    const buttons = [...target!.querySelectorAll(".pagination-nav span")];
    const labels = buttons.map((b) => b.textContent?.trim());
    expect(labels).toContain("ANTERIOR");
    expect(labels).toContain("SEGUINTE");
  });
});

// ─── FilterPanel ────────────────────────────────────────────────────────────

describe("FilterPanel label props", () => {
  async function renderFilterPanel(props: Record<string, unknown> = {}) {
    const FilterPanel = (await import("../components/FilterPanel.svelte"))
      .default;
    app = mount(FilterPanel, {
      target: el(),
      props: {
        filters: [
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [{ value: "open", label: "Open" }],
          },
          { key: "active", label: "Active", type: "boolean" },
        ],
        value: { status: "open", active: "true" }, // 2 active → "Clear all" shows
        ...props,
      },
    });
    flushSync();
  }

  it("default allLabel is 'All'", async () => {
    await renderFilterPanel();
    const options = [...target!.querySelectorAll("option")];
    expect(options[0]?.textContent?.trim()).toBe("All");
  });

  it("overridden allLabel renders", async () => {
    await renderFilterPanel({ allLabel: "Todos" });
    const options = [...target!.querySelectorAll("option")];
    expect(options[0]?.textContent?.trim()).toBe("Todos");
  });

  it("default clearLabel is 'Clear all'", async () => {
    await renderFilterPanel();
    const btn = target!.querySelector(".filter-panel-clear");
    expect(btn?.textContent?.trim()).toBe("Clear all");
  });

  it("overridden clearLabel renders", async () => {
    await renderFilterPanel({ clearLabel: "Limpar tudo" });
    const btn = target!.querySelector(".filter-panel-clear");
    expect(btn?.textContent?.trim()).toBe("Limpar tudo");
  });

  it("default boolean labels are Yes / No", async () => {
    await renderFilterPanel({ value: {} });
    const chips = [...target!.querySelectorAll(".filter-chip")];
    const labels = chips.map((c) => c.textContent?.trim());
    expect(labels).toContain("Yes");
    expect(labels).toContain("No");
  });

  it("overridden boolean labels render", async () => {
    await renderFilterPanel({
      value: {},
      booleanYesLabel: "Sim",
      booleanNoLabel: "Não",
    });
    const chips = [...target!.querySelectorAll(".filter-chip")];
    const labels = chips.map((c) => c.textContent?.trim());
    expect(labels).toContain("Sim");
    expect(labels).toContain("Não");
  });
});

// ─── Modal ──────────────────────────────────────────────────────────────────

describe("Modal label props", () => {
  async function renderModal(props: Record<string, unknown> = {}) {
    const Modal = (await import("../components/Modal.svelte")).default;
    app = mount(Modal, {
      target: el(),
      props: { open: true, title: "Test", onclose: vi.fn(), ...props },
    });
    flushSync();
  }

  it("default closeLabel is 'Close'", async () => {
    await renderModal();
    const btn = target!.querySelector(".modal-close");
    expect(btn?.getAttribute("aria-label")).toBe("Close");
  });

  it("overridden closeLabel renders", async () => {
    await renderModal({ closeLabel: "Fechar" });
    const btn = target!.querySelector(".modal-close");
    expect(btn?.getAttribute("aria-label")).toBe("Fechar");
  });
});

// ─── Tag ────────────────────────────────────────────────────────────────────

describe("Tag label props", () => {
  async function renderTag(props: Record<string, unknown> = {}) {
    const Tag = (await import("../components/Tag.svelte")).default;
    app = mount(Tag, {
      target: el(),
      props: { removable: true, onremove: vi.fn(), ...props },
    });
    flushSync();
  }

  it("default removeLabel is 'Remove tag'", async () => {
    await renderTag();
    const btn = target!.querySelector(".tag-remove");
    expect(btn?.getAttribute("aria-label")).toBe("Remove tag");
  });

  it("overridden removeLabel renders", async () => {
    await renderTag({ removeLabel: "Remover etiqueta" });
    const btn = target!.querySelector(".tag-remove");
    expect(btn?.getAttribute("aria-label")).toBe("Remover etiqueta");
  });
});

// ─── ActionFormRenderer pass-through ────────────────────────────────────────

describe("ActionFormRenderer label pass-through", () => {
  const ACTION = { key: "__create", label: "Create" };

  async function renderAFR(props: Record<string, unknown> = {}) {
    const AFR = (await import("../components/ActionFormRenderer.svelte"))
      .default;
    app = mount(AFR, {
      target: el(),
      props: {
        action: ACTION,
        mode: "admin-execute",
        parameters: [
          {
            key: "rel:org",
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
        ...props,
      },
    });
    flushSync();
  }

  it(
    "passes noResultsLabel through to the relationship Combobox",
    { timeout: 15000 },
    async () => {
      await renderAFR({ noResultsLabel: "Sem resultados" });
      const input = target!.querySelector(
        "input[role='combobox']",
      ) as HTMLInputElement;
      input.focus();
      input.value = "x";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      flushSync();
      // Wait for debounce if needed
      await vi.advanceTimersByTimeAsync?.(300).catch(() => {});
      flushSync();
      const empty = target!.querySelector(".combobox-empty");
      expect(empty?.textContent?.trim()).toBe("Sem resultados");
    },
  );

  it(
    "passes booleanYesLabel / booleanNoLabel through to boolean selects",
    { timeout: 15000 },
    async () => {
      const AFR = (await import("../components/ActionFormRenderer.svelte"))
        .default;
      if (app) {
        unmount(app);
        app = undefined;
      }
      app = mount(AFR, {
        target: el(),
        props: {
          action: ACTION,
          mode: "admin-execute",
          parameters: [
            {
              key: "is_active",
              label: "Active",
              type: "boolean",
              required: false,
            },
          ],
          booleanYesLabel: "Sim",
          booleanNoLabel: "Não",
        },
      });
      flushSync();
      const options = [...target!.querySelectorAll("option")];
      const labels = options.map((o) => o.textContent?.trim());
      expect(labels).toContain("Sim");
      expect(labels).toContain("Não");
    },
  );

  it(
    "defaultSectionLabel: default is 'Details', override renders",
    { timeout: 15000 },
    async () => {
      const AFR = (await import("../components/ActionFormRenderer.svelte"))
        .default;
      if (app) {
        unmount(app);
        app = undefined;
      }
      // A parameter with no section metadata falls back to defaultSectionLabel
      app = mount(AFR, {
        target: el(),
        props: {
          action: ACTION,
          mode: "admin-execute",
          parameters: [
            {
              key: "title",
              label: "Title",
              type: "string",
              required: false,
            },
          ],
        },
      });
      flushSync();
      const headings = [...target!.querySelectorAll("h3, h4, legend")].map(
        (h) => h.textContent?.trim(),
      );
      expect(headings.some((h) => h === "Details")).toBe(true);

      // Override
      unmount(app);
      app = mount(AFR, {
        target: el(),
        props: {
          action: ACTION,
          mode: "admin-execute",
          parameters: [
            {
              key: "title",
              label: "Title",
              type: "string",
              required: false,
            },
          ],
          defaultSectionLabel: "Detalhes",
        },
      });
      flushSync();
      const overridden = [...target!.querySelectorAll("h3, h4, legend")].map(
        (h) => h.textContent?.trim(),
      );
      expect(overridden.some((h) => h === "Detalhes")).toBe(true);
      expect(overridden.some((h) => h === "Details")).toBe(false);
    },
  );

  it(
    "requiredFieldsMessage: default renders, override renders",
    { timeout: 15000 },
    async () => {
      const AFR = (await import("../components/ActionFormRenderer.svelte"))
        .default;
      if (app) {
        unmount(app);
        app = undefined;
      }
      // public-submit mode with onApply + a required empty field → submit hint visible
      app = mount(AFR, {
        target: el(),
        props: {
          action: ACTION,
          mode: "public-submit",
          parameters: [
            { key: "title", label: "Title", type: "string", required: true },
          ],
          onApply: async () => ({ ok: true }),
        },
      });
      flushSync();
      const hint = target!.querySelector(".submit-hint");
      expect(hint).not.toBeNull();
      expect(hint!.textContent!.trim()).toBe(
        "Fill in all required fields to submit.",
      );

      // Override
      unmount(app);
      app = mount(AFR, {
        target: el(),
        props: {
          action: ACTION,
          mode: "public-submit",
          parameters: [
            { key: "title", label: "Title", type: "string", required: true },
          ],
          onApply: async () => ({ ok: true }),
          requiredFieldsMessage: "Preencha todos os campos obrigatórios.",
        },
      });
      flushSync();
      const overridden = target!.querySelector(".submit-hint");
      expect(overridden).not.toBeNull();
      expect(overridden!.textContent!.trim()).toBe(
        "Preencha todos os campos obrigatórios.",
      );
    },
  );
});

// ─── Calendar nav aria-labels (#2672 P14) ───────────────────────────────────

describe("Calendar nav aria-labels", () => {
  it("default prevAriaLabel/nextAriaLabel are 'Previous'/'Next'", async () => {
    const Calendar = (await import("../components/Calendar.svelte")).default;
    if (app) {
      unmount(app);
      app = undefined;
    }
    app = mount(Calendar, { target: el(), props: {} });
    flushSync();
    const buttons = target!.querySelectorAll("button.calendar-nav-btn");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    expect(buttons[0].getAttribute("aria-label")).toBe("Previous");
    expect(buttons[1].getAttribute("aria-label")).toBe("Next");
  });

  it("overridden prevAriaLabel/nextAriaLabel render", async () => {
    const Calendar = (await import("../components/Calendar.svelte")).default;
    if (app) {
      unmount(app);
      app = undefined;
    }
    app = mount(Calendar, {
      target: el(),
      props: { prevAriaLabel: "Anterior", nextAriaLabel: "Seguinte" },
    });
    flushSync();
    const buttons = target!.querySelectorAll("button.calendar-nav-btn");
    expect(buttons[0].getAttribute("aria-label")).toBe("Anterior");
    expect(buttons[1].getAttribute("aria-label")).toBe("Seguinte");
  });
});
