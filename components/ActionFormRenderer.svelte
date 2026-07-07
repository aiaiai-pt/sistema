<script lang="ts">
  // DS-internal sibling imports (this component lives in the DS now, #73 73f —
  // converged so admin preview AND portal runtime mount the SAME renderer).
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import Alert from "./Alert.svelte";
  import CodeBlock from "./CodeBlock.svelte";
  import Combobox from "./Combobox.svelte";
  import DatePicker from "./DatePicker.svelte";
  import DateTimePicker from "./DateTimePicker.svelte";
  import Input from "./Input.svelte";
  import JsonEditor from "./JsonEditor.svelte";
  import Textarea from "./Textarea.svelte";
  import Toggle from "./Toggle.svelte";
  import MapPicker from "./MapPicker.svelte";
  import MoneyInput from "./MoneyInput.svelte";
  import MultiSelectCombobox from "./MultiSelectCombobox.svelte";
  import FileUpload from "./FileUpload.svelte";
  import FileUploadItem from "./FileUploadItem.svelte";
  import Select from "./Select.svelte";
  import Tag from "./Tag.svelte";
  import type { Snippet } from "svelte";
  import {
    buildActionPayload,
    isPayloadIncluded,
    isReadonlyParam,
    placementConsequenceRows as buildPlacementConsequenceRows,
    type RendererMode,
  } from "./action-form-renderer-payload";
  // S7 (#27): the renderer dispatches arrangement to one of three
  // registered layout components. The key is read from
  // `target_config.layout_key` and validated through `resolveLayout`,
  // so an operator-supplied string never reaches the DOM verbatim
  // (RH#11 / R-SEC-07 / TH-08).
  import { resolveLayout, type LayoutSection } from "./action-form-renderer-layouts";
  // #634 S4 — live section show/hide from the contract's `visible_when`
  // predicate (pure client evaluation over the value bag; the server owns
  // enforcement).
  import { sectionVisible } from "./action-form-visibility";
  // #34 (atelier#669 V1, D6) — cardinality-aware relationship picking over the
  // two rel param shapes (form-surface.v1 `relationship` summaries and
  // derived-action `object_reference` + `multiple` params).
  import {
    isMultiRelationship,
    isRelationshipParam,
    normalizeRelIds,
    relationshipTypeCode,
  } from "./action-form-renderer-relationships";
  // #36/#37 — widget-first dispatch (field summaries carry render intent in
  // `widget`; derived-action params in `ui_schema.widget`; legacy params fall
  // back to their `type`) + the date-only wire serialization.
  import {
    dateOnlyToDate,
    dateToDateOnly,
    geoJsonPointToLonLat,
    lonLatToGeoJsonPoint,
    storedFileDescriptor,
    widgetKind,
  } from "./action-form-renderer-widgets";

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
    sections?: Array<{
      key?: string;
      label?: string;
      order?: number | null;
      columns?: number | null;
      /** Read defensively (hosts carry concrete precondition types). */
      visible_when?: unknown;
      parameters?: Entity[];
    }>;
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
    /** Lookup for `object_reference`-typed parameters (#629 PR1b): receives the
     *  parameter's `object_type` (the entity type code), the operator's query,
     *  and the parameter's optional `object_filter`; returns picker items. The
     *  renderer owns the Combobox UI + value plumbing; the CONSUMER owns
     *  transport/auth/tenancy (the uploadFile seam pattern — the DS stays
     *  presentation-only). Omitted → object_reference params render disabled. */
    searchEntities?: (
      typeCode: string,
      query: string,
      filter?: Record<string, string>,
    ) => Promise<SelectOption[]>;
    /** Edit-time label hydration for relationship params (#34): receives the
     *  target entity type code and the currently-linked ids, returns
     *  `{value, label}` items so the picker renders labels, never raw ids.
     *  Same philosophy as searchEntities — the CONSUMER owns transport/auth;
     *  omitted → the picker falls back to showing the ids. Best-effort: a
     *  failed hydration never blocks the form. */
    hydrateEntities?: (
      typeCode: string,
      ids: string[],
    ) => Promise<SelectOption[]>;
    /** #41 — per-field server-error binding: `{param_key: message}` rendered
     *  as each field's inline error (the V2a adapter re-binds proxy 4xx field
     *  errors here). Display-only — the HOST owns when errors set and clear. */
    fieldErrors?: Record<string, string>;
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
    /** Inline error rendered by the geo MapPicker(s) (e.g. the consumer's
     *  out-of-bounds copy) — forwarded as MapPicker's `error`. */
    geoError?: string;
    /** Service-flow wizard (#105 P6): render ONLY the section whose
     *  name (its label, falling back to its key) matches — one screen per
     *  step. The value bag still spans ALL parameters (so answers persist
     *  across steps and the final payload is complete); only the DISPLAY is
     *  scoped. Null (default) renders every section, byte-identical to today. */
    activeSectionKey?: string | null;
    /** Service-flow wizard (#105 P6): suppress the renderer's own submit
     *  button / captcha / error — the wizard shell owns the nav and posts the
     *  payload once at the end. Default false (the standalone form keeps its
     *  button). */
    hideSubmit?: boolean;
    /** Service-flow wizard (#105 P6): fires with the freshly built payload
     *  whenever a value or attachment changes, so the wizard always holds the
     *  complete payload (incl. attachment_keys) to review and submit. Read-only
     *  consumers omit it. */
    onchange?: (payload: Record<string, unknown>) => void;
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
    searchEntities = undefined,
    hydrateEntities = undefined,
    fieldErrors = undefined,
    captcha = undefined,
    submitLabel = "Submit",
    boundary = undefined,
    layers = [],
    onoutofbounds = undefined,
    geoError = undefined,
    activeSectionKey = null,
    hideSubmit = false,
    onchange = undefined,
  }: Props = $props();

  let values = $state<Record<string, unknown>>({});
  // `file` params live OUTSIDE values — their keys ride the payload's
  // top-level attachment_keys, never raw_values (the form schema doesn't
  // know them; validation would reject strays).
  let fileUploads = $state<Record<string, Array<{ key: string; name: string }>>>({});
  let fileBusy = $state<Record<string, boolean>>({});
  let fileError = $state<Record<string, string>>({});
  // Platform caps mirror the public upload surface. The per-action tier
  // (allowed content types + max bytes) is DATA on the action's
  // `submission_contract.attachments`; the render projects it onto the `file`
  // parameter (`accept` / `max_bytes`). When a parameter carries no tier we
  // fall back to the conservative web-image defaults (3 × 5MB, image types).
  const FILE_MAX_COUNT = 3;
  const DEFAULT_FILE_MAX_BYTES = 5 * 1024 * 1024;
  const DEFAULT_FILE_ACCEPT = "image/jpeg,image/png,image/webp";
  function fileAccept(parameter: Entity): string {
    const accept = (parameter as Record<string, unknown>).accept;
    return typeof accept === "string" && accept.trim() ? accept : DEFAULT_FILE_ACCEPT;
  }
  function fileMaxBytes(parameter: Entity): number {
    const max = Number((parameter as Record<string, unknown>).max_bytes);
    return Number.isFinite(max) && max > 0 ? max : DEFAULT_FILE_MAX_BYTES;
  }

  // Submit state (apply seam). Only meaningful in submit modes with an onApply.
  let submitting = $state(false);
  let submitError = $state<string | null>(null);
  let submitted = $state(false);

  // A form is a SUBMIT form (button shown) only in the submit modes AND when the
  // consumer wired an apply. Preview modes (admin-preview/adapter-preview) and a
  // missing onApply stay read-only — the button never renders.
  const isSubmitMode = $derived(mode === "public-submit" || mode === "admin-execute");
  // The wizard (#105 P6) suppresses the internal button via hideSubmit — it
  // owns the nav and posts once at the end.
  const showSubmit = $derived(isSubmitMode && onApply !== undefined && !hideSubmit);

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
  // #634 S4 — LIVE conditional sections: a section whose `visible_when`
  // predicate fails against the current value bag is hidden (and re-appears
  // the moment the driving value changes). Sections without a predicate —
  // including every legacy fold section — always pass, so this is inert
  // until a sheet declares `visible_when`. The value bag still spans ALL
  // parameters (hidden sections keep their answers).
  const liveSections = $derived(
    sections.filter((section) => sectionVisible(section, values)),
  );
  // Wizard pagination (#105 P6): when a section is active, render only it. The
  // value bag is unaffected — every parameter is still seeded and submitted.
  const displaySections = $derived(
    activeSectionKey == null
      ? liveSections
      : liveSections.filter((section) => section.name === activeSectionKey),
  );
  const payload = $derived(buildPayload());
  const payloadJson = $derived(JSON.stringify(payload, null, 2));

  // Wizard (#105 P6): surface the live payload so the shell can review + submit
  // it. Reading `payload` registers the dependency; the effect re-runs whenever
  // a value or attachment changes.
  $effect(() => {
    onchange?.(payload);
  });

  // Client-side submit gate (layer 1 — see the ADL): every required, visible
  // parameter must have a non-empty value. Server-side submission criteria are
  // enforced by the BFF on submit and surfaced via `submitError`.
  function isEmpty(value: unknown): boolean {
    // #34 — an empty ID list (required m2m with zero picks) must block submit.
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === "";
  }
  // #634 S4 — the gate counts only parameters whose section is LIVE-visible:
  // a required field inside a `visible_when`-hidden section must not block
  // submit (it is unreachable). In the legacy fold path this flattens back
  // to exactly `visibleParameters`.
  const gateParameters = $derived(liveSections.flatMap((section) => section.items));
  const canSubmit = $derived(
    // #38 — any invalid json draft blocks submit, required or not.
    !Object.values(jsonInvalid).some((message) => message !== null) &&
      gateParameters
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
    // Mirrors the BFF `_parameter_section` precedence (action_schema.py):
    // ui_schema.section_label → ui_schema.section → visibility.section_label
    // → visibility.section → "Details". `||` (not `??`) to match Python `or`
    // falsy-chaining — an empty string falls through to the next rung.
    const uiSchema = parameter.ui_schema;
    if (uiSchema && typeof uiSchema === "object" && !Array.isArray(uiSchema)) {
      const row = uiSchema as Record<string, unknown>;
      const section = row.section_label || row.section;
      if (section) return String(section);
    }
    const visibility = parameter.visibility;
    if (visibility && typeof visibility === "object" && !Array.isArray(visibility)) {
      const row = visibility as Record<string, unknown>;
      const section = row.section_label || row.section;
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

  function schemaSectionsFromContract(): LayoutSection[] | null {
    if (!Array.isArray(schema?.sections)) return null;
    const next = schema.sections
      .map((section, index) => {
        const items = Array.isArray(section.parameters)
          ? section.parameters
              .filter((parameter) => parameter.is_active !== false && isVisible(parameter))
              .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
          : [];
        // #634 S3/S4 — carry the contract's presentation keys through to the
        // layouts: stable `key`, declared `columns`, the `visible_when`
        // predicate, and `order` (the server emits sections pre-sorted; the
        // sort below is a defensive mirror, stable via declaration index).
        return {
          name: String(section.label ?? section.key ?? "Details"),
          key: section.key ? String(section.key) : undefined,
          columns: Number(section.columns ?? 1),
          visibleWhen:
            section.visible_when && typeof section.visible_when === "object"
              ? (section.visible_when as Record<string, unknown>)
              : null,
          order: Number(section.order ?? 0),
          index,
          items,
        };
      })
      .filter((section) => section.items.length)
      .sort((a, b) => a.order - b.order || a.index - b.index);
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
    // #34 — a multi-value rel param holds an ID LIST in the bag (the m2m wire
    // shape), normalized even when the default arrives as a scalar.
    if (isRelationshipParam(parameter) && isMultiRelationship(parameter)) {
      return normalizeRelIds(parameter.default_value);
    }
    if (parameter.default_value !== null && parameter.default_value !== undefined) {
      return parameter.default_value;
    }
    const type = parameterType(parameter);
    if (type === "bool" || type === "boolean") return false;
    if (type === "number" || type === "integer") return "";
    if (type === "enum" || type === "select") return enumOptions(parameter)[0]?.value ?? "";
    // #34 — an unset single `relationship` summary is null on the wire
    // (string|null contract). Legacy `object_reference` keeps its "" seed.
    if (type === "relationship") return null;
    // #38 — an unset json field is null (empty editor), never the ""
    // string (which would render as a literal '""' draft).
    if (type === "json" || widgetKind(parameter) === "json") return null;
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
      // #41 / D3 — payload include|exclude: excluded params render but never
      // reach the wire (readonly defaults OUT on the form-surface.v1 lane;
      // `payload: "include"` declares prefill-and-send).
      if (!isPayloadIncluded(parameter)) continue;
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

  // #40 — `replace` (a stored current exists on the edit form): SINGLE slot,
  // a new upload supersedes the pending one; the stored file itself is only
  // superseded host-side when the new key rides the payload. Default
  // (append) keeps the legacy up-to-3 behavior byte-identical.
  async function handleFiles(key: string, files: File[], replace = false) {
    if (!uploadFile) return;
    fileError = { ...fileError, [key]: "" };
    const existing = replace ? [] : (fileUploads[key] ?? []);
    const room = replace ? 1 : FILE_MAX_COUNT - existing.length;
    const batch = files.slice(0, room);
    if (!replace && files.length > room) {
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
            [key]: replace
              ? [{ key: result.key, name: file.name }]
              : [...(fileUploads[key] ?? []), { key: result.key, name: file.name }],
          };
        } else {
          fileError = { ...fileError, [key]: result.error };
        }
      }
    } finally {
      fileBusy = { ...fileBusy, [key]: false };
    }
  }

  // `object_reference` picker state (#629 PR1b): per-parameter items + loading
  // for the lazy-search Combobox. A per-key generation counter drops stale
  // responses (the host's validateGen pattern) so a slow early query can't
  // clobber a fast later one.
  let referenceItems = $state<Record<string, SelectOption[]>>({});
  let referenceLoading = $state<Record<string, boolean>>({});
  const referenceSearchGen: Record<string, number> = {};

  function objectFilter(parameter: Entity): Record<string, string> | undefined {
    const filter = parameter.object_filter;
    return filter && typeof filter === "object" && !Array.isArray(filter)
      ? (filter as Record<string, string>)
      : undefined;
  }

  async function handleReferenceSearch(parameter: Entity, query: string) {
    if (!searchEntities) return;
    const key = parameterKey(parameter);
    const gen = (referenceSearchGen[key] = (referenceSearchGen[key] ?? 0) + 1);
    referenceLoading = { ...referenceLoading, [key]: true };
    try {
      // #34 — the type code comes from the relationship meta when present
      // (form-surface lane), else the param's own object_type (action lane).
      const items = await searchEntities(
        relationshipTypeCode(parameter),
        query,
        objectFilter(parameter),
      );
      if (referenceSearchGen[key] !== gen) return;
      referenceItems = { ...referenceItems, [key]: Array.isArray(items) ? items : [] };
    } catch {
      if (referenceSearchGen[key] === gen) referenceItems = { ...referenceItems, [key]: [] };
    } finally {
      if (referenceSearchGen[key] === gen)
        referenceLoading = { ...referenceLoading, [key]: false };
    }
  }

  // #34 — relationship label bookkeeping. `relLabels` maps, per param key, a
  // linked entity id → its display label, fed by (a) edit-time hydration
  // through the `hydrateEntities` seam and (b) pick-time capture from the
  // search results — so a chip / selected value never degrades to a raw id
  // when a later search replaces the Combobox items. (The m2m search-to-add
  // draft is MultiSelectCombobox-internal — the renderer never sees it.)
  let relLabels = $state<Record<string, Record<string, string>>>({});
  const relHydrateRequested: Record<string, Set<string>> = {};

  // #38 — per-param json parse invalidity (JsonEditor oninvalid seam). A
  // non-null message anywhere blocks submit: invalid text must never reach
  // the wire OR be silently dropped by submitting around it.
  let jsonInvalid = $state<Record<string, string | null>>({});

  $effect(() => {
    if (!hydrateEntities) return;
    for (const parameter of orderedParameters) {
      if (!isRelationshipParam(parameter)) continue;
      const key = parameterKey(parameter);
      if (!key) continue;
      const ids = normalizeRelIds(values[key] ?? initialValue(parameter));
      const known = relLabels[key] ?? {};
      const requested = (relHydrateRequested[key] ??= new Set());
      const missing = ids.filter((id) => !(id in known) && !requested.has(id));
      if (!missing.length) continue;
      for (const id of missing) requested.add(id);
      hydrateEntities(relationshipTypeCode(parameter), missing)
        .then((items) => {
          if (!Array.isArray(items) || !items.length) return;
          const next = { ...(relLabels[key] ?? {}) };
          for (const item of items) {
            const value = String(item.value ?? "");
            if (value) next[value] = String(item.label ?? value);
          }
          relLabels = { ...relLabels, [key]: next };
        })
        .catch(() => {
          // Best-effort: the picker falls back to raw ids.
        });
    }
  });

  function relLabel(key: string, id: string): string {
    return relLabels[key]?.[id] ?? id;
  }

  function captureRelLabel(key: string, id: string) {
    const item = (referenceItems[key] ?? []).find((entry) => entry.value === id);
    if (!item) return;
    relLabels = {
      ...relLabels,
      [key]: { ...(relLabels[key] ?? {}), [id]: item.label },
    };
  }

  /** Combobox items for a rel param. Multi: the raw search results —
   *  MultiSelectCombobox itself excludes already-picked ids. Single: prepends
   *  the current selection when a later search dropped it (label
   *  persistence). */
  function relComboItems(parameter: Entity): SelectOption[] {
    const key = parameterKey(parameter);
    const searched = referenceItems[key] ?? [];
    if (isMultiRelationship(parameter)) return searched;
    const current = typeof values[key] === "string" ? String(values[key]) : "";
    if (!current || searched.some((item) => item.value === current)) {
      return searched;
    }
    return [{ value: current, label: relLabel(key, current) }, ...searched];
  }

  function pickSingleRel(key: string, id: string) {
    captureRelLabel(key, id);
    setValue(key, id);
  }

  function addRelId(key: string, id: string) {
    if (!id) return;
    const current = normalizeRelIds(values[key]);
    if (current.includes(id)) return;
    captureRelLabel(key, id);
    setValue(key, [...current, id]);
  }

  function removeRelId(key: string, id: string) {
    setValue(
      key,
      normalizeRelIds(values[key]).filter((value) => value !== id),
    );
  }

  // `datetime` params keep an ISO 8601 STRING in the value bag (the platform's
  // datetime wire vocabulary — `$now` resolves to one) so the payload stays
  // plain JSON; the DateTimePicker speaks Date on its prop edge.
  function datetimeValue(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === "string" && value) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
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

  /** #629 follow-up — the same keys ATTRIBUTED to the param each was
   *  uploaded against, so consumers never have to guess positionally. */
  function attachmentsByParam(): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    for (const [paramKey, list] of Object.entries(fileUploads)) {
      if (list.length) out[paramKey] = list.map((f) => f.key);
    }
    return out;
  }

  function buildPayload(): Record<string, unknown> {
    return buildActionPayload({
      action: renderedAction ?? null,
      placement: renderedPlacement ?? null,
      targetConfig: targetConfig(),
      sourceSchema: sourceSchema(),
      rawValues: visibleValueBag(),
      attachmentKeys: allAttachmentKeys(),
      attachmentsByParam: attachmentsByParam(),
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
  {@const kind = widgetKind(parameter)}
  <!-- A11y (#244 C7 / Selo item 4): required fields are marked
       `aria-required` on the control itself, so a screen reader announces
       "required" on the field — not just the disconnected visual hint below.
       Passed through the DS field components' `{...rest}` onto the input. -->
  {@const ariaRequired = parameter.required ? "true" : undefined}
  <!-- #252 — a parameter with `editable: false` (visibility.editable === false)
       renders READ-ONLY: its value (e.g. a logged-in citizen's prefilled
       identity — name/email) is shown but not editable. On the ACTION lane the
       value still rides the payload; on the form-surface.v1 lane
       (`visibility: "readonly"` string) it defaults OFF the wire per D3 —
       see isPayloadIncluded. -->
  {@const editable = !isReadonlyParam(parameter)}
  <!-- #41 — first-class field states: `disabled` and `loading` are host/
       contract-declared inertness (loading = options/context not resolved
       yet); `fieldError` is the per-field server-error binding. -->
  {@const fieldDisabled = parameter.disabled === true || parameter.loading === true}
  {@const fieldError = fieldErrors?.[key]}
  {#if kind === "currency"}
    <!-- #35 — money: the bag carries the RAW number ("" when empty — the
         number-field empty sentinel); formatting is display-only. -->
    <MoneyInput
      label={String(parameter.label ?? key)}
      name={key}
      value={typeof values[key] === "number" ? (values[key] as number) : null}
      readonly={!editable}
      disabled={fieldDisabled}
      error={fieldError}
      onchange={(amount: number | null) => setValue(key, amount === null ? "" : amount)}
      aria-required={ariaRequired}
    />
  {:else if kind === "textarea"}
    <!-- #36 — long text. Full-width-only (FULL_WIDTH_WIDGET_KINDS clamp). -->
    <Textarea
      label={String(parameter.label ?? key)}
      name={key}
      rows={4}
      value={String(values[key] ?? initialValue(parameter) ?? "")}
      readonly={!editable}
      disabled={fieldDisabled}
      error={fieldError}
      oninput={(event: Event) =>
        setValue(key, (event.target as HTMLTextAreaElement).value)}
      aria-required={ariaRequired}
    />
  {:else if kind === "toggle"}
    <!-- #36 — boolean as the DS switch; the bag carries a BOOLEAN, never a
         "yes"/"no" string. A bare bool param WITHOUT the widget keeps the
         legacy Yes/No select (byte-identical action lane). -->
    <Toggle
      label={String(parameter.label ?? key)}
      checked={values[key] === true}
      disabled={fieldDisabled || !editable}
      onchange={(checked: boolean) => setValue(key, checked)}
      aria-required={ariaRequired}
    />
  {:else if kind === "slug"}
    <!-- #36 — slug input-type refinement: machine-name typing affordances;
         the value stays whatever the operator types (validation is the
         server's). -->
    <Input
      label={String(parameter.label ?? key)}
      name={key}
      value={String(values[key] ?? initialValue(parameter) ?? "")}
      readonly={!editable}
      disabled={fieldDisabled}
      error={fieldError}
      spellcheck="false"
      autocapitalize="none"
      autocorrect="off"
      oninput={(event: Event) => setValue(key, (event.target as HTMLInputElement).value)}
      aria-required={ariaRequired}
    />
  {:else if kind === "json"}
    <!-- #38 — json editor with the invalid-state contract: invalid text
         surfaces its parse error, emits nothing, and blocks submit via the
         jsonInvalid gate. -->
    <JsonEditor
      label={String(parameter.label ?? key)}
      value={values[key] ?? initialValue(parameter)}
      readonly={!editable}
      disabled={fieldDisabled}
      error={fieldError}
      onchange={(value: unknown) => setValue(key, value)}
      oninvalid={(message: string | null) =>
        (jsonInvalid = { ...jsonInvalid, [key]: message })}
    />
  {:else if kind === "date"}
    <!-- #37 — date-only picker; the bag carries the YYYY-MM-DD wire string
         (LOCAL calendar parts — no toISOString, no DST off-by-one). -->
    <DatePicker
      label={String(parameter.label ?? key)}
      value={dateOnlyToDate(values[key])}
      readonly={!editable}
      disabled={fieldDisabled}
      error={fieldError}
      onchange={(date: Date | null) => setValue(key, date ? dateToDateOnly(date) : "")}
    />
  {:else if type === "enum" || type === "select" || enumOptions(parameter).length}
    {@const options = enumOptions(parameter)}
    <!-- #41 — empty state: an option-driven field with ZERO resolved options
         is inert with an explicit hint, never a dead control. -->
    <Select
      label={String(parameter.label ?? key)}
      name={key}
      value={String(values[key] ?? initialValue(parameter) ?? "")}
      {options}
      placeholder="Select value"
      disabled={fieldDisabled || !editable || options.length === 0}
      error={fieldError}
      help={parameter.loading === true
        ? "Loading options..."
        : options.length === 0
          ? "No options available"
          : undefined}
      onchange={(value: string) => setValue(key, value)}
      aria-required={ariaRequired}
    />
  {:else if type === "number" || type === "integer"}
    <Input
      label={String(parameter.label ?? key)}
      name={key}
      type="number"
      value={String(values[key] ?? "")}
      readonly={!editable}
      disabled={fieldDisabled}
      error={fieldError}
      oninput={(event: Event) => {
        const value = (event.target as HTMLInputElement).value;
        setValue(key, value === "" ? "" : Number(value));
      }}
      aria-required={ariaRequired}
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
      disabled={fieldDisabled || !editable}
      error={fieldError}
      onchange={(value: string) => setValue(key, value === "true")}
      aria-required={ariaRequired}
    />
  {:else if type === "datetime"}
    <!-- `datetime` parameter (#629 PR1b): the DS date+time picker. The value
         bag carries an ISO 8601 string (see datetimeValue). `datetime` is the
         platform's one wire token today (sheets + ActionParam docs). -->
    <DateTimePicker
      label={String(parameter.label ?? key)}
      value={datetimeValue(values[key])}
      readonly={!editable}
      disabled={fieldDisabled}
      error={fieldError}
      onchange={(date: Date) => setValue(key, date.toISOString())}
    />
  {:else if isRelationshipParam(parameter)}
    <!-- Relationship / `object_reference` picking, cardinality-aware (#34,
         atelier#669 D6). Covers the form-surface.v1 `relationship` summary
         AND the derived-action `object_reference` (+ `multiple`) param.
         `object_filter` rides the injected searchEntities seam; no seam →
         disabled (the file-param convention for a missing transport). -->
    {#if isMultiRelationship(parameter)}
      <!-- many_to_many: the DS MultiSelectCombobox widget (chips +
           search-to-add). The renderer contributes only SEMANTICS: the value
           bag carries the ID LIST, labels come from hydration/pick capture —
           a single-pick replace of an m2m value is impossible by
           construction (the widget never holds the selection). -->
      <MultiSelectCombobox
        data-testid="afr-rel-multi"
        label={String(parameter.label ?? key)}
        required={parameter.required === true}
        items={relComboItems(parameter)}
        selected={normalizeRelIds(values[key]).map((id) => ({
          value: id,
          label: relLabel(key, id),
        }))}
        placeholder={relationshipTypeCode(parameter)
          ? `Search ${relationshipTypeCode(parameter)}...`
          : "Search..."}
        disabled={!searchEntities || !editable || fieldDisabled}
        loading={(referenceLoading[key] ?? false) || parameter.loading === true}
        error={fieldError}
        onsearch={(query: string) => handleReferenceSearch(parameter, query)}
        onadd={(value: string) => addRelId(key, value)}
        onremove={(value: string) => removeRelId(key, value)}
      />
    {:else}
      <Combobox
        label={String(parameter.label ?? key)}
        items={relComboItems(parameter)}
        value={String(values[key] ?? "")}
        placeholder={relationshipTypeCode(parameter)
          ? `Search ${relationshipTypeCode(parameter)}...`
          : "Search..."}
        disabled={!searchEntities || !editable || fieldDisabled}
        loading={(referenceLoading[key] ?? false) || parameter.loading === true}
        error={fieldError}
        onsearch={(query: string) => handleReferenceSearch(parameter, query)}
        onchange={(value: string) => pickSingleRel(key, value)}
      />
    {/if}
  {:else if type === "file"}
    <!-- `file` parameter (#75 M5 slice 4b): upload-as-you-attach. The keys
         ride payload.attachment_keys; raw_values never sees this param. -->
    <!-- A11y: the file param is a labelled group (the FileUpload's own input
         can't take a `for`/label from here), so SR users get the field name +
         required state when they enter it. -->
    {@const storedFile = storedFileDescriptor(parameter.default_value)}
    {@const replaceMode = storedFile !== null}
    <div class="afr-file-param" role="group" aria-labelledby={`${key}-file-label`}>
      <span id={`${key}-file-label`} class="afr-file-label"
        >{String(parameter.label ?? key)}{parameter.required
          ? " (required)"
          : ""}</span
      >
      <!-- #40 — REPLACE semantics: the stored current shows until a pending
           replacement exists; untouched emits NO attachment key (the host
           keeps the stored file); removing the pending replacement restores
           untouched. -->
      {#if replaceMode && storedFile && !(fileUploads[key] ?? []).length}
        <div class="afr-file-current" data-testid="afr-file-current">
          {#if storedFile.url}
            <a
              class="afr-file-current-name"
              href={storedFile.url}
              target="_blank"
              rel="noopener noreferrer">{storedFile.name}</a
            >
          {:else}
            <span class="afr-file-current-name">{storedFile.name}</span>
          {/if}
          <span class="afr-file-current-hint">Current file — uploading replaces it</span>
        </div>
      {/if}
      {#each fileUploads[key] ?? [] as f (f.key)}
        <FileUploadItem
          name={f.name}
          onremove={() => removeFile(key, f.key)}
        />
      {/each}
      {#if replaceMode || (fileUploads[key] ?? []).length < FILE_MAX_COUNT}
        <FileUpload
          accept={fileAccept(parameter)}
          maxSize={fileMaxBytes(parameter)}
          multiple={!replaceMode}
          disabled={!uploadFile || fileBusy[key]}
          onfiles={(files: File[]) => handleFiles(key, files, replaceMode)}
          onreject={() => {
            fileError = {
              ...fileError,
              [key]: `File type not allowed or too large (max ${Math.round(fileMaxBytes(parameter) / (1024 * 1024))}MB).`,
            };
          }}
        />
      {/if}
      {#if fileError[key]}
        <p class="afr-file-error" role="alert">{fileError[key]}</p>
      {:else if fieldError}
        <p class="afr-file-error" role="alert">{fieldError}</p>
      {/if}
    </div>
  {:else if kind === "geometry"}
    <!-- #39 — the form-surface.v1 geometry widget: the value bag carries a
         GeoJSON Point (the CRUD wire shape); the MapPicker keeps speaking
         [lon, lat] at its prop edge; the pure adapters translate. A
         non-Point value fails LOUD on the field instead of rendering a
         silently-empty map over real data. The legacy `geo` param (bare
         tuple) is the branch below, untouched. -->
    {@const hydrated = geoJsonPointToLonLat(values[key])}
    <MapPicker
      mode="point"
      height="20rem"
      {boundary}
      {layers}
      {onoutofbounds}
      error={fieldError ?? hydrated.error ?? geoError}
      label={String(parameter.label ?? key)}
      value={hydrated.coords ?? undefined}
      onchange={(coords: [number, number]) => setValue(key, lonLatToGeoJsonPoint(coords))}
    />
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
      error={fieldError ?? geoError}
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
      value={String(values[key] ?? initialValue(parameter) ?? "")}
      readonly={!editable}
      disabled={fieldDisabled}
      error={fieldError}
      oninput={(event: Event) => setValue(key, (event.target as HTMLInputElement).value)}
      aria-required={ariaRequired}
    />
  {/if}
  {#if isSubmitMode}
    <!-- EXECUTE surfaces (citizen public-submit AND staff admin-execute,
         #629 follow-up): just a quiet required hint — the "Required / type"
         line is operator DEBUG chrome, preview modes only. -->
    {#if parameter.required}<p class="field-meta">Required</p>{/if}
  {:else}
    <p class="field-meta">
      {String(parameter.required ? "Required" : "Optional")} / {type}
    </p>
  {/if}
{/snippet}

<div class="renderer" data-testid={`action-form-renderer-${mode}`} data-layout={resolvedLayout.key}>
  <!-- Wizard pagination (#105 P6): the ServiceFlow shell owns the step
       heading, so the renderer's own action-title header is suppressed when a
       section is active to avoid a duplicate heading per step.
       admin-execute (#629 follow-up): the HOST container (drawer/modal) owns
       the action heading — the renderer's header would duplicate it, and the
       "Placement preview" eyebrow + placement Badge are authoring chrome that
       has no meaning on an execute surface. -->
  {#if activeSectionKey == null && mode !== "admin-execute"}
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
  {/if}

  {#if !renderedAction}
    <p class="muted">Select an action to preview its placement-aware form contract.</p>
  {:else if orderedParameters.length === 0}
    <p class="muted">This action has no fields yet.</p>
  {:else}
    {@const Layout = resolvedLayout.component}
    <!-- A11y: name the form region so SR users land on a labelled form, not an
         anonymous group of inputs (Selo item 4 / WCAG 1.3.1). -->
    <form
      class="rendered-form"
      aria-label={String(
        renderedAction?.label ?? renderedAction?.key ?? "Form",
      )}
    >
      <Layout sections={displaySections} field={fieldRow} />
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
        <!-- A11y: a disabled submit gives no reason on its own. This polite
             status spells out the gate (and disappears when satisfied), so SR
             users know WHY they can't submit yet — paired with the per-field
             `aria-required` that marks which fields are needed. -->
        {#if !canSubmit && !submitting}
          <p class="submit-hint" role="status">
            Fill in all required fields to submit.
          </p>
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

  .submit-hint {
    color: var(--color-text-secondary);
    font-size: var(--type-body-sm-size);
    margin: 0;
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

  .afr-file-current {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
  }

  .afr-file-current-name {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    color: var(--color-text);
  }

  .afr-file-current-hint {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
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
