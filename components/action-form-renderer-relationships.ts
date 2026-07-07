// #34 (atelier#669 V1, operator decision D6) — cardinality-aware relationship
// helpers for ActionFormRenderer. Pure functions over the two param shapes the
// renderer meets:
//   form-surface.v1 field summary — `type: "relationship"` with a top-level
//     `relationship: {relCode, targetTypeCode, cardinality}`;
//   derived-action param — `type: "object_reference"` with `object_type`,
//     `multiple: true` for many_to_many, and the same relationship meta under
//     `ui_schema.relationship` (see atelier derived_crud._member_to_param).

export type RelationshipMeta = {
  relCode?: string;
  targetTypeCode: string;
  cardinality?: string;
};

type Entity = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** The relationship meta, from the field summary's `relationship` or the
 *  derived-action param's `ui_schema.relationship`. Null for non-rel params. */
export function relationshipMeta(parameter: Entity): RelationshipMeta | null {
  const carrier =
    asRecord(parameter.relationship) ??
    asRecord(asRecord(parameter.ui_schema)?.relationship);
  if (!carrier) return null;
  const targetTypeCode = String(
    carrier.targetTypeCode ?? carrier.target_type_code ?? "",
  );
  if (!targetTypeCode) return null;
  const relCode = carrier.relCode ?? carrier.rel_code;
  const cardinality = carrier.cardinality;
  return {
    relCode: relCode ? String(relCode) : undefined,
    targetTypeCode,
    cardinality: cardinality ? String(cardinality) : undefined,
  };
}

/** True for both rel lanes: the form-surface `relationship` summary and the
 *  action-lane `object_reference` param. */
export function isRelationshipParam(parameter: Entity): boolean {
  const type = String(parameter.type ?? "");
  return (
    type === "relationship" ||
    type === "object_reference" ||
    relationshipMeta(parameter) !== null
  );
}

/** Multi-value (chips) when the param says `multiple: true` (derived-action
 *  lane) or the relationship meta says many_to_many (form-surface lane). */
export function isMultiRelationship(parameter: Entity): boolean {
  if (parameter.multiple === true) return true;
  return relationshipMeta(parameter)?.cardinality === "many_to_many";
}

/** The entity type code the picker searches/hydrates against. */
export function relationshipTypeCode(parameter: Entity): string {
  return (
    relationshipMeta(parameter)?.targetTypeCode ??
    String(parameter.object_type ?? "")
  );
}

/** Normalize a rel value-bag entry onto the ID-list wire shape. */
export function normalizeRelIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "")).filter(Boolean);
  }
  if (typeof value === "string" && value) return [value];
  return [];
}
