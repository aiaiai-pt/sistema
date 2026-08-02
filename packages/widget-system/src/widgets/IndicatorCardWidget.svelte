<!--
  @component IndicatorCardWidget — one indicator's face: numeral, provenance, drill.

  The same face must render on a board, a profile and a painel — the card is
  defined once and everything else is a named arrangement. So this widget holds
  no arrangement and no product vocabulary: it renders a resolved indicator and
  calls back.

  IT NEVER FETCHES. The drill affordance is a CALLBACK: the host owns transport,
  authorization and navigation. `props.onDrill` receives the caller's own
  `drillRef` untouched.

  WHY THE SEAL AND STATUS ARRIVE AS DATA, NOT SNIPPETS. This widget is dispatched
  through the registry, which hands a widget `{ data, props, locale }` and cannot
  carry snippets. A "slot" that silently vanishes on the dispatch path — the path
  boards actually use — is a trap, so the seal and the status chip are resolved
  DATA that this widget renders. Composition still overrides presentation through
  the declared tone, not through markup.

  String-free (D9) and vocabulary-free: every visible word, including the status
  chip's label and the drill affordance, is caller-supplied. The seal's terms are
  declared data resolved upstream by `resolveSeal` — this widget, like SealChip,
  enumerates no seal words.
-->
<script lang="ts">
  import SealChip from "@aiaiai-pt/design-system/components/SealChip.svelte";
  import type { WidgetRenderRequest } from "../core/index";

  /** A term already resolved from the declared vocabulary. */
  interface SealTerm {
    value: string;
    label: string;
    tone?: "positive" | "info" | "caution" | "neutral";
  }

  /** The seal shape `resolveSeal` produces. Rendered, never constructed here. */
  interface ResolvedSeal {
    evidence: SealTerm;
    evidenceClass?: string;
    probability?: SealTerm;
    stale?: boolean;
  }

  /** The resolved indicator this face renders. No query, no schema, no rows. */
  interface ResolvedIndicator {
    /** Already formatted for the locale by the host — never formatted here. */
    value: string;
    unit?: string;
    /** Provenance line: where this number came from. Caller-supplied prose. */
    provenance?: string;
    seal?: ResolvedSeal;
    /** Declared status term — label plus a design-system tone. */
    status?: SealTerm;
    /** Opaque handle echoed back to onDrill. Never interpreted here. */
    drillRef?: unknown;
  }

  let { data, props }: WidgetRenderRequest = $props();

  const indicator = $derived.by((): ResolvedIndicator => {
    if (!data || typeof data !== "object") return { value: "" };
    return data as ResolvedIndicator;
  });

  const label = $derived(
    typeof props?.label === "string" ? props.label : undefined,
  );
  /** Caller-supplied, already interpolated — e.g. «ver os 12 →». */
  const drillLabel = $derived(
    typeof props?.drillLabel === "string" ? props.drillLabel : undefined,
  );
  const onDrill = $derived(
    typeof props?.onDrill === "function"
      ? (props.onDrill as (ref: unknown) => void)
      : undefined,
  );
  /** Emphasis of the numeral, from the design system's own type roles. */
  const scale = $derived(
    props?.scale === "md" || props?.scale === "sm" ? props.scale : "lg",
  );

  const canDrill = $derived(drillLabel !== undefined && onDrill !== undefined);
</script>

<div class="indicator-card">
  {#if label}
    <span class="indicator-card-label">{label}</span>
  {/if}

  <!--
    The numeral and its unit read as one phrase; the unit is not a separate
    announcement. The seal, when present, rides the value itself.
  -->
  <div class="indicator-card-figure indicator-card-figure-{scale}">
    {#if indicator.seal}
      <SealChip
        value={indicator.unit
          ? `${indicator.value} ${indicator.unit}`
          : indicator.value}
        evidence={indicator.seal.evidence}
        probability={indicator.seal.probability}
        stale={indicator.seal.stale ?? false}
        why={indicator.provenance}
        whyLabel={typeof props?.whyLabel === "string" ? props.whyLabel : undefined}
        closeLabel={typeof props?.closeLabel === "string"
          ? props.closeLabel
          : undefined}
        staleLabel={typeof props?.staleLabel === "string"
          ? props.staleLabel
          : undefined}
      />
    {:else}
      <span class="indicator-card-value">{indicator.value}</span>
      {#if indicator.unit}<span class="indicator-card-unit">{indicator.unit}</span>{/if}
    {/if}

    {#if indicator.status}
      <span class="indicator-card-status seal-tone-{indicator.status.tone ?? 'neutral'}"
        >{indicator.status.label}</span
      >
    {/if}
  </div>

  <!--
    An unsealed number still says where it came from. When the value IS sealed,
    the provenance is the seal's «why» instead, so it is not printed twice.
  -->
  {#if indicator.provenance && !indicator.seal}
    <p class="indicator-card-provenance">{indicator.provenance}</p>
  {/if}

  {#if canDrill}
    <button
      type="button"
      class="indicator-card-drill"
      onclick={() => onDrill?.(indicator.drillRef)}>{drillLabel}</button
    >
  {/if}
</div>

<style>
  .indicator-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--stat-padding);
    border: var(--stat-border);
    border-radius: var(--stat-radius);
    background: var(--stat-bg);
  }

  .indicator-card-label {
    font-family: var(--type-overline-font);
    font-size: var(--type-overline-size);
    font-weight: var(--type-overline-weight);
    line-height: var(--type-overline-leading);
    letter-spacing: var(--type-overline-tracking);
    text-transform: uppercase;
    color: var(--stat-label-color);
  }

  .indicator-card-figure {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  /* Emphasis comes from the design system's type roles — never a literal size. */
  .indicator-card-figure-lg .indicator-card-value {
    font-family: var(--stat-value-font);
    font-size: var(--stat-value-size);
    font-weight: var(--stat-value-weight);
    letter-spacing: var(--stat-value-tracking);
  }

  .indicator-card-figure-md .indicator-card-value {
    font-family: var(--type-data-font);
    font-size: var(--type-data-size);
    font-weight: var(--type-data-weight);
    letter-spacing: var(--type-data-tracking);
  }

  .indicator-card-figure-sm .indicator-card-value {
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    font-weight: var(--type-caption-weight);
    letter-spacing: var(--type-caption-tracking);
  }

  .indicator-card-value {
    color: var(--color-text);
    line-height: 1;
  }

  .indicator-card-unit {
    font-family: var(--type-data-font);
    font-size: var(--type-data-size);
    color: var(--color-text-secondary);
  }

  .indicator-card-status {
    font-family: var(--badge-font);
    font-size: var(--badge-size);
    letter-spacing: var(--badge-tracking);
    border-radius: var(--badge-radius);
    padding: var(--badge-padding-y) var(--badge-padding-x);
    line-height: 1;
    white-space: nowrap;
  }

  /* The design system's tone scale — the term that wears it is declared data. */
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

  .indicator-card-provenance {
    margin: 0;
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    line-height: var(--type-caption-leading);
    color: var(--color-text-muted);
  }

  .indicator-card-drill {
    align-self: flex-start;
    padding: 0;
    border: none;
    background: none;
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-accent);
    cursor: pointer;
    text-align: left;
  }

  .indicator-card-drill:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }
</style>
