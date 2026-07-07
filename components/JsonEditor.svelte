<!--
  @component JsonEditor

  JSON field over the DS CodeEditor (#38, atelier#669 V1) with an explicit
  invalid-state contract: invalid text NEVER silently drops or half-parses —
  the field surfaces the parse error, emits NOTHING, and reports invalidity
  through `oninvalid` so the host form can block submit. Empty and `{}` are
  distinct (empty → null).

  @example
  <JsonEditor
    label="METADATA"
    value={{ kind: 'sensor' }}
    onchange={(v) => save(v)}
    oninvalid={(message) => (blocked = message !== null)}
  />
-->
<script module>
  let _jsonEditorUid = 0;
</script>

<script>
  import CodeEditor from './CodeEditor.svelte';
  import { evaluateJsonDraft, formatJsonValue } from './json-editor-contract';

  let {
    /** @type {unknown} — the current JSON value (object/array/scalar/null) */
    value = null,
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string | undefined} */
    help = undefined,
    /** @type {string | undefined} — EXTERNAL (server) error; parse errors
     *  render through the same chrome automatically */
    error = undefined,
    /** @type {boolean} */
    disabled = false,
    /** @type {boolean} */
    readonly = false,
    /** @type {((value: unknown) => void) | undefined} — fires ONLY on a
     *  valid parse (or empty → null); never fires for invalid text */
    onchange = undefined,
    /** @type {((message: string | null) => void) | undefined} — parse-state
     *  transitions: a message while the draft is invalid, null when it
     *  becomes valid again. The host blocks submit while non-null. */
    oninvalid = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const editorId = `json-editor-${_jsonEditorUid++}`;
  const hintId = `${editorId}-hint`;

  let text = $state(formatJsonValue(value));
  let parseError = $state(/** @type {string | null} */ (null));

  // Watch the CodeEditor-bound text: evaluate on every draft change. The
  // pipeline itself is the pure json-editor-contract module (CodeMirror is
  // not edit-drivable under jsdom, so the contract carries the test weight).
  let lastEvaluated = text;
  $effect(() => {
    if (text === lastEvaluated) return;
    lastEvaluated = text;
    const result = evaluateJsonDraft(text);
    if (result.ok) {
      parseError = null;
      oninvalid?.(null);
      onchange?.(result.value);
    } else {
      parseError = result.error;
      oninvalid?.(result.error);
    }
  });

  const shownError = $derived(error ?? parseError ?? undefined);
</script>

<div class="json-editor {className}" {...rest}>
  {#if label}
    <span class="json-editor-label" id={`${editorId}-label`}>{label}</span>
  {/if}
  <div
    class="json-editor-surface"
    class:json-editor-error={!!shownError}
    class:json-editor-disabled={disabled}
    aria-labelledby={label ? `${editorId}-label` : undefined}
    aria-describedby={shownError || help ? hintId : undefined}
  >
    <CodeEditor
      bind:value={text}
      language="json"
      readonly={readonly || disabled}
      lineNumbers={false}
      minLines={4}
      maxLines={16}
    />
  </div>
  {#if shownError}
    <span id={hintId} class="json-editor-error-text" role="alert">{shownError}</span>
  {:else if help}
    <span id={hintId} class="json-editor-help">{help}</span>
  {/if}
</div>

<style>
  .json-editor {
    display: flex;
    flex-direction: column;
    gap: var(--input-label-gap);
    width: 100%;
  }

  .json-editor-label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    letter-spacing: var(--input-label-tracking);
    color: var(--input-label-color);
  }

  .json-editor-surface {
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    padding: var(--space-xs);
  }

  .json-editor-surface:focus-within {
    border: var(--input-border-focus);
  }

  .json-editor-error {
    border-color: var(--input-error-border-color);
  }

  .json-editor-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .json-editor-help {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-help-color);
  }

  .json-editor-error-text {
    font-family: var(--input-help-font);
    font-size: var(--input-help-size);
    color: var(--input-error-text);
  }
</style>
