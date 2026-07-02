// @vitest-environment jsdom
//
// #507 — MegaMenu disclosure semantics. Component-render tests (jsdom mount):
// the trigger/panel aria wiring, open/close behaviour (toggle, Escape,
// outside click, link navigation), the current-page trigger state, and the
// render-nothing guard for empty categories.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import MegaMenu from "../components/MegaMenu.svelte";

const CATEGORIES = [
  {
    label: "Mobilidade",
    items: [
      { href: "/transito/mapa", label: "Trânsito" },
      { href: "/transportes/rotas", label: "Transportes", current: true },
    ],
  },
  {
    label: "Ambiente",
    items: [{ href: "/residuos/mapa", label: "Resíduos" }],
  },
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
  component = mount(MegaMenu, { target, props });
  flushSync();
  return target;
}

function trigger(): HTMLButtonElement {
  const el = target!.querySelector("button.mega-menu-trigger");
  expect(el).not.toBeNull();
  return el as HTMLButtonElement;
}

describe("MegaMenu", () => {
  it("renders nothing at all for empty categories (never an empty trigger)", () => {
    const t = render({ categories: [] });
    expect(t.querySelector(".mega-menu")).toBeNull();
  });

  it("wires the disclosure: aria-expanded + aria-controls toggle the panel", () => {
    render({ label: "Serviços", categories: CATEGORIES, menuId: "svc" });
    const btn = trigger();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-controls")).toBe("svc");
    expect(document.getElementById("svc")).toBeNull();

    btn.click();
    flushSync();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    const panel = document.getElementById("svc");
    expect(panel).not.toBeNull();

    // categories render as labelled sections with their links
    const headings = [...panel!.querySelectorAll(".mega-menu-heading")].map(
      (h) => h.textContent?.trim(),
    );
    expect(headings).toEqual(["Mobilidade", "Ambiente"]);
    const links = [...panel!.querySelectorAll("a")].map((a) =>
      a.getAttribute("href"),
    );
    expect(links).toEqual([
      "/transito/mapa",
      "/transportes/rotas",
      "/residuos/mapa",
    ]);

    btn.click();
    flushSync();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("svc")).toBeNull();
  });

  it("marks the current link and lights the trigger when a child is current", () => {
    render({ categories: CATEGORIES });
    const btn = trigger();
    expect(btn.classList.contains("current")).toBe(true);
    btn.click();
    flushSync();
    const current = target!.querySelector('a[aria-current="page"]');
    expect(current?.getAttribute("href")).toBe("/transportes/rotas");
  });

  it("does not light the trigger when no child is current", () => {
    render({
      categories: [{ label: "Ambiente", items: [{ href: "/x", label: "X" }] }],
    });
    expect(trigger().classList.contains("current")).toBe(false);
  });

  it("closes on Escape and on a click outside; a link click closes too", () => {
    render({ categories: CATEGORIES, menuId: "m" });
    const btn = trigger();

    btn.click();
    flushSync();
    expect(document.getElementById("m")).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    flushSync();
    expect(document.getElementById("m")).toBeNull();

    btn.click();
    flushSync();
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    flushSync();
    expect(document.getElementById("m")).toBeNull();

    btn.click();
    flushSync();
    const link = target!.querySelector("a")!;
    link.addEventListener("click", (e) => e.preventDefault()); // no jsdom nav
    link.click();
    flushSync();
    expect(document.getElementById("m")).toBeNull();
  });
});
