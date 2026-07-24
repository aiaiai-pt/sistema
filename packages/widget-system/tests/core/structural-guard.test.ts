/**
 * Structural guard — /core import boundary.
 *
 * Asserts that nothing reachable from /core imports svelte, echarts, or
 * @aiaiai-pt/design-system at runtime. This is the hard rule that makes
 * /core safe for consumers that do not carry those dependencies (the optional-
 * peer contract documented in the package README and the ADR PEERS section).
 *
 * This test reads source files directly rather than inspecting the module
 * graph at runtime, so it catches violations before they reach a bundle step.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { describe, it, expect } from "vitest";

const CORE_DIR = resolve(__dirname, "../../src/core");

/** Patterns that must NOT appear as runtime imports in any /core source file. */
const FORBIDDEN_RUNTIME_IMPORTS: RegExp[] = [
  /from\s+['"]svelte['"]/,
  /from\s+['"]svelte\//,
  /from\s+['"]echarts['"]/,
  /from\s+['"]echarts\//,
  /from\s+['"]@aiaiai-pt\/design-system['"]/,
  /from\s+['"]@aiaiai-pt\/design-system\//,
];

/** Recursively collect .ts (non-.d.ts) files under a directory. */
function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (full.endsWith(".ts") && !full.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("core import boundary (structural guard)", () => {
  const coreFiles = collectSourceFiles(CORE_DIR);

  it("core directory contains at least one source file", () => {
    expect(coreFiles.length).toBeGreaterThan(0);
  });

  for (const filePath of coreFiles) {
    it(`${filePath.replace(CORE_DIR, "core")} has no svelte/echarts/design-system runtime imports`, () => {
      const src = readFileSync(filePath, "utf-8");
      for (const pattern of FORBIDDEN_RUNTIME_IMPORTS) {
        expect(
          src,
          `Forbidden import matching ${pattern} found in ${filePath}`,
        ).not.toMatch(pattern);
      }
    });
  }
});
