// @vitest-environment jsdom
//
// Automated accessibility audit (axe-core) for the evidence seal primitives:
// all four CaminhoStateChip states, and a SealChip carrying both axes, the
// stale state and a «why» disclosure — closed and open.
//
// Seal terms are neutral placeholders: the design system owns no seal words
// (see evidence-seal-components.test.ts).
//
// westeuropeco/atelier-urban-workspace#57

import axe from "axe-core";
import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import CaminhoStateChip from "../components/CaminhoStateChip.svelte";
import SealChip from "../components/SealChip.svelte";

const mounted: Record<string, unknown>[] = [];
let target: HTMLElement | undefined;

afterEach(() => {
  while (mounted.length) unmount(mounted.pop()!);
  target?.remove();
  target = undefined;
});

function host(): HTMLElement {
  target = document.createElement("main");
  document.body.appendChild(target);
  return target;
}

function render(
  Component: Parameters<typeof mount>[0],
  into: HTMLElement,
  props: Record<string, unknown>,
): void {
  mounted.push(mount(Component, { target: into, props }));
  flushSync();
}

async function audit(el: HTMLElement) {
  const results = await axe.run(el, {
    rules: {
      // jsdom does no layout or style resolution, so axe cannot compute
      // contrast here. Seal contrast is verified against the resolved token
      // values in tests/evidence-seal-contrast.test.ts.
      "color-contrast": { enabled: false },
    },
  });
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.html),
  }));
}

const SEAL = {
  value: "2,1 m",
  evidence: { value: "term-b", label: "modelo", tone: "info" },
  probability: { value: "rung-c", label: "grau-c" },
  stale: true,
  staleLabel: "obsoleto",
  why: "the 16:00 window has already passed",
  whyLabel: "porquê — {term}",
  closeLabel: "Fechar",
};

describe("evidence seal primitives — axe-core audit", () => {
  it("CaminhoStateChip: all four states have no violations", async () => {
    const el = host();
    for (const state of ["to-verify", "verified", "not-verified", "not-done"]) {
      render(CaminhoStateChip, el, { state });
    }
    expect(el.querySelectorAll(".caminho-chip")).toHaveLength(4);
    expect(await audit(el)).toEqual([]);
  });

  it("SealChip with both axes, stale and why (closed) has no violations", async () => {
    const el = host();
    render(SealChip, el, SEAL);
    expect(el.querySelector(".seal-chip-probability")).not.toBeNull();
    expect(el.querySelector(".seal-chip-stale")).not.toBeNull();
    expect(el.querySelector("button.seal-chip-why-trigger")).not.toBeNull();
    expect(await audit(el)).toEqual([]);
  });

  it("SealChip with the why disclosure open has no violations", async () => {
    const el = host();
    render(SealChip, el, SEAL);
    el.querySelector<HTMLButtonElement>("button.seal-chip-why-trigger")!.click();
    flushSync();
    expect(el.querySelector(".seal-chip-why-panel")).not.toBeNull();
    expect(await audit(el)).toEqual([]);
  });
});
