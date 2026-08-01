<!--
  @component KpiRegister

  A StatCard-variant register for KPI values where a measured reading
  visually out-ranks a projected value (larger display text, higher position
  in the visual hierarchy).

  BOUNDARY ELEMENT: throws when a projected value is provided without a seal.
  This is the enforcement point for the seal rule (prd.md §5.1): no unsealed
  projected value may cross this boundary into the rendering surface. The throw
  is unconditional — production code must never pass an unsealed projected value
  here; the guard exists to catch contract violations early.

  H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.
  References sistema#67 for .type-overline (--type-overline-* tokens).

  @example Measured only
  <KpiRegister label="ENERGY OUTPUT" measuredValue="2.3 MW" />

  @example With sealed projected value
  <KpiRegister
    label="ENERGY OUTPUT"
    measuredValue="2.3 MW"
    projectedValue="4.1 MW"
    projectedSeal={{ evidence: 'projected', stale: false }}
  />
-->
<script>
  import SealChip from './SealChip.svelte';

  /**
   * @typedef {'measured' | 'inferred' | 'projected'} EvidenceState
   * @typedef {'probable' | 'uncertain'} Probability
   * @typedef {{ evidence: EvidenceState; probability?: Probability; stale: boolean }} SealRef
   */

  let {
    /** @type {string} — overline label (KPI name / dimension) */
    label,
    /** @type {string} — the measured (authoritative) value; always required */
    measuredValue,
    /** @type {string | undefined} — a projected value for the same KPI */
    projectedValue = undefined,
    /**
     * @type {SealRef | undefined}
     * Seal metadata for the projected value. REQUIRED when projectedValue
     * is provided. The boundary guard throws when this is absent.
     * Obtain from assignSeal() in @aiaiai-pt/widget-system/core.
     */
    projectedSeal = undefined,
    /**
     * @type {string | undefined}
     * The provenance one-liner behind the projected value's seal. Supplied by
     * the surface (assignSeal has no prose); makes the «why» reachable one
     * click from the seal, as the law requires.
     */
    projectedWhy = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /*
   * BOUNDARY GUARD — the seal rule enforcement point.
   *
   * Runs synchronously at component initialisation. Also runs reactively
   * via $effect so prop changes after mount are also checked.
   *
   * Throws unconditionally when projectedValue is provided without a seal;
   * production surfaces must never reach this state (prd.md §5.1 #3:
   * "the product, deterministically" assigns the seal — a missing seal
   * means the caller skipped assignSeal, which is the defect).
   */
  if (projectedValue !== undefined && projectedSeal == null) {
    throw new Error(
      '[KpiRegister] A projected value must carry a seal. ' +
        'Provide the `projectedSeal` prop (result of assignSeal()). ' +
        'An unsealed projected value may not cross this boundary.',
    );
  }

  $effect(() => {
    if (projectedValue !== undefined && projectedSeal == null) {
      throw new Error(
        '[KpiRegister] A projected value must carry a seal. ' +
          'Provide the `projectedSeal` prop (result of assignSeal()). ' +
          'An unsealed projected value may not cross this boundary.',
      );
    }
  });
</script>

<div class="kpi-register {className}" {...rest}>
  <!--
    Overline label — micro-heading above the value.
    Uses --type-overline-* tokens directly (sistema#67 .type-overline utility).
  -->
  <span class="kpi-register-label">{label}</span>

  <!--
    Measured value: the authoritative reading.
    Display-scale type — visually out-ranks the projected row.
  -->
  <div class="kpi-register-measured">
    <span class="kpi-register-measured-value">{measuredValue}</span>
  </div>

  <!--
    Projected row: subordinate to the measured value (smaller type, lower position).
    Only rendered when a sealed projected value is provided.
    projectedSeal is guaranteed non-null here (boundary guard above).
  -->
  {#if projectedValue !== undefined && projectedSeal != null}
    <div class="kpi-register-projected">
      <SealChip
        value={projectedValue}
        evidence={projectedSeal.evidence}
        probability={projectedSeal.probability}
        stale={projectedSeal.stale}
        why={projectedWhy}
      />
    </div>
  {/if}
</div>

<style>
  .kpi-register {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--stat-padding);
    border: var(--stat-border);
    border-radius: var(--stat-radius);
    background: var(--stat-bg);
  }

  /*
   * Overline label — consumes --type-overline-* tokens (sistema#67).
   * Equivalent to the .type-overline utility class from utilities.css,
   * declared here so the component is self-contained.
   */
  .kpi-register-label {
    font-family: var(--type-overline-font);
    font-size: var(--type-overline-size);
    font-weight: var(--type-overline-weight);
    line-height: var(--type-overline-leading);
    letter-spacing: var(--type-overline-tracking);
    text-transform: uppercase;
    color: var(--stat-label-color);
  }

  /* Measured value: display scale — the dominant visual element */
  .kpi-register-measured-value {
    font-family: var(--stat-value-font);
    font-size: var(--stat-value-size);
    font-weight: var(--stat-value-weight);
    letter-spacing: var(--stat-value-tracking);
    color: var(--color-text);
    line-height: 1;
  }

  /* Projected row: body-scale — subordinate to the measured value */
  .kpi-register-projected {
    display: flex;
    align-items: center;
    margin-top: var(--space-2xs);
  }
</style>
