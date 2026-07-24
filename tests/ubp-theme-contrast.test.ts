/**
 * UBP Theme — Automated Contrast Verification
 *
 * DS-H0 #66 acceptance criterion: "Automated contrast verification uses
 * computed composited colors and fails when required WCAG text/UI contrast
 * falls below the accepted threshold."
 *
 * This test parses the actual token files, resolves CSS custom property
 * chains, composites alpha colors against their declared backgrounds, and
 * asserts WCAG 2.1 AA/AAA contrast ratios without requiring a browser.
 *
 * Key regression: the historical 3.0:1 subtitle defect (--color-text-muted
 * used in subtitle roles). This suite FAILS if --color-text-secondary falls
 * below 4.5:1 on ANY declared surface in the UBP theme.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ─── CSS custom-property resolver ────────────────────────────────────────────

type TokenMap = Map<string, string>;

/**
 * Parse `selector { --foo: val; --bar: val2; }` blocks from CSS text.
 * Handles multi-line values and `var(--x)` references but NOT nested selectors.
 */
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

/** Merge layers left-to-right (later wins — simulates CSS cascade order). */
function merge(...layers: TokenMap[]): TokenMap {
  const out: TokenMap = new Map();
  for (const layer of layers) {
    for (const [k, v] of layer) out.set(k, v);
  }
  return out;
}

/** Resolve `var(--x[, fallback])` chains to raw values (max 20 hops). */
function resolve(value: string, tokens: TokenMap, depth = 0): string {
  if (depth > 20 || !value.includes("var(")) return value;
  return value.replace(/var\(\s*(--[\w-]+)(?:\s*,\s*([^)]*))?\s*\)/g, (_, name, fallback) => {
    const raw = tokens.get(name) ?? fallback ?? name;
    return resolve(raw, tokens, depth + 1);
  });
}

// ─── Color parsing + alpha compositing ───────────────────────────────────────

