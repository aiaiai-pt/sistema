<script lang="ts">
  // DS-internal sibling imports (this component lives in the DS now, #73 73f —
  // converged so admin preview AND portal runtime mount the SAME renderer).
  import Badge from "./Badge.svelte";
  import CodeBlock from "./CodeBlock.svelte";
  import Input from "./Input.svelte";
  import Select from "./Select.svelte";
  import Tag from "./Tag.svelte";
  import {
    buildActionPayload,
    placementConsequenceRows as buildPlacementConsequenceRows,
    type RendererMode,
  } from "./action-form-renderer-payload";
  // S7 (#27): the renderer dispatches arrangement to one of three
  // registered layout components. The key is read from
  // `target_config.layout_key` and validated through `resolveLayout`,
  // so an operator-supplied string never reaches the DOM verbatim
  // (RH#11 / R-SEC-07 / TH-08).
  import { resolveLayout } from "./action-form-renderer-layouts";

  /**
   * The renderer treats every parameter/action/placement as a loose record
   * (it reads optional fields defensively). It used to import the admin app's
   * `Entity`; in the DS it carries its own structural alias so it has no app
   * dependency. The consuming app may pass its richer `Entity` — structurally
   * compatible.
   */
  type Entity = Record<string, unknown>;
  type SelectOption = { value: string; label: string };
  type ActionSchema = {
    found?: boolean;
    schema_version?: string;
    action?: Entity | null;
    placement?: Entity | null;
    target?: Record<string, unknown> | null;
    source?: Record<string, unknown> | null;
    sections?: Array<{ key?: string; label?: string; parameters?: Entity[] }>;
    parameters?: Entity[];
    criteria?: Entity[];
  };

  interface Props {
    action: Entity | null;
    placement?: Entity | null;
    parameters?: Entity[];
    criteria?: Entity[];
    mode?: RendererMode;
    schema?: ActionSchema | null;
  }

  let {
    action,
    placement = null,
    parameters = [],
    criteria = [],
    mode = "admin-preview",
    schema = null,
  }: Props = $props();

  let values = $state<Record<string, unknown>>({});

  const renderedAction = $derived((schema?.action as Entity | null | undefined) ?? action);
  const renderedPlacement = $derived((schema?.placement as Entity | null | undefined) ?? placement);
  const renderedParameters = $derived((schema?.parameters as Entity[] | undefined) ?? parameters);
  const renderedCriteria = $derived((schema?.criteria as Entity[] | undefined) ?? criteria);
  const orderedParameters = $derived(
    [...renderedParameters]
      .filter((parameter) => parameter.is_active !== false)
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)),
  );
  const visibleParameters = $derived(orderedParameters.filter((parameter) => isVisible(parameter)));
  const hiddenOrDefaultedParameters = $derived(
    orderedParameters.filter(
      (parameter) =>
        !isVisible(parameter) ||
        (parameter.default_value !== null && parameter.default_value !== undefined),
    ),
  );
  const schemaSections = $derived(schemaSectionsFromContract());
  const sections = $derived(schemaSections ?? groupIntoSections(visibleParameters));
  const payload = $derived(buildPayload());
  const payloadJson = $derived(JSON.stringify(payload, null, 2));
  const criteriaSummary = $derived(
    renderedCriteria
      .filter((criterion) => criterion.is_active !== false)
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)),
  );

  $effect(() => {
    const next = { ...values };
    let touched = false;
    for (const parameter of orderedParameters) {
      const key = parameterKey(parameter);
      if (!key || key in next) continue;
      next[key] = initialValue(parameter);
      touched = true;
    }
    if (touched) values = next;
  });

  function parameterKey(parameter: Entity): string {
    return String(parameter.source_field_path ?? parameter.key ?? "");
  }

  function parameterType(parameter: Entity): string {
    return String(parameter.type ?? "string");
  }

  function isVisible(parameter: Entity): boolean {
    const visibility = parameter.visibility;
    if (visibility && typeof visibility === "object" && !Array.isArray(visibility)) {
      return (visibility as Record<string, unknown>).visible !== false;
    }
    return true;
  }

  function sectionName(parameter: Entity): string {
    const visibility = parameter.visibility;
    if (visibility && typeof visibility === "object" && !Array.isArray(visibility)) {
      const section = (visibility as Record<string, unknown>).section;
      if (section) return String(section);
    }
    const uiSchema = parameter.ui_schema;
    if (uiSchema && typeof uiSchema === "object" && !Array.isArray(uiSchema)) {
      const section = (uiSchema as Record<string, unknown>).section;
      if (section) return String(section);
    }
    return "Details";
  }

  function groupIntoSections(items: Entity[]): Array<{ name: string; items: Entity[] }> {
    const byName = new Map<string, Entity[]>();
    for (const parameter of items) {
      const name = sectionName(parameter);
      byName.set(name, [...(byName.get(name) ?? []), parameter]);
    }
    return [...byName.entries()].map(([name, sectionItems]) => ({ name, items: sectionItems }));
  }

  function schemaSectionsFromContract(): Array<{ name: string; items: Entity[] }> | null {
    if (!Array.isArray(schema?.sections)) return null;
    const next = schema.sections
      .map((section) => {
        const items = Array.isArray(section.parameters)
          ? section.parameters
              .filter((parameter) => parameter.is_active !== false && isVisible(parameter))
              .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
          : [];
        return { name: String(section.label ?? section.key ?? "Details"), items };
      })
      .filter((section) => section.items.length);
    return next.length ? next : null;
  }

  function enumOptions(parameter: Entity): SelectOption[] {
    let options: unknown[] = Array.isArray(parameter.options) ? parameter.options : [];
    if (!options.length) {
      const constraints = Array.isArray(parameter.constraints) ? parameter.constraints : [];
      const oneOf = constraints.find((constraint) => {
        if (!constraint || typeof constraint !== "object") return false;
        const type = (constraint as Record<string, unknown>).type;
        return type === "oneOf" || type === "one_of";
      }) as Record<string, unknown> | undefined;
      options = Array.isArray(oneOf?.values) ? oneOf.values : [];
    }
    return options
      .map((option: unknown) => {
        if (option && typeof option === "object") {
          const row = option as Record<string, unknown>;
          const value = String(row.value ?? row.key ?? "");
          return value ? { value, label: String(row.label ?? row.name ?? value) } : null;
        }
        const value = String(option ?? "");
        return value ? { value, label: value } : null;
      })
      .filter((option): option is SelectOption => !!option);
  }

  function initialValue(parameter: Entity): unknown {
    if (parameter.default_value !== null && parameter.default_value !== undefined) {
      return parameter.default_value;
    }
    const type = parameterType(parameter);
    if (type === "bool" || type === "boolean") return false;
    if (type === "number" || type === "integer") return "";
    if (type === "enum" || type === "select") return enumOptions(parameter)[0]?.value ?? "";
    return "";
  }

  function setValue(key: string, value: unknown) {
    values = { ...values, [key]: value };
  }

  function visibleValueBag(): Record<string, unknown> {
    const bag: Record<string, unknown> = {};
    for (const parameter of orderedParameters) {
      const key = parameterKey(parameter);
      if (!key) continue;
      bag[key] = values[key] ?? initialValue(parameter);
    }
    return bag;
  }

  function targetConfig(): Record<string, unknown> {
    const schemaTarget = schema?.target;
    if (schemaTarget && typeof schemaTarget === "object" && !Array.isArray(schemaTarget)) {
      return schemaTarget as Record<string, unknown>;
    }
    const value = renderedPlacement?.target_config;
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  function sourceSchema(): Record<string, unknown> {
    const schemaSource = schema?.source;
    if (schemaSource && typeof schemaSource === "object" && !Array.isArray(schemaSource)) {
      return schemaSource as Record<string, unknown>;
    }
    const value = renderedPlacement?.source_schema;
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  function buildPayload(): Record<string, unknown> {
    return buildActionPayload({
      action: renderedAction ?? null,
      placement: renderedPlacement ?? null,
      targetConfig: targetConfig(),
      sourceSchema: sourceSchema(),
      rawValues: visibleValueBag(),
      schemaVersion: schema?.schema_version ?? null,
      mode,
    }) as unknown as Record<string, unknown>;
  }

  function placementConsequenceRows(): Array<{ label: string; value: string }> {
    return buildPlacementConsequenceRows({
      placement: renderedPlacement ?? null,
      targetConfig: targetConfig(),
      sourceSchema: sourceSchema(),
      mode,
    });
  }

  // S7 (#27): resolve the layout component from target_config.layout_key.
  // Unknown / null / typo'd keys collapse to stacked-default; the
  // returned `key` is one of three known literals safe to render as
  // `data-layout={resolvedLayout.key}` (TH-08 mitigation).
  const resolvedLayout = $derived(resolveLayout(targetConfig().layout_key));
</script>

{#snippet fieldRow(rawParameter: Record<string, unknown>)}
  {@const parameter = rawParameter as Entity}
  {@const key = parameterKey(parameter)}
  {@const type = parameterType(parameter)}
  {#if type === "enum" || type === "select" || enumOptions(parameter).length}
    <Select
      label={String(parameter.label ?? key)}
      name={key}
      value={String(values[key] ?? initialValue(parameter) ?? "")}
      options={enumOptions(parameter)}
      placeholder="Select value"
      onchange={(value: string) => setValue(key, value)}
    />
  {:else if type === "number" || type === "integer"}
    <Input
      label={String(parameter.label ?? key)}
      name={key}
      type="number"
      value={String(values[key] ?? "")}
      oninput={(event: Event) => {
        const value = (event.target as HTMLInputElement).value;
        setValue(key, value === "" ? "" : Number(value));
      }}
    />
  {:else if type === "bool" || type === "boolean"}
    <Select
      label={String(parameter.label ?? key)}
      name={key}
      value={values[key] ? "true" : "false"}
      options={[
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ]}
      onchange={(value: string) => setValue(key, value === "true")}
    />
  {:else}
    <Input
      label={String(parameter.label ?? key)}
      name={key}
      value={String(values[key] ?? "")}
      oninput={(event: Event) => setValue(key, (event.target as HTMLInputElement).value)}
    />
  {/if}
  <p class="field-meta">
    {String(parameter.required ? "Required" : "Optional")} / {type}
  </p>
{/snippet}

<div class="renderer" data-testid={`action-form-renderer-${mode}`} data-layout={resolvedLayout.key}>
  <div class="renderer-header">
    <div>
      <p class="eyebrow">{mode === "public-submit" ? "Public portal" : "Placement preview"}</p>
      <h3>{String(renderedAction?.label ?? renderedAction?.key ?? "Select an action")}</h3>
    </div>
    <Badge variant={renderedPlacement ? "info" : "neutral"}>
      {String(renderedPlacement?.surface ?? "No placement")}
    </Badge>
  </div>

  {#if !renderedAction}
    <p class="muted">Select an action to preview its placement-aware form contract.</p>
  {:else if orderedParameters.length === 0}
    <p class="muted">This action has no fields yet.</p>
  {:else}
    {@const Layout = resolvedLayout.component}
    <form class="rendered-form">
      <Layout {sections} field={fieldRow} />
    </form>
  {/if}

  {#if mode === "admin-preview"}
    <div class="admin-preview">
      <section class="preview-block">
        <h4>Hidden and defaulted fields</h4>
        {#if hiddenOrDefaultedParameters.length}
          <div class="tag-grid">
            {#each hiddenOrDefaultedParameters as parameter (parameterKey(parameter))}
              <Tag>
                {String(parameter.key)}
                {#if !isVisible(parameter)}
                  / hidden{/if}
                {#if parameter.default_value !== null && parameter.default_value !== undefined}
                  / defaulted
                {/if}
              </Tag>
            {/each}
          </div>
        {:else}
          <p class="muted">No hidden or defaulted fields declared.</p>
        {/if}
      </section>

      <section class="preview-block">
        <h4>Placement consequences</h4>
        <dl class="consequence-list">
          {#each placementConsequenceRows() as row}
            <div>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          {/each}
        </dl>
      </section>

      <section class="preview-block">
        <h4>Validation used by server</h4>
        {#if criteriaSummary.length}
          <div class="tag-grid">
            {#each criteriaSummary as criterion (String(criterion.id))}
              <Tag>{String(criterion.criteria_type)} / {String(criterion.key)}</Tag>
            {/each}
          </div>
        {:else}
          <p class="muted">No submission criteria configured yet.</p>
        {/if}
      </section>

      <section class="preview-block">
        <h4>Normalized payload</h4>
        <CodeBlock code={payloadJson} language="json" lineNumbers={false} copyable={false} />
      </section>
    </div>
  {/if}
</div>

<style>
  .renderer {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .renderer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .renderer-header h3 {
    margin: 0;
  }

  .eyebrow {
    margin: 0 0 var(--space-xs);
    color: var(--color-text-muted);
    font-size: var(--type-caption-size);
    /* #63 typography — uppercase reserved for code tokens. */
  }

  .muted,
  .field-meta {
    color: var(--color-text-muted);
  }

  .rendered-form,
  .admin-preview,
  .preview-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .preview-block h4 {
    margin: 0;
    font-size: var(--type-body-size);
  }

  .field-meta {
    margin: 0;
    font-size: var(--type-caption-size);
  }

  .preview-block {
    padding-top: var(--space-md);
    border-top: var(--elevation-border);
  }

  .tag-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .consequence-list {
    display: grid;
    gap: var(--space-sm);
    margin: 0;
  }

  .consequence-list div {
    display: grid;
    grid-template-columns: minmax(calc(var(--space-4xl) * 2), 0.4fr) minmax(0, 1fr);
    gap: var(--space-md);
  }

  .consequence-list dt {
    color: var(--color-text-muted);
  }

  .consequence-list dd {
    margin: 0;
    word-break: break-word;
  }
</style>
