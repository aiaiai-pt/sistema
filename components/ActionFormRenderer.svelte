<script lang="ts">
  // DS-internal sibling imports (this component lives in the DS now, #73 73f —
  // converged so admin preview AND portal runtime mount the SAME renderer).
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import Alert from "./Alert.svelte";
  import CodeBlock from "./CodeBlock.svelte";
  import Input from "./Input.svelte";
  import MapPicker from "./MapPicker.svelte";
  import FileUpload from "./FileUpload.svelte";
  import FileUploadItem from "./FileUploadItem.svelte";
  import Select from "./Select.svelte";
  import Tag from "./Tag.svelte";
  import type { Snippet } from "svelte";
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

  /**
   * The `apply` seam (see dev_docs/adl/action-form-apply-seam.md). The renderer
   * owns the form + validation + submit button + state; the CONSUMER injects how
   * to actually send it. Foundry's `applyAction` model: every consumer converges
   * on the one action engine; only transport/auth/captcha differ. Receives the
   * normalized ActionPayload; resolves `{ ok }` (and may navigate on success).
   */
  type ApplyResult = { ok: boolean; status?: number; error?: string };

  interface Props {
    action: Entity | null;
    placement?: Entity | null;
    parameters?: Entity[];
    criteria?: Entity[];
    mode?: RendererMode;
    schema?: ActionSchema | null;
    /** Injected apply. Required for a working submit button; absent → no button
     *  (so admin-preview / adapter-preview stay read-only). */
    onApply?: (payload: Record<string, unknown>) => Promise<ApplyResult>;
    /** Transport for `file`-typed parameters (#75 M5 slice 4b): receives one
     *  validated File, returns its storage key. The renderer owns the UI +
     *  the attachment_keys payload contract; the CONSUMER owns transport/auth
     *  (FileUpload philosophy). Omitted → file params render disabled. */
    uploadFile?: (file: File) => Promise<{ key: string } | { error: string }>;
    /** Environment-specific captcha (e.g. Turnstile), rendered above the button
     *  in submit modes. */
    captcha?: Snippet;
    submitLabel?: string;
    /** Forwarded VERBATIM to every `geo` parameter's MapPicker (the renderer
     *  stays generic — boundary/overlay semantics live in the consumer):
     *  `boundary` draws the dashed tenant-boundary overlay and arms the
     *  out-of-bounds check; `layers` are ordered GeoJSON overlays (unbounded);
     *  `onoutofbounds(outside, coords)` fires on every point placement when a
     *  boundary is set — NON-blocking, the consumer owns surfacing/gating. */
    boundary?: unknown;
    layers?: unknown[];
    onoutofbounds?: (outside: boolean, coords: [number, number]) => void;
  }

  let {
    action,
    placement = null,
    parameters = [],
    criteria = [],
    mode = "admin-preview",
    schema = null,
    onApply = undefined,
    uploadFile = undefined,
    captcha = undefined,
    submitLabel = "Submit",
    boundary = undefined,
    layers = [],
    onoutofbounds = undefined,
  }: Props = $props();

  let values = $state<Record<string, unknown>>({});
  // `file` params live OUTSIDE values — their keys ride the payload's
  // top-level attachment_keys, never raw_values (the form schema doesn't
  // know them; validation would reject strays).
  let fileUploads = $state<Record<string, Array<{ key: string; name: string }>>>({});
  let fileBusy = $state<Record<string, boolean>>({});
  let fileError = $state<Record<string, string>>({});
  // Platform caps mirror the public upload surface (3 × 5MB, web image types).
  const FILE_MAX_COUNT = 3;
  const FILE_MAX_BYTES = 5 * 1024 * 1024;
  const FILE_ACCEPT = "image/jpeg,image/png,image/webp";

  // Submit state (apply seam). Only meaningful in submit modes with an onApply.
  let submitting = $state(false);
  let submitError = $state<string | null>(null);
  let submitted = $state(false);

  // A form is a SUBMIT form (button shown) only in the submit modes AND when the
  // consumer wired an apply. Preview modes (admin-preview/adapter-preview) and a
  // missing onApply stay read-only — the button never renders.
  const isSubmitMode = $derived(mode === "public-submit" || mode === "admin-execute");
  const showSubmit = $derived(isSubmitMode && onApply !== undefined);

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

  // Client-side submit gate (layer 1 — see the ADL): every required, visible
  // parameter must have a non-empty value. Server-side submission criteria are
  // enforced by the BFF on submit and surfaced via `submitError`.
  function isEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === "";
  }
  const canSubmit = $derived(
    visibleParameters
      .filter((parameter) => parameter.required)
      .every((parameter) =>
        String(parameter.type ?? "") === "file"
          ? (fileUploads[parameterKey(parameter)] ?? []).length > 0
          : !isEmpty(values[parameterKey(parameter)]),
      ),
  );

  async function handleSubmit(): Promise<void> {
    if (!onApply || submitting || !canSubmit) return;
    submitError = null;
    submitting = true;
    try {
      const result = await onApply(buildPayload());
      if (result.ok) {
        submitted = true; // a consumer that navigates (portal → tracker) supersedes this
      } else {
        submitError = result.error ?? "We couldn't submit your form. Please try again.";
      }
    } catch {
      submitError = "Something went wrong. Please try again.";
    } finally {
      submitting = false;
    }
  }
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

  async function handleFiles(key: string, files: File[]) {
    if (!uploadFile) return;
    fileError = { ...fileError, [key]: "" };
    const existing = fileUploads[key] ?? [];
    const room = FILE_MAX_COUNT - existing.length;
    const batch = files.slice(0, room);
    if (files.length > room) {
      fileError = { ...fileError, [key]: `Up to ${FILE_MAX_COUNT} files` };
    }
    if (batch.length === 0) return;
    fileBusy = { ...fileBusy, [key]: true };
    try {
      for (const file of batch) {
        const result = await uploadFile(file);
        if ("key" in result) {
          fileUploads = {
            ...fileUploads,
            [key]: [...(fileUploads[key] ?? []), { key: result.key, name: file.name }],
          };
        } else {
          fileError = { ...fileError, [key]: result.error };
        }
      }
    } finally {
      fileBusy = { ...fileBusy, [key]: false };
    }
  }

  function removeFile(key: string, storageKey: string) {
    fileUploads = {
      ...fileUploads,
      [key]: (fileUploads[key] ?? []).filter((f) => f.key !== storageKey),
    };
  }

  function allAttachmentKeys(): string[] {
    return Object.values(fileUploads).flatMap((list) => list.map((f) => f.key));
  }

  function buildPayload(): Record<string, unknown> {
    return buildActionPayload({
      action: renderedAction ?? null,
      placement: renderedPlacement ?? null,
      targetConfig: targetConfig(),
      sourceSchema: sourceSchema(),
      rawValues: visibleValueBag(),
      attachmentKeys: allAttachmentKeys(),
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
  {:else if type === "file"}
    <!-- `file` parameter (#75 M5 slice 4b): upload-as-you-attach. The keys
         ride payload.attachment_keys; raw_values never sees this param. -->
    <div class="afr-file-param">
      <span class="afr-file-label">{String(parameter.label ?? key)}</span>
      {#each fileUploads[key] ?? [] as f (f.key)}
        <FileUploadItem
          name={f.name}
          onremove={() => removeFile(key, f.key)}
        />
      {/each}
      {#if (fileUploads[key] ?? []).length < FILE_MAX_COUNT}
        <FileUpload
          accept={FILE_ACCEPT}
          maxSize={FILE_MAX_BYTES}
          multiple
          disabled={!uploadFile || fileBusy[key]}
          onfiles={(files: File[]) => handleFiles(key, files)}
          onreject={() => {
            fileError = { ...fileError, [key]: "JPEG, PNG or WebP up to 5MB" };
          }}
        />
      {/if}
      {#if fileError[key]}
        <p class="afr-file-error" role="alert">{fileError[key]}</p>
      {/if}
    </div>
  {:else if type === "geo"}
    <!-- A `geo` parameter renders the DS map-picker; its value is the
         [lon, lat] the BFF's GEO_PARSE binding transform turns into a Point.
         The renderer stays generic — geo is just another param type, the
         occurrence/location coupling lives entirely in the ontology binding.
         SIBLING-ADDRESS CONVENTION: when the form also declares a parameter
         keyed `address`, the picker's resolved address (search pick or
         reverse geocode) auto-fills it — tracking the pin; the citizen can
         still edit the field afterwards (a later pin overwrites). -->
    <MapPicker
      mode="point"
      height="20rem"
      {boundary}
      {layers}
      {onoutofbounds}
      label={String(parameter.label ?? key)}
      center={Array.isArray(parameter.default_value)
        ? (parameter.default_value as [number, number])
        : undefined}
      value={Array.isArray(values[key])
        ? (values[key] as [number, number])
        : undefined}
      onchange={(coords: [number, number]) => setValue(key, coords)}
      onaddress={(displayName: string) => {
        if (renderedParameters.some((p) => parameterKey(p) === "address")) {
          setValue("address", displayName);
        }
      }}
    />
  {:else}
    <Input
      label={String(parameter.label ?? key)}
      name={key}
      value={String(values[key] ?? "")}
      oninput={(event: Event) => setValue(key, (event.target as HTMLInputElement).value)}
    />
  {/if}
  {#if mode === "public-submit"}
    <!-- Citizen-facing: just a quiet required hint, no operator type debug. -->
    {#if parameter.required}<p class="field-meta">Required</p>{/if}
  {:else}
    <p class="field-meta">
      {String(parameter.required ? "Required" : "Optional")} / {type}
    </p>
  {/if}
{/snippet}

<div class="renderer" data-testid={`action-form-renderer-${mode}`} data-layout={resolvedLayout.key}>
  <div class="renderer-header">
    <div>
      <!-- The placement-preview eyebrow + surface badge are operator chrome —
           hidden in public-submit so a citizen sees a clean form title. -->
      {#if mode !== "public-submit"}
        <p class="eyebrow">Placement preview</p>
      {/if}
      <h3>{String(renderedAction?.label ?? renderedAction?.key ?? "Select an action")}</h3>
    </div>
    {#if mode !== "public-submit"}
      <Badge variant={renderedPlacement ? "info" : "neutral"}>
        {String(renderedPlacement?.surface ?? "No placement")}
      </Badge>
    {/if}
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

  <!-- Submit (apply seam) — only in submit modes with an injected onApply, so
       preview modes never render a button. Captcha snippet sits above it. -->
  {#if showSubmit && renderedAction && orderedParameters.length > 0}
    <div class="submit-area">
      {#if submitted}
        <Alert variant="success">Your submission was received.</Alert>
      {:else}
        {#if submitError}
          <Alert variant="error">{submitError}</Alert>
        {/if}
        {#if captcha}
          <div class="submit-captcha">{@render captcha()}</div>
        {/if}
        <Button
          variant="primary"
          loading={submitting}
          disabled={submitting || !canSubmit}
          onclick={handleSubmit}
        >
          {submitLabel}
        </Button>
      {/if}
    </div>
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
  .preview-block,
  .submit-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .submit-area {
    align-items: flex-start;
    gap: var(--space-lg);
  }

  .afr-file-param {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .afr-file-label {
    font-size: var(--input-label-size, var(--type-body-sm-size));
    color: var(--color-text-secondary);
  }

  .afr-file-error {
    margin: 0;
    font-size: var(--type-body-sm-size);
    color: var(--input-error-text);
  }

  .submit-captcha {
    min-height: var(--space-4xl);
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
