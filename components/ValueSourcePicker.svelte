<!--
  @component ValueSourcePicker

  One picker for every action-engine slot that accepts "literal-or-reference".
  Authoring affordance for action editors (Foundry-style declarative actions):
  every Edit value, Create field, function arg, and config-query filter shares
  this control. Wire format matches admin-api/app/actions/refs.py byte-for-byte.

  Pair with the helpers shipped alongside (ValueSourcePicker.helpers.js):
    serializeValueSource(v) → { value, functionArgs? }
    parseValueSource(wire, functionArgs?) → ValueSourceValue | null

  Allowed modes are narrowed per consumer — see the per-consumer matrix in
  the consumer's spec (see issue #28 of the action-editor parity work).

  @example Edits' value slot
  <ValueSourcePicker
    label="VALUE"
    bind:value={editValue}
    allowed={['literal', 'parameter', 'function', 'now', 'expression']}
    context={{ parameters, functions }}
    expectedType={field.type}
  />

  @example Function arg (recursive — depth 2)
  <ValueSourcePicker
    label={argName}
    bind:value={argValue}
    allowed={['literal', 'parameter', 'entity-field', 'user-field', 'config-list']}
    context={{ parameters, entitySchema, userFields, configTypes }}
  />
-->
<script module>
  let _vspUid = 0;
</script>

