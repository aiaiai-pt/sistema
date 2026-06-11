/**
 * Builds the normalized action payload that ActionFormRenderer renders in
 * its `admin-preview` mode and that any consumer (admin runtime, public
 * portal, Open311 adapter, future apps) sees as the canonical shape.
 *
 * S1 (#27) — generic target shape; no domain-specific keys. The previous
 * `occurrence: { occurrence_type, organization_id }` block has been
 * replaced with `target: { model, scope, id }`. `target.scope` carries
 * everything from the placement's `target_config` minus the `model` and
 * `id` keys (which become first-class). The BFF
 * `_normalized_submission_preview` mirrors this contract.
 *
 * Pure function: takes resolved inputs (action, placement, target_config,
 * source_schema, raw_values, mode), returns the canonical payload. The
 * Svelte component owns the reactive plumbing; this module owns the shape.
 */
export type RendererMode = "admin-preview" | "admin-execute" | "public-submit" | "adapter-preview";

/**
 * Minimal action/placement references the payload builder reads. Callers may
 * pass a full ontology Entity; this narrower shape is what we actually rely
 * on, so test stubs don't need to populate Entity's `created_at`/`updated_at`.
 */
export interface ActionRef {
  id?: string | null;
  key?: string | null;
  status?: string | null;
  target_model?: string | null;
  [extra: string]: unknown;
}

export interface PlacementRef extends ActionRef {
  surface?: string | null;
}

export interface BuildArgs {
  action: ActionRef | null;
  placement: PlacementRef | null;
  /** Resolved from schema?.target ?? placement?.target_config. */
  targetConfig: Record<string, unknown>;
  /** Resolved from schema?.source ?? placement?.source_schema. */
  sourceSchema: Record<string, unknown>;
  /** Submitted values keyed by parameter source_field_path or key. */
  rawValues: Record<string, unknown>;
  /** Uploaded file storage keys (`file`-typed parameters) — the platform
   *  attachment contract: a TOP-LEVEL `attachment_keys` sibling, never part
   *  of raw_values (the form schema doesn't validate file params). */
  attachmentKeys?: string[];
  schemaVersion: string | null;
  mode: RendererMode;
}

export interface ActionPayload {
  /** Uploaded file storage keys (file-typed params) — absent when none. */
  attachment_keys?: string[];
  source: string;
  action: {
    id: string | null;
    key: string | null;
    status: string | null;
  };
  placement: {
    id: string | null;
    key: string | null;
    surface: string;
    status: string | null;
  } | null;
  target: {
    model: string | null;
    scope: Record<string, unknown>;
    id: string | null;
  };
  form: {
    action_type_key: string | null;
    action_placement_key: string | null;
    raw_values: Record<string, unknown>;
  };
  metadata: {
    renderer_mode: RendererMode;
    schema_version: string | null;
    target_model: string | null;
    form_definition_id: string | null;
  };
}

const RESERVED_TARGET_KEYS = new Set(["model", "id"]);

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function defaultSourceFor(mode: RendererMode): string {
  return mode === "public-submit" ? "citizen" : "admin";
}

function defaultSurfaceFor(mode: RendererMode): string {
  return mode === "public-submit" ? "public_submit" : "admin_preview";
}

function pickScope(targetConfig: Record<string, unknown>): Record<string, unknown> {
  const scope: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(targetConfig)) {
    if (RESERVED_TARGET_KEYS.has(key)) continue;
    scope[key] = value;
  }
  return scope;
}

export function buildActionPayload(args: BuildArgs): ActionPayload {
  const { action, placement, targetConfig, sourceSchema, rawValues, schemaVersion, mode, attachmentKeys } = args;

  const sourceFromSchema = nullableString(sourceSchema.source);
  const targetModel =
    nullableString(targetConfig.model) ??
    nullableString(placement?.target_model) ??
    nullableString(action?.target_model);

  const placementBlock = placement
    ? {
        id: nullableString(placement.id),
        key: nullableString(placement.key),
        surface: String(placement.surface ?? defaultSurfaceFor(mode)),
        status: nullableString(placement.status),
      }
    : null;

  return {
    source: sourceFromSchema ?? defaultSourceFor(mode),
    action: {
      id: nullableString(action?.id),
      key: nullableString(action?.key),
      status: nullableString(action?.status),
    },
    placement: placementBlock,
    target: {
      model: targetModel,
      scope: pickScope(targetConfig),
      id: nullableString(targetConfig.id),
    },
    form: {
      action_type_key: nullableString(action?.key),
      action_placement_key: nullableString(placement?.key),
      raw_values: rawValues,
    },
    metadata: {
      renderer_mode: mode,
      schema_version: schemaVersion,
      target_model: targetModel,
      form_definition_id: nullableString(targetConfig.form_definition_id),
    },
    ...(attachmentKeys && attachmentKeys.length > 0
      ? { attachment_keys: attachmentKeys }
      : {}),
  };
}

/**
 * Generic placement-consequence rows for the admin preview "Placement
 * consequences" section. Replaces the old "Occurrence type" hardcoded
 * row with a per-scope-key row, derived from target_config.
 */
export interface ConsequenceRow {
  label: string;
  value: string;
}

export function placementConsequenceRows(args: {
  placement: PlacementRef | null;
  targetConfig: Record<string, unknown>;
  sourceSchema: Record<string, unknown>;
  mode: RendererMode;
}): ConsequenceRow[] {
  const { placement, targetConfig, sourceSchema, mode } = args;
  const rows: ConsequenceRow[] = [
    {
      label: "Surface",
      value: String(placement?.surface ?? "No placement selected"),
    },
    {
      label: "Accepted source",
      value: String(sourceSchema.source ?? defaultSourceFor(mode)),
    },
    {
      label: "Target model",
      value: String(targetConfig.model ?? placement?.target_model ?? "-"),
    },
  ];

  const scope = pickScope(targetConfig);
  const scopeEntries = Object.entries(scope).filter(
    ([key]) => key !== "form_definition_id" && key !== "form_definition_key",
  );
  if (scopeEntries.length === 0) {
    rows.push({ label: "Scope", value: "Any row of model" });
  } else {
    for (const [key, value] of scopeEntries) {
      rows.push({ label: `Scope · ${key}`, value: String(value ?? "-") });
    }
  }

  rows.push({
    label: "Form definition",
    value: String(
      targetConfig.form_definition_key ??
        targetConfig.form_definition_id ??
        "Inherit (auto-derived)",
    ),
  });

  return rows;
}
