<!--
  @component KpiRegister

  The two-register composition for one KPI: the more authoritative value above,
  the less authoritative beneath. It is where "measured out-ranks projected"
  becomes concrete — in type SIZE, in POSITION, and in SCREEN-READER READING
  ORDER, all three.

  The ranking is enforced STRUCTURALLY, by evidence class, not by word. A
  reading outranks a model output, which outranks a forecast
  (EVIDENCE_CLASS_RANK in @aiaiai-pt/widget-system/core). That ordering holds
  under every enumeration in the corpus, so this component needs no vocabulary
  to enforce it — and it throws if a caller tries to seat a more authoritative
  value in the lower register.

  BOUNDARY ELEMENT: throws when a value that requires a seal is handed over
  without one. No unsealed seal-required value crosses this boundary onto a
  rendering surface.

  H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.
  Uses --type-overline-* tokens (sistema#67) for the overline label.

  @example A reading alone
  <KpiRegister label="WATER LEVEL" primaryValue="+14 cm/h" />

  @example Reading above a sealed forecast, why one tap away
  <KpiRegister
    label="WATER LEVEL"
    primaryValue="+14 cm/h"
    secondaryValue="−18 cm"
    secondarySeal={resolveSeal(assignment, vocabulary)}
    secondaryWhy="derived from the 14:00–16:00 tide model run"
  />
-->
<script>
  import SealChip from './SealChip.svelte';

  /**
   * @typedef {'direct_reading' | 'model_derived' | 'future_window'} EvidenceClass
   * @typedef {'positive' | 'info' | 'caution' | 'neutral'} SealTone
   * @typedef {{ value: string, label: string, tone?: SealTone }} SealTerm
   * @typedef {{ evidence: SealTerm, evidenceClass: EvidenceClass, probability?: SealTerm, stale: boolean }} ResolvedSeal
   */

  let {
    /** @type {string} — overline label (KPI name / dimension) */
    label,
    /** @type {string} — the more authoritative value; always required */
    primaryValue,
    /**
     * @type {ResolvedSeal | undefined}
     * Seal for the primary value. Omit only when the value needs none — a
     * direct reading of a current or past window (assignSeal.sealRequired).
     */
    primarySeal = undefined,
    /** @type {string | undefined} — the less authoritative value for the same KPI */
    secondaryValue = undefined,
    /**
     * @type {ResolvedSeal | undefined}
     * Seal for the secondary value. REQUIRED when secondaryValue is provided:
     * a value seated in the lower register is, by construction, not a plain
     * current reading.
     */
    secondarySeal = undefined,
    /**
     * @type {string | undefined}
     * The provenance one-liner behind the secondary value's seal — what makes
     * the «why» reachable one tap from the seal.
     */
    secondaryWhy = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /** Structural authority order — highest first. Mirrors EVIDENCE_CLASS_RANK. */
  const RANK = {
    direct_reading: 3,
    model_derived: 2,
    future_window: 1,
  };

  /*
   * BOUNDARY GUARDS. Both run synchronously at initialisation and again
   * reactively, so a prop change after mount cannot smuggle a violation in.
   */
  const assertRegisters = (
    /** @type {string | undefined} */ secondary,
    /** @type {ResolvedSeal | undefined} */ secSeal,
    /** @type {ResolvedSeal | undefined} */ primSeal,
  ) => {
    // 1. No unsealed value in the lower register.
    if (secondary !== undefined && secSeal == null) {
      throw new Error(
        '[KpiRegister] The secondary value must carry a seal. Pass ' +
          '`secondarySeal` (from resolveSeal()). An unsealed value may not ' +
          'cross this boundary onto a rendering surface.',
      );
    }
    // 2. The lower register may never out-rank the upper one.
    if (secSeal != null && primSeal != null) {
      const secRank = RANK[secSeal.evidenceClass];
      const primRank = RANK[primSeal.evidenceClass];
      if (secRank > primRank) {
        throw new Error(
          `[KpiRegister] The secondary value's evidence class ` +
            `"${secSeal.evidenceClass}" out-ranks the primary's ` +
            `"${primSeal.evidenceClass}". The more authoritative value takes ` +
            'the upper register — swap them.',
        );
      }
    }
  };

  assertRegisters(secondaryValue, secondarySeal, primarySeal);
  $effect(() => assertRegisters(secondaryValue, secondarySeal, primarySeal));
</script>

<div class="kpi-register {className}" {...rest}>
  <!-- Overline label — micro-heading above the value (sistema#67 tokens). -->
  <span class="kpi-register-label">{label}</span>

  <!--
    The primary register: display-scale type, first in the DOM, and therefore
    first in reading order. Out-ranks the secondary on all three axes.
  -->
  <div class="kpi-register-primary">
    {#if primarySeal != null}
      <SealChip
        class="kpi-register-primary-value"
        value={primaryValue}
        evidence={primarySeal.evidence}
        probability={primarySeal.probability}
        stale={primarySeal.stale}
      />
    {:else}
      <span class="kpi-register-primary-value">{primaryValue}</span>
    {/if}
  </div>

  <!--
    The secondary register: body-scale, lower position, read last.
    secondarySeal is guaranteed non-null here by the boundary guard.
  -->
  {#if secondaryValue !== undefined && secondarySeal != null}
    <div class="kpi-register-secondary">
      <SealChip
        value={secondaryValue}
        evidence={secondarySeal.evidence}
        probability={secondarySeal.probability}
        stale={secondarySeal.stale}
        why={secondaryWhy}
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
   * Equivalent to the .type-overline utility, declared here so the component
   * is self-contained.
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

  /* Primary: display scale — the dominant element. */
  .kpi-register-primary :global(.kpi-register-primary-value),
  .kpi-register-primary .kpi-register-primary-value {
    font-family: var(--stat-value-font);
    font-size: var(--stat-value-size);
    font-weight: var(--stat-value-weight);
    letter-spacing: var(--stat-value-tracking);
    color: var(--color-text);
    line-height: 1;
  }

  /* Secondary: body scale — subordinate to the primary register. */
  .kpi-register-secondary {
    display: flex;
    align-items: center;
    margin-top: var(--space-2xs);
  }
</style>
