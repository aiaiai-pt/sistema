<!--
  @component SealChip

  The one seal renderer for every value surface — KPI registers, map badges,
  paths-strip columns, record lines, citations, saved projections, briefs.
  No surface renders a seal any other way.

  THIS COMPONENT KNOWS NO SEAL WORDS. The design system owns the LAWS and a
  presentation tone scale; it does not own the vocabulary. Terms arrive as
  declared data — `{ value, label, tone }` resolved from ontology vocabulary
  rows at read time — so widening an axis or re-wording a term is a declaration
  change with zero code change and no package release.

  The laws it does enforce, all of which hold under every enumeration in the
  corpus:
    · two orthogonal axes, rendered as two adjacent chips, never one phrase
    · never label-alone — a seal never appears without its evidence chip
    · evidence alone is valid; probability alone is not
    · the seal rides the DATUM, not the styling — it is adjacent DOM text, so
      it survives re-render, copy, quotation and screen readers
    · a «why» is always one tap away, keyboard-reachable

  Value and seal read to a screen reader as ONE stitched phrase:
  «{value} — {evidence}[, {probability}][, stale]».

  `stale` is a separate orthogonal state, never a member of either vocabulary.

  H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.

  @example A reading, using whatever terms the deployment declares
  <SealChip value="+14 cm/h" evidence={{ value: 'measured', label: 'medido', tone: 'positive' }} />

  @example Both axes, horizon passed, why one tap away
  <SealChip
    value="2,1 m"
    evidence={{ value: 'inferred', label: 'inferido', tone: 'info' }}
    probability={{ value: 'uncertain', label: 'incerto' }}
    stale
    why="the 16:00 window has already passed"
  />
