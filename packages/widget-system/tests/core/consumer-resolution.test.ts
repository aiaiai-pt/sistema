// The package ships TypeScript SOURCE — `exports` points straight at
// `src/**/index.ts`, with no build step. That makes every relative import
// inside src/ part of the PUBLIC contract: a consumer's compiler resolves them.
//
// An import ending in `.ts` is only legal when the importer enables
// `allowImportingTsExtensions`. This package used to enable it for itself, so
// `export * from "./seal.ts"` typechecked here and failed for everyone else with
// TS5097 — and it shipped that way in the published 0.2.1, forcing a consumer to
// turn the flag on just to install us.
//
// The flag is gone from tsconfig.json now, but CI runs `npm test` and not tsc,
// so removing it does not by itself stop a regression. This test does.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(import.meta.dirname, "../../src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk(SRC).filter(
  (f) => f.endsWith(".ts") || f.endsWith(".svelte"),
);

describe("consumer resolution — the published import graph", () => {
  it("finds the source files it is meant to police", () => {
    expect(sourceFiles.length).toBeGreaterThan(5);
  });

  it("no shipped file imports a relative path with a .ts extension", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf-8");
      for (const m of text.matchAll(/from\s+"(\.{1,2}\/[^"]*\.ts)"/g)) {
        offenders.push(`${file.slice(SRC.length + 1)} → ${m[1]}`);
      }
    }
    expect(
      offenders,
      "A consumer without allowImportingTsExtensions fails with TS5097 on these:\n" +
        offenders.join("\n"),
    ).toEqual([]);
  });

  it("tsconfig does not re-enable allowImportingTsExtensions", () => {
    // Turning the flag back on would make the offending imports typecheck here
    // while still breaking every consumer — the exact shape of the 0.2.1 defect.
    const tsconfig = readFileSync(
      join(import.meta.dirname, "../../tsconfig.json"),
      "utf-8",
    );
    expect(tsconfig).not.toContain("allowImportingTsExtensions");
  });
});
