import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  serializeValueSource,
  parseValueSource,
} from "./ValueSourcePicker.helpers.js";

// ---------------------------------------------------------------------------
// Canonical wire formats — these MUST match admin-api/app/actions/refs.py.
// Drift here is a parity bug; refs.py is the truth.
// ---------------------------------------------------------------------------

describe("serializeValueSource — canonical wires", () => {
  test("literal string", () => {
    assert.deepEqual(
      serializeValueSource({ mode: "literal", value: "hello" }),
      {
        value: "hello",
      },
    );
  });
  test("literal number", () => {
    assert.deepEqual(serializeValueSource({ mode: "literal", value: 42 }), {
      value: 42,
    });
  });
  test("literal bool", () => {
    assert.deepEqual(serializeValueSource({ mode: "literal", value: true }), {
      value: true,
    });
  });
  test("literal null", () => {
    assert.deepEqual(serializeValueSource({ mode: "literal", value: null }), {
      value: null,
    });
  });
  test("parameter ref", () => {
    assert.deepEqual(
      serializeValueSource({ mode: "parameter", key: "assignee_id" }),
      { value: "$parameters.assignee_id" },
    );
  });
  test("entity-field ref", () => {
    assert.deepEqual(
      serializeValueSource({ mode: "entity-field", field: "state" }),
      { value: "$entity.state" },
    );
  });
  test("user-field ref", () => {
    assert.deepEqual(serializeValueSource({ mode: "user-field", key: "sub" }), {
      value: "$user.sub",
    });
  });
  test("user-field nested claim path", () => {
    assert.deepEqual(
      serializeValueSource({ mode: "user-field", key: "realm_access.roles" }),
      { value: "$user.realm_access.roles" },
    );
  });
  test("now", () => {
    assert.deepEqual(serializeValueSource({ mode: "now" }), { value: "$now" });
  });
  test("source-id", () => {
    assert.deepEqual(serializeValueSource({ mode: "source-id" }), {
      value: "$source.id",
    });
  });
  test("created-field default id", () => {
    assert.deepEqual(
      serializeValueSource({ mode: "created-field", index: 0, field: "id" }),
      { value: "$created.0.id" },
    );
  });
  test("created-field arbitrary field", () => {
    assert.deepEqual(
      serializeValueSource({
        mode: "created-field",
        index: 2,
        field: "organization",
      }),
      { value: "$created.2.organization" },
    );
  });
  test("config-list", () => {
    assert.deepEqual(
      serializeValueSource({
        mode: "config-list",
        configType: "occurrence_state_transition",
      }),
      { value: "$config.occurrence_state_transition" },
    );
  });
  test("expression", () => {
    assert.deepEqual(
      serializeValueSource({
        mode: "expression",
        expr: "$entity.reopen_count + 1",
      }),
      { value: "$expr($entity.reopen_count + 1)" },
    );
  });
  test("function with no args", () => {
    assert.deepEqual(
      serializeValueSource({
        mode: "function",
        name: "resolve_team",
        args: {},
      }),
      { value: "$function.resolve_team", functionArgs: {} },
    );
  });
  test("function with mixed-mode args (recursive serialise)", () => {
    assert.deepEqual(
      serializeValueSource({
        mode: "function",
        name: "resolve_team",
        args: {
          org_id: { mode: "entity-field", field: "organization" },
          user_id: { mode: "user-field", key: "sub" },
          region: { mode: "literal", value: "EU-West" },
          tags: { mode: "config-list", configType: "occurrence_state" },
        },
      }),
      {
        value: "$function.resolve_team",
        functionArgs: {
          org_id: "$entity.organization",
          user_id: "$user.sub",
          region: "EU-West",
          tags: "$config.occurrence_state",
        },
      },
    );
  });
});

