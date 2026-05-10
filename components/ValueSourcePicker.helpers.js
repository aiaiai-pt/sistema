/**
 * Helpers for ValueSourcePicker — translate between the picker's
 * structured ValueSourceValue object and the wire format the action
 * engine reads (admin-api/app/actions/refs.py and edits.py).
 *
 * Mode catalog and wire formats — see
 * dev_docs/specs/action-editor-parity-value-source-picker.md §3.
 */

/**
 * @typedef {'literal' | 'parameter' | 'entity-field' | 'user-field'
 *           | 'now' | 'source-id' | 'created-field'
 *           | 'config-list' | 'function' | 'expression'} ValueSourceMode
 */

/**
 * @typedef {(
 *   { mode: 'literal', value: string | number | boolean | null }
 *   | { mode: 'parameter', key: string }
 *   | { mode: 'entity-field', field: string }
 *   | { mode: 'user-field', key: string }
 *   | { mode: 'now' }
 *   | { mode: 'source-id' }
 *   | { mode: 'created-field', index: number, field: string }
 *   | { mode: 'config-list', configType: string }
 *   | { mode: 'function', name: string, args: Record<string, ValueSourceValue> }
 *   | { mode: 'expression', expr: string }
 * )} ValueSourceValue
 */

/**
 * @typedef {Object} SerializedValueSource
 * @property {unknown} value
 *   The wire scalar/string going into the slot
 *   (e.g. ActionEdit.value, ParamValuesSource.config_query.filter[key]).
 * @property {Record<string, unknown> | undefined} [functionArgs]
 *   Resolved function args dict — only set when v.mode === 'function'.
 *   Values are wire scalars/strings (recursively serialized).
 */

const CREATED_REF_RE = /^\$created\.(\d+)\.(\w+)$/;

/**
 * Convert a ValueSourceValue into wire form ready to persist.
 *
 * @param {ValueSourceValue} v
 * @returns {SerializedValueSource}
 */
export function serializeValueSource(v) {
  switch (v.mode) {
    case "literal":
      return { value: v.value };
    case "parameter":
      return { value: `$parameters.${v.key}` };
    case "entity-field":
      return { value: `$entity.${v.field}` };
    case "user-field":
      return { value: `$user.${v.key}` };
    case "now":
      return { value: "$now" };
    case "source-id":
      return { value: "$source.id" };
    case "created-field":
      return { value: `$created.${v.index}.${v.field}` };
    case "config-list":
      return { value: `$config.${v.configType}` };
    case "expression":
      return { value: `$expr(${v.expr})` };
    case "function": {
      /** @type {Record<string, unknown>} */
      const functionArgs = {};
      for (const [argKey, argValue] of Object.entries(v.args)) {
        functionArgs[argKey] = serializeValueSource(argValue).value;
      }
      return { value: `$function.${v.name}`, functionArgs };
    }
    default: {
      const exhaustive = /** @type {never} */ (v);
      throw new Error(
        `serializeValueSource: unknown mode ${JSON.stringify(exhaustive)}`,
      );
    }
  }
}

/**
 * Convert wire form back into a ValueSourceValue.
 * Returns null when value is null/undefined and no functionArgs were supplied.
 *
 * @param {unknown} wire
 * @param {Record<string, unknown> | null | undefined} [functionArgs]
 * @returns {ValueSourceValue | null}
 */
export function parseValueSource(wire, functionArgs) {
  if (wire === undefined) {
    // Slot was absent from the stored JSON — picker shows empty.
    return null;
  }
  if (wire === null) {
    // Engine treats null wire as literal null (refs.py:42 falls through).
    return { mode: "literal", value: null };
  }

  if (typeof wire !== "string") {
    // Non-string scalar (number / bool) → literal as-is.
    return { mode: "literal", value: /** @type {any} */ (wire) };
  }

  // Bare $now / $source.id (exact match).
  if (wire === "$now") return { mode: "now" };
  if (wire === "$source.id") return { mode: "source-id" };

  // Prefixed refs.
  if (wire.startsWith("$parameters.")) {
    return { mode: "parameter", key: wire.slice("$parameters.".length) };
  }
  if (wire.startsWith("$entity.")) {
    return { mode: "entity-field", field: wire.slice("$entity.".length) };
  }
  if (wire.startsWith("$user.")) {
    return { mode: "user-field", key: wire.slice("$user.".length) };
  }
  if (wire.startsWith("$config.")) {
    return { mode: "config-list", configType: wire.slice("$config.".length) };
  }
  if (wire.startsWith("$function.")) {
    const name = wire.slice("$function.".length);
    /** @type {Record<string, ValueSourceValue>} */
    const args = {};
    if (functionArgs) {
      for (const [argKey, argWire] of Object.entries(functionArgs)) {
        const parsed = parseValueSource(argWire);
        if (parsed !== null) {
          args[argKey] = parsed;
        }
      }
    }
    return { mode: "function", name, args };
  }
  if (wire.startsWith("$expr(") && wire.endsWith(")")) {
    return { mode: "expression", expr: wire.slice("$expr(".length, -1) };
  }
  const createdMatch = CREATED_REF_RE.exec(wire);
  if (createdMatch) {
    return {
      mode: "created-field",
      index: Number.parseInt(createdMatch[1], 10),
      field: createdMatch[2],
    };
  }

  // No recognized prefix → literal string. Matches engine's fall-through
  // in refs.py:75 (`return value`).
  return { mode: "literal", value: wire };
}

export const _internal = { CREATED_REF_RE };
