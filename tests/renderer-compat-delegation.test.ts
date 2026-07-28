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
import {
  selectEntry,
  NOT_APPLICABLE,
  type RegistryEntry,
} from "../components/renderer/dispatch";
import type { Binding, OntologySchema } from "../components/renderer/types";

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

/**
 * The schema-reading seam (#60, the reviewer's named weakest claim).
 *
 * The compat adapter's whole reason to keep the Atelier `(binding, schema,
 * type)` tester signature — rather than collapse to the ctx model — is that a
 * consumer's tester may RANK on the ontology `schema`, which the generic
 * `WidgetMatchContext` omits. These tests exercise a tester whose ranking
 * depends on schema SHAPE and prove:
 *   1. the closure adapter hands the tester the EXACT `schema` reference passed
 *      to `selectEntry` (identity, not a copy);
 *   2. the delegated `selectEntry` selects identically to a reference
 *      pre-delegation ranking loop across a schema matrix — converting "zero
 *      behavioural diff" from analysis to an exercised invariant.
 */
describe("schema-reading testers survive the delegation seam (#60)", () => {
  type P = string;

  // A faithful transcription of the PRE-delegation ranking loop (the pristine
  // `dispatch.ts` body), used as the oracle the delegated adapter must match.
  const referenceSelect = (
    entries: ReadonlyArray<RegistryEntry<P>>,
    binding: Binding,
    schema: OntologySchema | null,
    type?: string,
  ): { key: string; payload: P } | null => {
    let best: RegistryEntry<P> | null = null;
    let bestScore = NOT_APPLICABLE;
    for (const entry of entries) {
      const score = entry.tester(binding, schema, type);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    return best ? { key: best.key, payload: best.payload } : null;
  };

  // Generic kind widget (ignores schema). Type-specific outranks it. A
  // schema-specific widget outranks BOTH, but only when the schema shape matches.
  const entries: RegistryEntry<P>[] = [
    {
      key: "entity-list",
      payload: "EntityList",
      tester: (b) => (b.kind === "list" ? 10 : NOT_APPLICABLE),
    },
    {
      key: "filter-bar",
      payload: "FilterBar",
      tester: (b, _s, t) =>
        b.kind === "list" && t === "filter-bar" ? 20 : NOT_APPLICABLE,
    },
    {
      key: "occurrence-map",
      payload: "OccurrenceMap",
      // RANKS ON SCHEMA SHAPE: wins only for the `occurrence` entity that also
      // carries a `geometry` field — pure schema-driven ranking.
      tester: (b, schema) =>
        b.kind === "list" &&
        schema?.entity === "occurrence" &&
        schema.fields.some((f) => f.key === "geometry")
          ? 30
          : NOT_APPLICABLE,
    },
  ];

  const listBinding: Binding = { kind: "list", entity: "occurrence" };
  const geoSchema: OntologySchema = {
    entity: "occurrence",
    fields: [{ key: "id" }, { key: "geometry", type: "geo" }],
  };
  const plainSchema: OntologySchema = {
    entity: "occurrence",
    fields: [{ key: "id" }],
  };
  const otherSchema: OntologySchema = {
    entity: "sensor",
    fields: [{ key: "geometry", type: "geo" }],
  };

  it("hands the tester the EXACT schema reference (closure identity)", () => {
    let received: OntologySchema | null | undefined = undefined;
    const spyEntries: RegistryEntry<P>[] = [
      {
        key: "spy",
        payload: "Spy",
        tester: (_b, schema) => {
          received = schema;
          return 10;
        },
      },
    ];
    selectEntry(spyEntries, listBinding, geoSchema);
    // Same object identity, not a structural copy.
    expect(received).toBe(geoSchema);
  });

  it("selection is schema-driven: the geo schema selects the schema-specific widget", () => {
    expect(selectEntry(entries, listBinding, geoSchema)?.key).toBe("occurrence-map");
    // Same binding, a schema WITHOUT the geometry field → schema-specific tester
    // does not apply, generic wins.
    expect(selectEntry(entries, listBinding, plainSchema)?.key).toBe("entity-list");
    // Right shape, wrong entity → schema-specific tester does not apply.
    expect(selectEntry(entries, listBinding, otherSchema)?.key).toBe("entity-list");
    // null schema → schema-specific tester does not apply.
    expect(selectEntry(entries, listBinding, null)?.key).toBe("entity-list");
  });

  it("delegated selectEntry matches the pre-delegation reference across the schema matrix", () => {
    const schemas: Array<OntologySchema | null> = [
      geoSchema,
      plainSchema,
      otherSchema,
      null,
    ];
    const types: Array<string | undefined> = [undefined, "filter-bar"];
    for (const schema of schemas) {
      for (const type of types) {
        expect(selectEntry(entries, listBinding, schema, type)).toEqual(
          referenceSelect(entries, listBinding, schema, type),
        );
      }
    }
  });
});