describe("parseValueSource — wire → ValueSourceValue", () => {
  test("undefined wire → null (slot was absent from stored JSON)", () => {
    assert.equal(parseValueSource(undefined), null);
  });
  test("null wire → literal null (matches engine refs.py:42 fall-through)", () => {
    assert.deepEqual(parseValueSource(null), {
      mode: "literal",
      value: null,
    });
  });
  test("plain string → literal", () => {
    assert.deepEqual(parseValueSource("hello"), {
      mode: "literal",
      value: "hello",
    });
  });
  test("plain number → literal", () => {
    assert.deepEqual(parseValueSource(42), { mode: "literal", value: 42 });
  });
  test("plain bool → literal", () => {
    assert.deepEqual(parseValueSource(false), {
      mode: "literal",
      value: false,
    });
  });
  test("$parameters.X → parameter", () => {
    assert.deepEqual(parseValueSource("$parameters.assignee_id"), {
      mode: "parameter",
      key: "assignee_id",
    });
  });
  test("$entity.X → entity-field", () => {
    assert.deepEqual(parseValueSource("$entity.state"), {
      mode: "entity-field",
      field: "state",
    });
  });
  test("$user.X → user-field with full claim path", () => {
    assert.deepEqual(parseValueSource("$user.realm_access.roles"), {
      mode: "user-field",
      key: "realm_access.roles",
    });
  });
  test("$now → now", () => {
    assert.deepEqual(parseValueSource("$now"), { mode: "now" });
  });
  test("$source.id → source-id", () => {
    assert.deepEqual(parseValueSource("$source.id"), { mode: "source-id" });
  });
  test("$created.0.id → created-field", () => {
    assert.deepEqual(parseValueSource("$created.0.id"), {
      mode: "created-field",
      index: 0,
      field: "id",
    });
  });
  test("$created.2.organization → created-field", () => {
    assert.deepEqual(parseValueSource("$created.2.organization"), {
      mode: "created-field",
      index: 2,
      field: "organization",
    });
  });
  test("$config.X → config-list", () => {
    assert.deepEqual(parseValueSource("$config.occurrence_state_transition"), {
      mode: "config-list",
      configType: "occurrence_state_transition",
    });
  });
  test("$expr(...) → expression", () => {
    assert.deepEqual(parseValueSource("$expr($entity.reopen_count + 1)"), {
      mode: "expression",
      expr: "$entity.reopen_count + 1",
    });
  });
  test("$function.X with empty args → function", () => {
    assert.deepEqual(parseValueSource("$function.resolve_team", {}), {
      mode: "function",
      name: "resolve_team",
      args: {},
    });
  });
  test("$function.X with refs as args → function (recursive parse)", () => {
    assert.deepEqual(
      parseValueSource("$function.resolve_team", {
        org_id: "$entity.organization",
        user_id: "$user.sub",
        region: "EU-West",
        tags: "$config.occurrence_state",
      }),
      {
        mode: "function",
        name: "resolve_team",
        args: {
          org_id: { mode: "entity-field", field: "organization" },
          user_id: { mode: "user-field", key: "sub" },
          region: { mode: "literal", value: "EU-West" },
          tags: { mode: "config-list", configType: "occurrence_state" },
        },
      },
    );
  });
  test("partial-prefix string is a literal, not a malformed ref", () => {
    // "$entity" with no dot doesn't match the engine's startsWith check.
    assert.deepEqual(parseValueSource("$entity"), {
      mode: "literal",
      value: "$entity",
    });
    // "$mybudget" looks ref-like but isn't a known prefix.
    assert.deepEqual(parseValueSource("$mybudget"), {
      mode: "literal",
      value: "$mybudget",
    });
  });
  test("$created.X.id with non-numeric index falls through to literal", () => {
    // refs.py regex requires digits; a non-numeric index is a typo, not a ref.
    assert.deepEqual(parseValueSource("$created.foo.id"), {
      mode: "literal",
      value: "$created.foo.id",
    });
  });
});

describe("round-trip — every mode", () => {
  /** @type {import('./ValueSourcePicker.helpers.js').ValueSourceValue[]} */
  const cases = [
    { mode: "literal", value: "hello" },
    { mode: "literal", value: 0 },
    { mode: "literal", value: false },
    { mode: "literal", value: null },
    { mode: "parameter", key: "k" },
    { mode: "entity-field", field: "state" },
    { mode: "user-field", key: "sub" },
    { mode: "user-field", key: "realm_access.roles" },
    { mode: "now" },
    { mode: "source-id" },
    { mode: "created-field", index: 0, field: "id" },
    { mode: "created-field", index: 5, field: "name" },
    { mode: "config-list", configType: "occurrence_state" },
    { mode: "expression", expr: "$entity.reopen_count + 1" },
    {
      mode: "function",
      name: "fn",
      args: {
        a: { mode: "literal", value: "x" },
        b: { mode: "parameter", key: "p" },
      },
    },
  ];

  for (const v of cases) {
    test(`round-trips ${v.mode}${v.mode === "literal" ? `:${typeof v.value}` : ""}`, () => {
      const { value, functionArgs } = serializeValueSource(v);
      const parsed = parseValueSource(value, functionArgs);
      assert.deepEqual(parsed, v);
    });
  }
});
