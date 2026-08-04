/**
 * Marketing display scale — display-xl / display-2xl.
 *
 * WHY. The type scale stopped at --type-display-size: 36px, which the
 * typography foundations page labels "Brand moments, hero sections". 36px is an
 * application scale: sistema's own site uses .type-display for its h1, and it
 * cannot carry a marketing headline where the sentence IS the product. The
 * consuming surface (Palantaco web) had to declare raw font-sizes above 36 in
 * its own stylesheet, which is exactly the parallel-system failure the
 * token-roles lint exists to prevent.
 *
 * WHAT THIS GUARDS. The two-tier composition contract, not the pixel values:
 *   1. every new semantic role resolves to a RAW step, never to a literal
 *   2. every new role declares the full five-property set the other type roles
 *      declare (size / weight / leading / tracking / font), so a consumer can
 *      swap one role for another without discovering a missing property
 *   3. the raw scale stays monotonic — a later step is always larger
 *   4. the utility classes exist and reference only their own role's tokens
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const base = readFileSync(join(root, "tokens/base.css"), "utf8");
const semantic = readFileSync(join(root, "tokens/semantic.css"), "utf8");
const utilities = readFileSync(join(root, "tokens/utilities.css"), "utf8");

/** Value of a custom property from the first `:root` declaration that sets it. */
function decl(css: string, name: string): string | undefined {
  const m = css.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, "m"));
  return m ? m[1].trim() : undefined;
}

/** rem string -> number of px, at the 16px root the raw scale assumes. */
function rem(value: string): number {
  const m = value.match(/^([\d.]+)rem$/);
  if (!m) throw new Error(`expected a rem value, got: ${value}`);
  return parseFloat(m[1]) * 16;
}

const NEW_RAW_STEPS = ["--raw-font-size-48", "--raw-font-size-64"];
const NEW_ROLES = ["--type-display-xl", "--type-display-2xl"];
const ROLE_PROPS = ["size", "weight", "leading", "tracking", "font"];

describe("marketing display scale", () => {
  it("adds the raw steps above 36", () => {
    for (const step of NEW_RAW_STEPS) {
      expect(
        decl(base, step),
        `${step} missing from tokens/base.css`,
      ).toBeDefined();
    }
  });

  it("keeps the raw font-size scale monotonic", () => {
    const steps = [11, 12, 13, 14, 15, 18, 24, 36, 48, 64];
    const sizes = steps.map((s) => {
      const v = decl(base, `--raw-font-size-${s}`);
      expect(v, `--raw-font-size-${s} missing`).toBeDefined();
      return rem(v as string);
    });
    for (let i = 1; i < sizes.length; i++) {
      expect(
        sizes[i],
        `step ${steps[i]} is not larger than ${steps[i - 1]}`,
      ).toBeGreaterThan(sizes[i - 1]);
    }
    // the named step and its px value must agree — the scale's own convention
    steps.forEach((s, i) => expect(sizes[i]).toBe(s));
  });

  it("declares the full five-property set for each new role", () => {
    for (const role of NEW_ROLES) {
      for (const prop of ROLE_PROPS) {
        expect(
          decl(semantic, `${role}-${prop}`),
          `${role}-${prop} missing from tokens/semantic.css`,
        ).toBeDefined();
      }
    }
  });

  it("resolves every new role to a token, never to a literal", () => {
    for (const role of NEW_ROLES) {
      for (const prop of ROLE_PROPS) {
        const value = decl(semantic, `${role}-${prop}`) as string;
        expect(
          value,
          `${role}-${prop} must be var(--raw-*) or var(--font-*), got ${value}`,
        ).toMatch(/^var\(--(raw|font)-[a-z0-9-]+\)$/);
      }
    }
  });

  it("points the new sizes at the new raw steps", () => {
    expect(decl(semantic, "--type-display-xl-size")).toBe(
      "var(--raw-font-size-48)",
    );
    expect(decl(semantic, "--type-display-2xl-size")).toBe(
      "var(--raw-font-size-64)",
    );
  });

  it("ships a utility class per role that uses only that role's tokens", () => {
    for (const role of NEW_ROLES) {
      const cls = role.replace("--type-", "type-");
      const block = utilities.match(new RegExp(`\\.${cls}\\s*\\{([^}]*)\\}`));
      expect(block, `.${cls} missing from tokens/utilities.css`).toBeTruthy();
      const body = (block as RegExpMatchArray)[1];
      for (const prop of ROLE_PROPS) {
        expect(body, `.${cls} does not use ${role}-${prop}`).toContain(
          `var(${role}-${prop})`,
        );
      }
      // must not reach for a different role's tokens
      const foreign = body.match(
        /var\(--type-([a-z0-9-]+?)-(size|weight|leading|tracking|font)\)/g,
      );
      for (const ref of foreign ?? []) {
        expect(ref, `.${cls} references a foreign role: ${ref}`).toContain(
          role,
        );
      }
    }
  });
});
