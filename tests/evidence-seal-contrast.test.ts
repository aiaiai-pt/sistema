/**
 * Evidence seal tokens — WCAG contrast verification.
 *
 * H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.
 *
 * Checks that the three evidence-state text tokens (measured / inferred /
 * projected) meet WCAG AA on their own evidence-bg tokens in the UBP light
 * scheme, and that the dark-scheme overrides meet AA/AAA on the dark surface.
 *
 * ─── Coverage gap: color-mix() values ───────────────────────────────────────
 * The --seal-*-bg dark overrides and the --seal-stale-* tokens use color-mix()
 * or inherit from semantic tokens that resolve via color-mix() in dark. These
 * are NOT verified by this suite (see ubp-theme-contrast.test.ts for the
 * identical limitation note). Visual QA covers these bg tokens.
 *
 * The dark-scheme seal TEXT tokens (#4ade80, #60a5fa, #fbbf24) are raw hex
 * and ARE verified here against the dark surface (#0b182a = steel-900).
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─── Re-use the token infrastructure from ubp-theme-contrast.test.ts ─────────

type TokenMap = Map<string, string>;

function extractTokens(css: string, selectorPattern: string): TokenMap {
  const tokens: TokenMap = new Map();
  const escaped = selectorPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "gs");
  const block = [...css.matchAll(re)].map((m) => m[1]).join("\n");
  for (const match of block.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) {
    tokens.set(match[1].trim(), match[2].trim());
  }
  return tokens;
}

function merge(...layers: TokenMap[]): TokenMap {
  const out: TokenMap = new Map();
  for (const layer of layers) {
    for (const [k, v] of layer) out.set(k, v);
  }
  return out;
}

function resolve(value: string, tokens: TokenMap, depth = 0): string {
  if (depth > 20 || !value.includes("var(")) return value;
  return value.replace(
    /var\(\s*(--[\w-]+)(?:\s*,\s*([^)]*))?\s*\)/g,
    (_, name, fallback) => {
      const raw = tokens.get(name) ?? fallback ?? name;
      return resolve(raw, tokens, depth + 1);
    },
  );
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseHex(hex: string): RGBA | null {
  const h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    const [r, g, b] = [...h].map((c) => parseInt(c + c, 16));
    return { r, g, b, a: 1 };
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  if (h.length === 8) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: parseInt(h.slice(6, 8), 16) / 255,
    };
  }
  return null;
}

function parseRgba(value: string): RGBA | null {
  const m = value.match(
    /rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/,
  );
  if (!m) return null;
  return {
    r: parseFloat(m[1]),
    g: parseFloat(m[2]),
    b: parseFloat(m[3]),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

function parseColor(value: string): RGBA | null {
  const v = value.trim();
  if (v.startsWith("#")) return parseHex(v);
  if (v.startsWith("rgb")) return parseRgba(v);
  return null;
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance({ r, g, b }: RGBA): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function composite(fg: RGBA, bg: RGBA): RGBA {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

function contrastRatio(a: RGBA, b: RGBA): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function resolveColor(name: string, tokens: TokenMap, bg?: RGBA): RGBA {
  const raw = tokens.get(name);
  if (!raw) throw new Error(`Token ${name} not found`);
  const resolved = resolve(raw, tokens);
  const color = parseColor(resolved);
  if (!color)
    throw new Error(`Cannot parse ${name}: "${resolved}" (raw: "${raw}")`);
  if (color.a < 1 && bg) return composite(color, bg);
  return color;
}

// ─── Load token files ─────────────────────────────────────────────────────────

const root = join(import.meta.dirname, "..");
const baseCss = readFileSync(join(root, "tokens/base.css"), "utf-8");
const semanticCss = readFileSync(join(root, "tokens/semantic.css"), "utf-8");
const componentsCss = readFileSync(join(root, "tokens/components.css"), "utf-8");
const ubpCss = readFileSync(join(root, "tokens/themes/ubp.css"), "utf-8");

const baseTokens = extractTokens(baseCss, ":root");
const semanticTokens = extractTokens(semanticCss, ":root");
const darkGenericTokens = extractTokens(semanticCss, `:root[data-scheme="dark"]`);
const ubpTokens = extractTokens(ubpCss, `[data-theme="ubp"]`);
const ubpDarkTokens = extractTokens(ubpCss, `[data-theme="ubp"][data-scheme="dark"]`);
const componentTokens = extractTokens(componentsCss, ":root");

// Light: base + semantic + component defaults + ubp theme overrides.
// Merge order mirrors CSS source order: component tokens (:root in components.css)
// load before the theme block ([data-theme="ubp"] in ubp.css); theme wins when
// both have the same specificity (0,1,0) because it appears later.
const lightTokens: TokenMap = merge(
  baseTokens,
  semanticTokens,
  componentTokens,
  ubpTokens,
);

// Dark: base + semantic + component defaults + ubp light + genericDark + ubpDark.
// ubpDark ([data-theme="ubp"][data-scheme="dark"], specificity 0,2,0) wins over
// all :root and single-attribute blocks; source-order tie with genericDark resolved
// by ubp.css loading after semantic.css.
const darkTokens: TokenMap = merge(
  baseTokens,
  semanticTokens,
  componentTokens,
  ubpTokens,
  darkGenericTokens,
  ubpDarkTokens,
);

// ─── Light-scheme evidence token contrast ─────────────────────────────────────
//
// Each evidence-state text token is tested against its own bg token AND
// against the main surface (so both usages clear the bar).
//
// Note: --seal-*-bg tokens resolve to --color-*-subtle, which in the UBP light
// theme are raw hex values, so they ARE parseable by this suite.

describe("[Slice 2] Evidence seal — UBP light scheme contrast", () => {
  it("--seal-measured-text on --seal-measured-bg ≥4.5:1 [AA text]", () => {
    const bg = resolveColor("--seal-measured-bg", lightTokens);
    const fg = resolveColor("--seal-measured-text", lightTokens, bg);
    expect(
      contrastRatio(fg, bg),
      `measured text on measured bg — expected ≥4.5:1`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("--seal-inferred-text on --seal-inferred-bg ≥4.5:1 [AA text]", () => {
    const bg = resolveColor("--seal-inferred-bg", lightTokens);
    const fg = resolveColor("--seal-inferred-text", lightTokens, bg);
    expect(
      contrastRatio(fg, bg),
      `inferred text on inferred bg — expected ≥4.5:1`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("--seal-projected-text on --seal-projected-bg ≥4.5:1 [AA text]", () => {
    const bg = resolveColor("--seal-projected-bg", lightTokens);
    const fg = resolveColor("--seal-projected-text", lightTokens, bg);
    expect(
      contrastRatio(fg, bg),
      `projected text on projected bg — expected ≥4.5:1`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("--seal-stale-text on --seal-stale-bg ≥3.0:1 [non-essential UI]", () => {
    const bg = resolveColor("--seal-stale-bg", lightTokens);
    const fg = resolveColor("--seal-stale-text", lightTokens, bg);
    expect(
      contrastRatio(fg, bg),
      `stale text on stale bg — expected ≥3.0:1`,
    ).toBeGreaterThanOrEqual(3.0);
  });

  it("--seal-measured-text on --color-surface ≥3.0:1 [large UI — badge shape]", () => {
    const bg = resolveColor("--color-surface", lightTokens);
    const fg = resolveColor("--seal-measured-text", lightTokens, bg);
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(3.0);
  });
});

// ─── Dark-scheme evidence token contrast ──────────────────────────────────────
//
// Dark text tokens are raw hex in the ubp.css dark block → parseable.
// Background tokens use color-mix() → NOT parseable; skip bg assertions.
// Text tokens are asserted on the dark surface (#0b182a = --color-surface dark).

describe("[Slice 2] Evidence seal — UBP dark scheme text contrast on surface", () => {
  it("--seal-measured-text on --color-surface (dark) ≥7.0:1 [AAA]", () => {
    const bg = resolveColor("--color-surface", darkTokens);
    const fg = resolveColor("--seal-measured-text", darkTokens, bg);
    expect(
      contrastRatio(fg, bg),
      `dark measured text on dark surface — expected ≥7.0:1`,
    ).toBeGreaterThanOrEqual(7.0);
  });

  it("--seal-inferred-text on --color-surface (dark) ≥7.0:1 [AAA]", () => {
    const bg = resolveColor("--color-surface", darkTokens);
    const fg = resolveColor("--seal-inferred-text", darkTokens, bg);
    expect(
      contrastRatio(fg, bg),
      `dark inferred text on dark surface — expected ≥7.0:1`,
    ).toBeGreaterThanOrEqual(7.0);
  });

  it("--seal-projected-text on --color-surface (dark) ≥7.0:1 [AAA]", () => {
    const bg = resolveColor("--color-surface", darkTokens);
    const fg = resolveColor("--seal-projected-text", darkTokens, bg);
    expect(
      contrastRatio(fg, bg),
      `dark projected text on dark surface — expected ≥7.0:1`,
    ).toBeGreaterThanOrEqual(7.0);
  });

  it("dark evidence text tokens are present (ubp dark block provides overrides)", () => {
    // Confirm the dark overrides exist and are raw hex (not inheriting light values)
    const measuredDark = ubpDarkTokens.get("--seal-measured-text");
    const inferredDark = ubpDarkTokens.get("--seal-inferred-text");
    const projectedDark = ubpDarkTokens.get("--seal-projected-text");
    expect(measuredDark, "--seal-measured-text dark override").toBeDefined();
    expect(inferredDark, "--seal-inferred-text dark override").toBeDefined();
    expect(projectedDark, "--seal-projected-text dark override").toBeDefined();
  });
});

// ─── Structural: tokens exist in components.css ───────────────────────────────

describe("[Slice 2] Evidence seal — token presence", () => {
  const LIGHT_TOKENS = [
    "--seal-measured-text",
    "--seal-measured-bg",
    "--seal-inferred-text",
    "--seal-inferred-bg",
    "--seal-projected-text",
    "--seal-projected-bg",
    "--seal-stale-text",
    "--seal-stale-bg",
  ];

  for (const token of LIGHT_TOKENS) {
    it(`${token} is declared in components.css`, () => {
      expect(
        componentTokens.has(token),
        `${token} must be in :root block of components.css`,
      ).toBe(true);
    });
  }
});