<script>
  /**
   * @typedef {import('./ValueSourcePicker.helpers.js').ValueSourceMode} ValueSourceMode
   * @typedef {import('./ValueSourcePicker.helpers.js').ValueSourceValue} ValueSourceValue
   *
   * @typedef {{ key: string, label: string, type: string }} ParameterField
   * @typedef {{ name: string, label?: string, argSchema: Record<string, SchemaField> }} FunctionDefinition
   * @typedef {{ key: string, label: string, description?: string }} UserField
   * @typedef {{ index: number, entityType: string, fields: string[] }} PriorCreate
   * @typedef {{ code: string, label: string }} ConfigType
   * @typedef {{ type: string, enum?: string[], format?: string, required?: boolean }} SchemaField
   *
   * @typedef {Object} ValueSourceContext
   * @property {ParameterField[]} [parameters]
   * @property {{ type: string, properties: Record<string, SchemaField> }} [entitySchema]
   * @property {UserField[]} [userFields]
   * @property {FunctionDefinition[]} [functions]
   * @property {PriorCreate[]} [priorCreates]
   * @property {ConfigType[]} [configTypes]
   */

  import Select from "./Select.svelte";
  import Combobox from "./Combobox.svelte";
  import Input from "./Input.svelte";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import Label from "./Label.svelte";
  import ValueSourcePicker from "./ValueSourcePicker.svelte";

  let {
    /** @type {ValueSourceValue | null} */
    value = $bindable(null),
    /** @type {((next: ValueSourceValue | null) => void) | undefined} */
    onchange = undefined,
    /** @type {ValueSourceMode[]} */
    allowed = [
      "literal",
      "parameter",
      "entity-field",
      "user-field",
      "now",
      "source-id",
      "created-field",
      "config-list",
      "function",
      "expression",
    ],
    /** @type {ValueSourceContext} */
    context = {},
    /** @type {string | undefined} */
    expectedType = undefined,
    /** @type {string | undefined} */
    label = undefined,
    /** @type {boolean} */
    required = false,
    /** @type {boolean} */
    disabled = false,
    /** @type {string | undefined} */
    id = undefined,
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  const uid = `vsp-${_vspUid++}`;
  const groupId = $derived(id ?? uid);

  const MODE_LABEL = /** @type {Record<ValueSourceMode, string>} */ ({
    literal: "Literal",
    parameter: "Parameter",
    "entity-field": "Entity field",
    "user-field": "User field",
    now: "Current time",
    "source-id": "Source entity id",
    "created-field": "Prior-created entity",
    "config-list": "Config rows",
    function: "Function",
    expression: "Expression",
  });

  const MODE_DESCRIPTION = /** @type {Record<ValueSourceMode, string>} */ ({
    literal: "A typed-in value",
    parameter: "Value of an action input",
    "entity-field": "A field of the source entity",
    "user-field": "A claim from the caller's JWT",
    now: "ISO 8601 UTC timestamp at execution time",
    "source-id": "ID of the entity being acted upon",
    "created-field": "Field of an entity created earlier in this action",
    "config-list": "List of org-scoped config rows",
    function: "Result of a registered action function",
    expression: "Inline arithmetic over $entity / $parameters / $user",
  });

  const modeOptions = $derived(
    allowed.map((mode) => ({ value: mode, label: MODE_LABEL[mode] })),
  );

  const currentMode = $derived(value?.mode ?? null);

  const isStoredModeForbidden = $derived(
    currentMode !== null && !allowed.includes(currentMode),
  );

  function emit(next) {
    value = next;
    onchange?.(next);
  }

  function pickMode(/** @type {string} */ next) {
    const mode = /** @type {ValueSourceMode} */ (next);
    if (mode === currentMode) return;
    emit(makeBlankForMode(mode));
  }

  /** @returns {ValueSourceValue} */
  function makeBlankForMode(/** @type {ValueSourceMode} */ mode) {
    switch (mode) {
      case "literal":
        return { mode, value: "" };
      case "parameter":
        return { mode, key: "" };
      case "entity-field":
        return { mode, field: "" };
      case "user-field":
        return { mode, key: "" };
      case "now":
        return { mode };
      case "source-id":
        return { mode };
      case "created-field":
        return { mode, index: 0, field: "id" };
      case "config-list":
        return { mode, configType: "" };
      case "function":
        return { mode, name: "", args: {} };
      case "expression":
        return { mode, expr: "" };
      default: {
        const exhaustive = /** @type {never} */ (mode);
        throw new Error(`makeBlankForMode: ${String(exhaustive)}`);
      }
    }
  }

  function clear() {
    emit(null);
  }

  // ----------- per-mode helpers -----------

  function paramOptions() {
    return (context.parameters ?? []).map((p) => ({
      value: p.key,
      label: `${p.label || p.key}`,
      description: p.type,
    }));
  }
  function entityFieldOptions() {
    const props = context.entitySchema?.properties ?? {};
    return Object.entries(props).map(([key, schema]) => ({
      value: key,
      label: key,
      description: schema.type,
    }));
  }
  function userFieldOptions() {
    return (context.userFields ?? []).map((u) => ({
      value: u.key,
      label: u.label,
      description: u.description,
    }));
  }
  function functionOptions() {
    return (context.functions ?? []).map((fn) => ({
      value: fn.name,
      label: fn.label || fn.name,
    }));
  }
  function priorCreateOptions() {
    return (context.priorCreates ?? []).map((c) => ({
      value: String(c.index),
      label: `${c.index}: ${c.entityType}`,
    }));
  }
  function priorCreateFieldOptions() {
    if (value?.mode !== "created-field") return [];
    const c = (context.priorCreates ?? []).find(
      (p) => p.index === value.index,
    );
    return (c?.fields ?? ["id"]).map((f) => ({ value: f, label: f }));
  }
  function configTypeOptions() {
    return (context.configTypes ?? []).map((c) => ({
      value: c.code,
      label: c.label || c.code,
    }));
  }

  // dangling-ref detector — true when the stored ref names something not in context
  const isDangling = $derived.by(() => {
    if (!value) return false;
    switch (value.mode) {
      case "parameter":
        return (
          value.key !== "" &&
          !(context.parameters ?? []).some((p) => p.key === value.key)
        );
      case "entity-field":
        return (
          value.field !== "" &&
          !((context.entitySchema?.properties ?? {})[value.field])
        );
      case "user-field":
        return (
          value.key !== "" &&
          !(context.userFields ?? []).some((u) => u.key === value.key)
        );
      case "function":
        return (
          value.name !== "" &&
          !(context.functions ?? []).some((fn) => fn.name === value.name)
        );
      case "config-list":
        return (
          value.configType !== "" &&
          !(context.configTypes ?? []).some((c) => c.code === value.configType)
        );
      case "created-field":
        return !((context.priorCreates ?? []).some((p) => p.index === value.index));
      default:
        return false;
    }
  });

  // type-mismatch detector — yellow soft warn (never blocks submit)
  const typeMismatch = $derived.by(() => {
    if (!expectedType || !value) return false;
    switch (value.mode) {
      case "parameter": {
        const p = (context.parameters ?? []).find((pp) => pp.key === value.key);
        return p ? !typesCompatible(p.type, expectedType) : false;
      }
      case "entity-field": {
        const f = (context.entitySchema?.properties ?? {})[value.field];
        return f ? !typesCompatible(f.type, expectedType) : false;
      }
      case "now":
        return !typesCompatible("datetime", expectedType);
      case "config-list":
        return !typesCompatible("list", expectedType);
      default:
        return false;
    }
  });

  function typesCompatible(/** @type {string} */ a, /** @type {string} */ b) {
    if (a === b) return true;
    // engine coerces freely between string ↔ number / datetime;
    // only flag obvious mismatches.
    const numericLike = new Set(["int", "float", "number"]);
    if (numericLike.has(a) && numericLike.has(b)) return true;
    return false;
  }

  // function-arg child editor — each arg is itself a ValueSourcePicker.
  function updateFunctionArg(/** @type {string} */ key, /** @type {ValueSourceValue | null} */ next) {
    if (value?.mode !== "function") return;
    const args = { ...value.args };
    if (next === null) delete args[key];
    else args[key] = next;
    emit({ ...value, args });
  }

  function functionArgAllowed() {
    // Args use the four context-ref modes plus literal and config-list.
    // Function-as-arg is forbidden by the engine's resolver layering — depth ≤ 2.
    return /** @type {ValueSourceMode[]} */ ([
      "literal",
      "parameter",
      "entity-field",
      "user-field",
      "config-list",
    ]);
  }

  function functionDef() {
    if (value?.mode !== "function") return null;
    return (context.functions ?? []).find((fn) => fn.name === value.name) ?? null;
  }

  function literalPlaceholder(/** @type {string | undefined} */ t) {
    switch (t) {
      case "int":
      case "float":
      case "number":
        return "0";
      case "bool":
        return "true";
      case "datetime":
        return "2026-01-01T00:00:00Z";
      case "uuid":
        return "00000000-0000-0000-0000-000000000000";
      default:
        return "Type a value";
    }
  }

  function coerceLiteral(/** @type {string} */ raw, /** @type {string | undefined} */ t) {
    switch (t) {
      case "int":
        return raw === "" ? null : Number.parseInt(raw, 10);
      case "float":
      case "number":
        return raw === "" ? null : Number.parseFloat(raw);
      case "bool":
        return raw === "true";
      default:
        return raw;
    }
  }
</script>

<div
  class="vsp {className}"
  class:vsp-disabled={disabled}
  role="group"
  aria-labelledby={label ? `${groupId}-label` : undefined}
  {...rest}
>
  {#if label}
    <Label for={`${groupId}-mode`} id={`${groupId}-label`}>
      {label}{#if required}<span class="vsp-required" aria-hidden="true">*</span>{/if}
    </Label>
  {/if}

  <div class="vsp-row">
    <div class="vsp-mode">
      <Select
        id={`${groupId}-mode`}
        size="sm"
        placeholder={value === null ? "Pick a source" : undefined}
        value={currentMode ?? ""}
        options={modeOptions}
        onchange={pickMode}
        {disabled}
      />
    </div>

    <div class="vsp-detail">
      {#if isStoredModeForbidden && value}
        <div class="vsp-error-row">
          <Badge variant="error">no longer allowed: {MODE_LABEL[value.mode]}</Badge>
          <Button variant="ghost" size="sm" onclick={clear}>Clear</Button>
        </div>
      {:else if value === null}
        <span class="vsp-placeholder">{MODE_DESCRIPTION[allowed[0]] ?? ""}</span>
      {:else if value.mode === "literal"}
        <Input
          size="sm"
          placeholder={literalPlaceholder(expectedType)}
          value={String(value.value ?? "")}
          oninput={(e) => emit({ mode: "literal", value: coerceLiteral(/** @type {HTMLInputElement} */ (e.target).value, expectedType) })}
          {disabled}
        />
      {:else if value.mode === "parameter"}
        <Combobox
          size="sm"
          placeholder="Pick a parameter"
          items={paramOptions()}
          value={value.key}
          onchange={(k) => emit({ mode: "parameter", key: k })}
          {disabled}
        />
      {:else if value.mode === "entity-field"}
        <Combobox
          size="sm"
          placeholder="Pick a field"
          items={entityFieldOptions()}
          value={value.field}
          onchange={(f) => emit({ mode: "entity-field", field: f })}
          {disabled}
        />
      {:else if value.mode === "user-field"}
        <Combobox
          size="sm"
          placeholder="Pick a user claim"
          items={userFieldOptions()}
          value={value.key}
          onchange={(k) => emit({ mode: "user-field", key: k })}
          {disabled}
        />
      {:else if value.mode === "now"}
        <Badge variant="info">$now — current UTC timestamp</Badge>
      {:else if value.mode === "source-id"}
        <Badge variant="info">$source.id — id of the entity being acted upon</Badge>
      {:else if value.mode === "config-list"}
        <Combobox
          size="sm"
          placeholder="Pick a config type"
          items={configTypeOptions()}
          value={value.configType}
          onchange={(c) => emit({ mode: "config-list", configType: c })}
          {disabled}
        />
        <Badge variant="neutral">list</Badge>
      {:else if value.mode === "expression"}
        <Input
          size="sm"
          placeholder="$entity.X + 1"
          value={value.expr}
          oninput={(e) => emit({ mode: "expression", expr: /** @type {HTMLInputElement} */ (e.target).value })}
          {disabled}
        />
      {:else if value.mode === "created-field"}
        <div class="vsp-inline">
          <Combobox
            size="sm"
            placeholder="prior create"
            items={priorCreateOptions()}
            value={String(value.index)}
            onchange={(i) => emit({ mode: "created-field", index: Number(i), field: value.field })}
            {disabled}
          />
          <Combobox
            size="sm"
            placeholder="field"
            items={priorCreateFieldOptions()}
            value={value.field}
            onchange={(f) => emit({ mode: "created-field", index: value.index, field: f })}
            {disabled}
          />
        </div>
      {:else if value.mode === "function"}
        <Combobox
          size="sm"
          placeholder="Pick a function"
          items={functionOptions()}
          value={value.name}
          onchange={(n) => emit({ mode: "function", name: n, args: {} })}
          {disabled}
        />
      {/if}

      {#if value && !isStoredModeForbidden}
        {#if isDangling}
          <Badge variant="error">removed from context</Badge>
          <Button variant="ghost" size="sm" onclick={clear}>Clear</Button>
        {:else if typeMismatch}
          <Badge variant="warning">type mismatch · expected {expectedType}</Badge>
        {/if}
      {/if}
    </div>
  </div>

  {#if value?.mode === "function" && value.name}
    {@const fn = functionDef()}
    {#if fn}
      <div class="vsp-args" role="group" aria-label={`${value.name} args`}>
        <span class="vsp-args-title">Args</span>
        {#each Object.entries(fn.argSchema) as [argKey, argSchema]}
          <ValueSourcePicker
            label={argKey}
            value={value.args[argKey] ?? null}
            allowed={functionArgAllowed()}
            {context}
            expectedType={argSchema.type}
            onchange={(next) => updateFunctionArg(argKey, next)}
            {disabled}
          />
        {/each}
      </div>
    {:else}
      <Badge variant="error">function "{value.name}" not in registry</Badge>
    {/if}
  {/if}
</div>

<style>
  .vsp {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .vsp-required {
    color: var(--color-text-error);
    margin-inline-start: var(--space-3xs);
  }

  .vsp-row {
    display: grid;
    grid-template-columns: minmax(0, 11rem) minmax(0, 1fr);
    gap: var(--space-sm);
    align-items: center;
  }

  .vsp-mode {
    min-width: 0;
  }

  .vsp-detail {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2xs);
    align-items: center;
    min-width: 0;
  }

  .vsp-detail :global(.input-group) {
    flex: 1 1 auto;
    min-width: 0;
  }

  .vsp-error-row {
    display: flex;
    gap: var(--space-2xs);
    align-items: center;
  }

  .vsp-placeholder {
    color: var(--color-text-muted);
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
  }

  .vsp-inline {
    display: flex;
    gap: var(--space-2xs);
    flex: 1 1 auto;
    min-width: 0;
  }

  .vsp-args {
    margin-inline-start: var(--space-md);
    padding: var(--space-sm);
    border: var(--border-width) solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    background: var(--color-surface-secondary);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .vsp-args-title {
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    letter-spacing: var(--type-label-tracking);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .vsp-disabled {
    opacity: 0.6;
    pointer-events: none;
  }
</style>