interface RGBA {
  r: number; // 0–255
  g: number;
  b: number;
  a: number; // 0–1
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
  const m = value.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
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

/** sRGB → linear light component. */
function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Relative luminance of an opaque color. */
function luminance({ r, g, b }: RGBA): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Composite a foreground RGBA over an opaque background (Porter-Duff src-over).
 * Returns the opaque composited result.
 */
function composite(fg: RGBA, bg: RGBA): RGBA {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

/** WCAG 2.1 contrast ratio. Both inputs are opaque (a === 1). */
function contrastRatio(a: RGBA, b: RGBA): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Resolve a named token to an opaque color, composited over `bg` if it has
 * alpha. Returns [parsed, composited] — composited is always opaque.
 */
function resolveColor(name: string, tokens: TokenMap, bg?: RGBA): RGBA {
  const raw = tokens.get(name);
  if (!raw) throw new Error(`Token ${name} not found`);
  const resolved = resolve(raw, tokens);
  const color = parseColor(resolved);
  if (!color) throw new Error(`Cannot parse ${name}: "${resolved}" (raw: "${raw}")`);
  if (color.a < 1 && bg) return composite(color, bg);
  return color;
}

// ─── Load and layer the token files ──────────────────────────────────────────

const root = join(import.meta.dirname, "..");
const baseCss = readFileSync(join(root, "tokens/base.css"), "utf-8");
const semanticCss = readFileSync(join(root, "tokens/semantic.css"), "utf-8");
const ubpCss = readFileSync(join(root, "tokens/themes/ubp.css"), "utf-8");

// Layer 1: primitives (:root in base.css)
const baseTokens = extractTokens(baseCss, ":root");
// Layer 2: semantic defaults (:root in semantic.css)
const semanticTokens = extractTokens(semanticCss, ":root");
// Layer 3: generic dark override (:root[data-scheme="dark"] in semantic.css)
const darkGenericTokens = extractTokens(semanticCss, `:root[data-scheme="dark"]`);
// Layer 4: UBP theme base ([data-theme="ubp"])
const ubpTokens = extractTokens(ubpCss, `[data-theme="ubp"]`);
// Layer 5: UBP dark override ([data-theme="ubp"][data-scheme="dark"])
const ubpDarkTokens = extractTokens(ubpCss, `[data-theme="ubp"][data-scheme="dark"]`);

// Resolved contexts — merge order matches CSS specificity cascade:
//   :root                     (0,0,0) → base + semantic defaults
//   [data-theme="ubp"]        (0,1,0) → UBP brand overrides
//   :root[data-scheme="dark"] (0,1,1) → generic dark (beats theme)
//   [data-theme="ubp"][data-scheme="dark"] (0,2,0) → UBP dark brand
//
// Light: base + semantic + ubp (no dark layers)
const lightTokens: TokenMap = merge(baseTokens, semanticTokens, ubpTokens);
// Dark: base + semantic + ubp + genericDark (beats ubp) + ubpDark (beats genericDark)
const darkTokens: TokenMap = merge(baseTokens, semanticTokens, ubpTokens, darkGenericTokens, ubpDarkTokens);

// ─── Contrast assertions ─────────────────────────────────────────────────────

function assertContrast(
  label: string,
  fgName: string,
  bgName: string,
  tokens: TokenMap,
  min: number,
) {
  const bg = resolveColor(bgName, tokens);
  const fg = resolveColor(fgName, tokens, bg);
  const ratio = contrastRatio(fg, bg);
  return { label, fg: fgName, bg: bgName, ratio, min, passes: ratio >= min };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("[DS-H0 #66] UBP theme — no Google Fonts runtime dependency", () => {
  it("ubp.css contains no fonts.googleapis.com URL", () => {
    expect(ubpCss).not.toContain("fonts.googleapis.com");
  });

  it("ubp.css contains no fonts.gstatic.com URL", () => {
    expect(ubpCss).not.toContain("fonts.gstatic.com");
  });

  it("--font-sans declares a fallback chain after 'Inter'", () => {
    const raw = ubpTokens.get("--font-sans") ?? "";
    expect(raw).toContain("Inter");
    // Must have at least one generic fallback
    expect(raw).toMatch(/system-ui|sans-serif|-apple-system/);
  });
});

describe("[DS-H0 #66] UBP light scheme — WCAG contrast (AA = 4.5:1 text, 3:1 UI)", () => {
  const cases = [
    { fg: "--color-text", bg: "--color-surface", min: 4.5, role: "body text [AA]" },
    { fg: "--color-text", bg: "--color-surface-secondary", min: 4.5, role: "body text on secondary [AA]" },
    { fg: "--color-text-secondary", bg: "--color-surface", min: 4.5, role: "subtitle text [AA] — regression control" },
    { fg: "--color-text-secondary", bg: "--color-surface-secondary", min: 4.5, role: "subtitle on secondary [AA]" },
    { fg: "--color-text-muted", bg: "--color-surface", min: 3.0, role: "muted (non-essential UI) [≥3:1]" },
    { fg: "--color-accent", bg: "--color-surface", min: 3.0, role: "accent on surface [≥3:1 for UI controls]" },
    { fg: "--color-text-on-accent", bg: "--color-accent", min: 4.5, role: "text-on-accent [AA]" },
    { fg: "--color-destructive", bg: "--color-surface", min: 4.5, role: "destructive text [AA]" },
    { fg: "--color-success", bg: "--color-surface", min: 3.0, role: "success text [≥3:1]" },
    { fg: "--color-info", bg: "--color-surface", min: 4.5, role: "info text [AA]" },
  ];

  for (const c of cases) {
    it(`${c.fg} on ${c.bg} — ${c.role}`, () => {
      const result = assertContrast(c.role, c.fg, c.bg, lightTokens, c.min);
      expect(result.ratio, `ratio ${result.ratio.toFixed(2)} must be ≥${c.min}`).toBeGreaterThanOrEqual(c.min);
    });
  }
});

describe("[DS-H0 #66] UBP dark scheme — WCAG contrast (3.0:1 subtitle regression control)", () => {
  const cases = [
    { fg: "--color-text", bg: "--color-surface", min: 7.0, role: "body text [AAA on dark]" },
    { fg: "--color-text", bg: "--color-surface-secondary", min: 4.5, role: "body text on secondary [AA]" },
    {
      fg: "--color-text-secondary",
      bg: "--color-surface",
      min: 4.5,
      role: "subtitle text [AA] — primary regression control, must not be 3.0:1",
    },
    {
      fg: "--color-text-secondary",
      bg: "--color-surface-secondary",
      min: 4.5,
      role: "subtitle on secondary [AA]",
    },
    { fg: "--color-text-muted", bg: "--color-surface", min: 3.0, role: "muted (non-essential) [≥3:1]" },
    { fg: "--color-accent", bg: "--color-surface", min: 4.5, role: "accent link text on dark [AA]" },
    { fg: "--color-text-on-accent", bg: "--color-accent", min: 4.5, role: "text-on-accent dark [AA]" },
    { fg: "--color-destructive", bg: "--color-surface", min: 4.5, role: "destructive on dark [AA]" },
    { fg: "--color-info", bg: "--color-surface", min: 4.5, role: "info on dark [AA]" },
  ];

  for (const c of cases) {
    it(`${c.fg} on ${c.bg} (dark) — ${c.role}`, () => {
      const result = assertContrast(c.role, c.fg, c.bg, darkTokens, c.min);
      expect(result.ratio, `ratio ${result.ratio.toFixed(2)} must be ≥${c.min}`).toBeGreaterThanOrEqual(c.min);
    });
  }
});

describe("[DS-H0 #66] UBP theme — structural requirements", () => {
  it("ubp.css is exported under ./tokens/* wildcard (package.json coverage)", () => {
    const pkgPath = join(root, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const exports = pkg.exports as Record<string, unknown>;
    // The wildcard entry "./tokens/*": "./tokens/*" covers ubp.css
    expect(exports["./tokens/*"]).toBe("./tokens/*");
  });

  it("ubp.css is included in files[] array (tokens directory)", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
    expect((pkg.files as string[]).includes("tokens")).toBe(true);
  });

  it("[data-theme='ubp'] block has no host layout, route, or product rules", () => {
    // Detect forbidden patterns: position, z-index, grid-template-areas,
    // display: grid on non-token names, @media breakpoints (those belong in components)
    const forbiddenPatterns = [
      /\bposition\s*:/,
      /\bz-index\s*:/,
      /grid-template-areas\s*:/,
      /\boverflow\s*:/,
      /margin\s*:/,
      /padding\s*:/,
    ];
    for (const pattern of forbiddenPatterns) {
      expect(ubpCss, `ubp.css must not contain layout rule ${pattern}`).not.toMatch(pattern);
    }
  });

  it("dark override selector has higher specificity indication (no duplicate of generic layer)", () => {
    // The dark override block must contain [data-theme="ubp"][data-scheme="dark"]
    // (both attributes = specificity 0,2,0 beats the generic 0,1,1 dark layer)
    expect(ubpCss).toContain('[data-theme="ubp"][data-scheme="dark"]');
  });
});

describe("[DS-H0 #66] UBP alpha compositing — overlay and accent-subtle colors", () => {
  it("overlay color (#0f172a with alpha=0.5) composited on surface clears 3:1 darkening", () => {
    // The overlay is not a text color but it must obscure background content
    // by creating sufficient visual separation. We verify it composites to a
    // value that's meaningfully different from the base surface.
    const surfaceColor = resolveColor("--color-surface", lightTokens);
    const overlayRaw = resolve(lightTokens.get("--color-overlay") ?? "", lightTokens);
    const overlayColor = parseColor(overlayRaw);
    expect(overlayColor).not.toBeNull();
    if (!overlayColor) return;
    const composited = composite(overlayColor, surfaceColor);
    // The composited overlay must be significantly darker than the surface
    const surfaceLum = luminance(surfaceColor);
    const overlayLum = luminance(composited);
    expect(overlayLum).toBeLessThan(surfaceLum * 0.3); // at least 70% luminance reduction
  });

  it("dark overlay (#000 with alpha=0.7) composited on dark surface is near-opaque dark", () => {
    const surfaceColor = resolveColor("--color-surface", darkTokens);
    const overlayRaw = resolve(darkTokens.get("--color-overlay") ?? "", darkTokens);
    const overlayColor = parseColor(overlayRaw);
    expect(overlayColor).not.toBeNull();
    if (!overlayColor) return;
    const composited = composite(overlayColor, surfaceColor);
    // Must be very dark
    expect(luminance(composited)).toBeLessThan(0.02);
  });
});
