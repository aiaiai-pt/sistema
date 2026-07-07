// #38 (atelier#669 V1) — the JsonEditor's parse/emit contract, pure.
// Invalid text NEVER silently drops or half-parses: evaluation either
// yields `{ok: true, value}` (emit) or `{ok: false, error}` (surface the
// parse error, block submit via the renderer's error seam, emit NOTHING).
// Empty and `{}` are distinct: empty text is `{ok: true, value: null}`.

export type JsonDraftResult =
  { ok: true; value: unknown } | { ok: false; error: string };

/** Pretty-print a value into the editor. Null/undefined → empty editor. */
export function formatJsonValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2) ?? "";
  } catch {
    // Circular or non-serializable host value — start the editor empty
    // rather than exploding the form.
    return "";
  }
}

/** Evaluate the operator's raw text. */
export function evaluateJsonDraft(text: string): JsonDraftResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch (parseError) {
    const detail =
      parseError instanceof Error ? parseError.message : String(parseError);
    return { ok: false, error: `Invalid JSON: ${detail}` };
  }
}
