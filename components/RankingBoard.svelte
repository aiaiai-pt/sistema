<!--
  @component RankingBoard

  An ordered leaderboard of entities ranked by a single aggregate value — the
  citizen portal's "results" surface (winning participatory-budget proposals by
  votes, most-reported categories, top-consuming meters). Vertical-agnostic:
  `items` is already shaped to `{ label, value }`; the consumer (a portal widget
  over a public aggregate VIEW) does the field mapping and sorting.

  Accessibility-first: renders a semantic `<ol>` so rank + position are conveyed
  structurally (not just visually), with a visible rank badge and a proportional
  bar (decorative, `aria-hidden`) for at-a-glance weight. The value is real text,
  never encoded only in the bar width — so the ranking reads identically with CSS
  off or to a screen reader. Consumes semantic tokens so dark / high-contrast
  schemes (#244) ride through. Soft-empty: no items → renders nothing.

  @example
  <RankingBoard
    label="Winning proposals by votes"
    items={[
      { label: "Ciclovia da Marginal", value: 1284 },
      { label: "Parque infantil de Gaia", value: 967 },
      { label: "Iluminação LED do centro", value: 612 },
    ]}
    valueSuffix=" votos"
    locale="pt"
  />
-->
<script module>
  /**
   * @typedef {{ label: string, value: number }} RankingItem
   */
</script>

<script>
  let {
    /** @type {RankingItem[]} Pre-sorted (desc) items; index 0 is rank 1. */
    items = [],
    /** @type {string} Accessible name for the ranked list (localize it). */
    label = "Ranking",
    /** @type {string} Appended after each value (e.g. " votos"); localize it. */
    valueSuffix = "",
    /** @type {string} BCP-47 locale for number formatting. */
    locale = "en",
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  const max = $derived(
    items.reduce((m, it) => (it.value > m ? it.value : m), 0),
  );

  /** @param {number} value @returns {string} */
  function fmt(value) {
    return new Intl.NumberFormat(locale).format(value);
  }

  /** Bar width as an integer percent of the max (0 when max is 0).
   * @param {number} value @returns {number} */
  function pct(value) {
    return max > 0 ? Math.round((value / max) * 100) : 0;
  }
</script>

{#if items.length > 0}
  <ol class="ranking-board {className}" aria-label={label} {...rest}>
    {#each items as item, i (item.label + i)}
      <li class="ranking-row">
        <span class="ranking-rank" aria-hidden="true">{i + 1}</span>
        <span class="ranking-body">
          <span class="ranking-label">{item.label}</span>
          <span class="ranking-bar" aria-hidden="true">
            <span class="ranking-bar-fill" style="inline-size: {pct(item.value)}%"
            ></span>
          </span>
        </span>
        <span class="ranking-value">{fmt(item.value)}{valueSuffix}</span>
      </li>
    {/each}
  </ol>
{/if}

<style>
  .ranking-board {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .ranking-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-sm);
  }

  .ranking-rank {
    inline-size: 1.75rem;
    block-size: 1.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full, 999px);
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    font-size: var(--type-body-sm-size);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  /* The top three carry the accent fill so the podium reads at a glance —
     redundant with the ordinal position (never the only signal). */
  .ranking-row:nth-child(-n + 3) .ranking-rank {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: var(--color-text-on-accent);
  }

  .ranking-body {
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3xs, 2px);
  }

  .ranking-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text-primary);
  }

  .ranking-bar {
    block-size: var(--space-2xs, 6px);
    inline-size: 100%;
    border-radius: var(--radius-full, 999px);
    background: var(--color-border);
    overflow: hidden;
  }

  .ranking-bar-fill {
    display: block;
    block-size: 100%;
    background: var(--color-accent);
    border-radius: inherit;
  }

  .ranking-value {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
  }
</style>