-->
<script>
  /**
   * @typedef {'positive' | 'info' | 'caution' | 'neutral'} SealTone
   * @typedef {{ value: string, label: string, tone?: SealTone }} SealTerm
   */

  let {
    /** @type {string} — the formatted display value */
    value,
    /**
     * @type {SealTerm}
     * The declared evidence term. Required: a seal never appears without its
     * evidence chip. Resolve it with `resolveSeal` from
     * `@aiaiai-pt/widget-system/core` — never construct one from a literal.
     */
    evidence,
    /**
     * @type {SealTerm | undefined}
     * The declared probability term. Orthogonal to evidence and rendered as its
     * own adjacent chip. Optional because evidence alone is a valid seal.
     */
    probability = undefined,
    /** @type {boolean} — true when the validity window has passed */
    stale = false,
    /**
     * @type {string | undefined}
     * The provenance one-liner behind the seal. When supplied, the chip is a
     * real button that discloses it — the «why», one tap away.
     */
    why = undefined,
    /**
     * @type {string}
     * Accessible name for the why trigger. Localized by the caller, since this
     * package owns no product copy. `{term}` is replaced by the evidence label.
     */
    whyLabel = 'why — {term}',
    /** @type {string} — accessible name for the disclosure's close affordance */
    closeLabel = 'Close',
    /** @type {string} — screen-reader word for the stale state; localized by the caller */
    staleLabel = 'stale',
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const TONES = ['positive', 'info', 'caution', 'neutral'];

  /**
   * BOUNDARY GUARD — "never label-alone; a seal never appears without evidence
   * chips", and "evidence alone is valid, probability alone is not".
   *
   * Without this, an absent term renders an empty badge and an empty sr-text:
   * a value dressed as a sealed datum, carrying no evidence and announcing
   * nothing to a screen reader. That failure is silent, which is exactly why
   * it is a throw and not a fallback.
   *
   * The guard checks SHAPE, never membership — this component has no opinion
   * about which words are legal, only that a term is present and renderable.
   */
  const assertTerm = (
    /** @type {unknown} */ term,
    /** @type {string} */ axis,
  ) => {
    const ok =
      typeof term === 'object' &&
      term !== null &&
      typeof (/** @type {SealTerm} */ (term).label) === 'string' &&
      /** @type {SealTerm} */ (term).label.trim() !== '';
    if (!ok) {
      throw new Error(
        `[SealChip] The ${axis} axis needs a declared term ` +
          '{ value, label, tone? } with a non-empty label. Received ' +
          `${JSON.stringify(term)}. Resolve it from the declared vocabulary ` +
          'with resolveSeal(); this component enumerates no seal words.',
      );
    }
    const tone = /** @type {SealTerm} */ (term).tone;
    if (tone !== undefined && !TONES.includes(tone)) {
      throw new Error(
        `[SealChip] Unknown tone ${JSON.stringify(tone)} on the ${axis} axis. ` +
          `The design system's tone scale is ${TONES.join(' | ')}.`,
      );
    }
  };

  const assertSeal = (/** @type {unknown} */ ev, /** @type {unknown} */ prob) => {
    // Evidence first: probability-alone must fail as a MISSING EVIDENCE error,
    // because that is the law it breaks.
    assertTerm(ev, 'evidence');
    if (prob !== undefined) assertTerm(prob, 'probability');
  };

  assertSeal(evidence, probability);
  $effect(() => assertSeal(evidence, probability));

  const evidenceTone = $derived(evidence?.tone ?? 'neutral');
  const probabilityTone = $derived(probability?.tone ?? 'neutral');

  /**
   * The stitched phrase AT reads and a citation carries:
   * «{value} — {evidence}[, {probability}][, stale]».
   */
  const srPhrase = $derived(
    [
      `${value} — ${evidence.label}`,
      probability?.label,
      stale ? staleLabel : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  );

  const whyTriggerLabel = $derived(whyLabel.replace('{term}', evidence.label));

  /** Disclosure state lives here, never in a DOM attribute. */
  let open = $state(false);
  /** @type {HTMLButtonElement | undefined} */
  let trigger = $state();

  const panelId = $props.id();

  const closeWhy = () => {
    open = false;
    trigger?.focus();
  };

  /** Esc anywhere inside the open disclosure closes it (cascade slot 2). */
  const onDocumentKeydown = (/** @type {KeyboardEvent} */ event) => {
    if (event.key === 'Escape' && open) closeWhy();
  };
</script>

<svelte:document onkeydown={onDocumentKeydown} />

{#snippet chips()}
  <span class="seal-chip-badge seal-tone-{evidenceTone}" aria-hidden="true"
    >{evidence.label}{stale ? ` (${staleLabel})` : ''}</span
  >{#if probability}<span
      class="seal-chip-probability seal-tone-{probabilityTone}"
      aria-hidden="true">{probability.label}</span
    >{/if}
{/snippet}

<!--
  One inline phrase. The visible value and chips are aria-hidden so the
  stitched sr-text is the single thing announced — nothing reads twice.
  The sr-text follows the value in DOM order, so a sweep or a copy captures
  «value seal» in that order.
-->
<span
  class="seal-chip {stale ? 'seal-chip-stale' : ''} {className}"
  data-evidence={evidence.value}
  {...rest}
>
  <span class="seal-chip-value" aria-hidden="true">{value}</span><!--
  -->{#if why}<button
      type="button"
      class="seal-chip-why-trigger"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={whyTriggerLabel}
      bind:this={trigger}
      onclick={() => (open = !open)}>{@render chips()}</button
    >{:else}{@render chips()}{/if}<!--
  --><span class="seal-chip-sr-text">&thinsp;{srPhrase}</span>

  {#if why && open}
    <span id={panelId} class="seal-chip-why-panel">
      <span class="seal-chip-why-text">{why}</span>
      <button
        type="button"
        class="seal-chip-why-close"
        aria-label={closeLabel}
        onclick={closeWhy}>×</button
      >
    </span>
  {/if}
</span>

<style>
  .seal-chip {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-xs);
    position: relative;
  }

  /* Value text carries no override — it reads as its surrounding type. */

  /* Both axes share one chip shape; only the tone differs. */
  .seal-chip-badge,
  .seal-chip-probability {
    display: inline-flex;
    align-items: center;
    font-family: var(--badge-font);
    font-size: var(--badge-size);
    letter-spacing: var(--badge-tracking);
    border-radius: var(--badge-radius);
    padding: var(--badge-padding-y) var(--badge-padding-x);
    white-space: nowrap;
    line-height: 1;
  }

  /* The second axis is always its own element beside the first, so the two
     never merge into one phrase. */
  .seal-chip-probability {
    margin-left: var(--space-2xs);
  }

  /*
   * TONES — the presentation scale the design system owns. Which declared term
   * wears which tone is data, declared beside the word and never inferred from
   * it, so these rules carry no vocabulary.
   */
  .seal-tone-positive {
    color: var(--seal-positive-text);
    background: var(--seal-positive-bg);
  }

  .seal-tone-info {
    color: var(--seal-info-text);
    background: var(--seal-info-bg);
  }

  .seal-tone-caution {
    color: var(--seal-caution-text);
    background: var(--seal-caution-bg);
  }

  .seal-tone-neutral {
    color: var(--badge-neutral-text);
    background: var(--badge-neutral-bg);
  }

  /* Stale is an orthogonal state, not a vocabulary member: it mutes whatever
     tone the evidence term carries. The word carries the meaning; the wash is
     redundant emphasis. */
  .seal-chip-stale .seal-chip-badge {
    color: var(--seal-stale-text);
    background: var(--seal-stale-bg);
  }

  /*
   * The why trigger is a real button wrapping the chips — the whole seal is
   * the affordance, so the «why» is one tap away from the seal itself.
   */
  .seal-chip-why-trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2xs);
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .seal-chip-why-trigger:focus-visible,
  .seal-chip-why-close:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }

  /* The provenance one-liner. Plain text plus a visible close (Esc/X parity). */
  .seal-chip-why-panel {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1;
    display: inline-flex;
    align-items: flex-start;
    gap: var(--space-xs);
    margin-top: var(--space-2xs);
    padding: var(--space-xs) var(--space-sm);
    max-width: 32ch;
    border: var(--elevation-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-secondary);
    color: var(--color-text-secondary);
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    font-weight: var(--type-caption-weight);
    line-height: var(--type-caption-leading);
    letter-spacing: var(--type-caption-tracking);
    text-align: left;
  }

  .seal-chip-why-close {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    line-height: 1;
    color: inherit;
    cursor: pointer;
  }

  /*
   * sr-only — visually hidden but present in the DOM so the text travels
   * with the value when content is copied or cited: a citation carries the
   * seal of the value it cites.
   */
  .seal-chip-sr-text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
