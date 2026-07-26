/**
 * S2.1 (#60) package-content guard — the generic renderer dispatch must be a
 * COMPATIBILITY ADAPTER over @aiaiai-pt/widget-system, not a second
 * implementation of the tester/priority ranking loop.
 *
 * Sistema keeps the deprecated `@aiaiai-pt/design-system/renderer/*` import
 * surface for one migration window (#60), but the ranking ALGORITHM lives in
 * exactly one place — `@aiaiai-pt/widget-system/core`. This test reads the
 * source of `dispatch.ts` directly and asserts:
 *
 *   1. It imports from `@aiaiai-pt/widget-system/core` (delegation is wired).
 *   2. It no longer contains the ranking loop — the tell-tales of a duplicate
 *      `selectEntry` implementation (`let best`, `bestScore`, iterating entries
 *      and comparing scores) are gone.
 *
 * Red-first: against the pristine `dispatch.ts` (which owns the loop) both
 * assertions fail; after delegation they pass. This is the executable form of
 * #60 AC "Package-content tests prove no duplicate registry/dispatch
 * implementation remains in Sistema."
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const DISPATCH_SRC = readFileSync(
  resolve(__dirname, "../components/renderer/dispatch.ts"),
  "utf-8",
);

const REGISTRY_SRC = readFileSync(
  resolve(__dirname, "../components/renderer/registry.ts"),
  "utf-8",
);

describe("renderer dispatch is a compat adapter over widget-system/core (#60)", () => {
  it("delegates to @aiaiai-pt/widget-system/core", () => {
    expect(DISPATCH_SRC).toMatch(
      /from\s+['"]@aiaiai-pt\/widget-system\/core['"]/,
    );
  });

  it("no longer contains the ranking loop (no duplicate selectEntry impl)", () => {
    // The tell-tales of the local ranking loop. A delegating adapter builds a
    // ctx + adapted entries and hands the loop to core.selectEntry — it never
    // declares `bestScore` or the `let best` accumulator.
    expect(DISPATCH_SRC).not.toMatch(/bestScore/);
    expect(DISPATCH_SRC).not.toMatch(/let\s+best\b/);
  });
});

describe("renderer base registry holds no ranking loop, delegates dispatch (#60)", () => {
  it("resolves through ./dispatch (selectEntry), not a local loop", () => {
    // The base registry is Atelier-coupled compat, but it must contribute only
    // the entry list — resolution goes through the delegated dispatcher.
    expect(REGISTRY_SRC).toMatch(
      /import\s*\{[^}]*\bselectEntry\b[^}]*\}\s*from\s+['"]\.\/dispatch['"]/s,
    );
    expect(REGISTRY_SRC).toMatch(/selectEntry\(\s*_entries/);
  });

  it("contains no ranking loop of its own", () => {
    expect(REGISTRY_SRC).not.toMatch(/bestScore/);
    expect(REGISTRY_SRC).not.toMatch(/let\s+best\b/);
  });
});
