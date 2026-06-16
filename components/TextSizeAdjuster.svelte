<!--
  @component TextSizeAdjuster

  Citizen text-size control (#244 C7 accessibility pack). Three buttons —
  decrease (A−), reset (A), increase (A+) — step the root font scale across four
  rungs (100–160%), so a citizen can enlarge the rem-based type system without
  breaking the layout (WCAG 1.4.4 Resize Text). The classic pt-gov
  "diminuir / normal / aumentar" pattern.

  Presentational: it reports the chosen size via `onchange`; the consumer
  persists it (cookie) and applies the `:root[data-text-size="N"]` layer
  (tokens/semantic.css) server-side, so SSR paints it with no flash. Controls
  disable at the bounds; a polite live region announces the current size for
  screen-reader users. Labels are props for i18n (default English).

  @example
  <TextSizeAdjuster size={prefs.textSize} onchange={(n) => setTextSize(n)} />
-->
<script>
  import {
    DEFAULT_TEXT_SIZE,
    normalizeTextSize,
    increaseTextSize,
    decreaseTextSize,
    isMinTextSize,
    isMaxTextSize,
  } from "./text-size.js";

  let {
    /** @type {number} Current size step (percent). Off-ladder values normalize. */
    size = DEFAULT_TEXT_SIZE,
    /** @type {((size: number) => void) | undefined} */
    onchange = undefined,
    /** @type {string} Group label (i18n). */
    label = "Text size",
    /** @type {string} Decrease-button accessible label (i18n). */
    decreaseLabel = "Decrease text size",
    /** @type {string} Reset-button accessible label (i18n). */
    resetLabel = "Reset text size",
    /** @type {string} Increase-button accessible label (i18n). */
    increaseLabel = "Increase text size",
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  const current = $derived(normalizeTextSize(size));
  const atMin = $derived(isMinTextSize(current));
  const atMax = $derived(isMaxTextSize(current));
  const atDefault = $derived(current === DEFAULT_TEXT_SIZE);

  function emit(next) {
    if (next !== current) onchange?.(next);
  }
</script>

<div
  class="text-size-adjuster {className}"
  role="group"
  aria-label={label}
  data-testid="text-size-adjuster"
  {...rest}
>
  <!--
    WCAG 2.5.3 (Label in Name): the accessible name MUST contain the visible
    text. The visible label is the glyph ("A&minus;" / "A" / "A+"), so the
    glyph is part of the name (NOT aria-hidden, NOT replaced by aria-label) and
    the descriptive i18n label rides along as visually-hidden text. Result, e.g.
    name = "A&minus; Decrease text size", whose visible substring "A&minus;"
    satisfies the rule while screen readers still hear the full description.
  -->
  <button
    type="button"
    class="ts-btn ts-decrease"
    disabled={atMin}
    onclick={() => emit(decreaseTextSize(current))}
  >A&minus;<span class="sr-only"> {decreaseLabel}</span></button>
  <button
    type="button"
    class="ts-btn ts-reset"
    disabled={atDefault}
    onclick={() => emit(DEFAULT_TEXT_SIZE)}
  >A<span class="sr-only"> {resetLabel}</span></button>
  <button
    type="button"
    class="ts-btn ts-increase"
    disabled={atMax}
    onclick={() => emit(increaseTextSize(current))}
  >A+<span class="sr-only"> {increaseLabel}</span></button>
  <span class="sr-only" aria-live="polite" data-testid="text-size-readout"
    >{current}%</span
  >
</div>

<style>
  .text-size-adjuster {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2xs);
  }

  .ts-btn {
    display: inline-flex;
    align-items: baseline;
    justify-content: center;
    min-width: var(--space-lg);
    font: inherit;
    color: var(--color-text-secondary);
    background: none;
    border: var(--border-width-thin, 1px) solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2xs) var(--space-xs);
    cursor: pointer;
    line-height: 1;
  }

  /* The glyph "A" sizes telegraph the control: smaller on decrease, larger on
     increase, so the affordance reads without relying on the +/− alone. */
  .ts-decrease {
    font-size: var(--type-body-sm-size);
  }
  .ts-reset {
    font-size: var(--type-body-size);
  }
  .ts-increase {
    font-size: var(--type-heading-sm-size);
  }

  .ts-btn:hover:not(:disabled) {
    color: var(--color-text);
    background: var(--color-surface-secondary);
  }

  .ts-btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .ts-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
