<!--
  @component StatCard

  KPI card with large value, label, optional trend indicator and icon.
  Consumes --stat-* tokens from components.css.

  @example Basic
  <StatCard label="TOTAL EQUIPMENT" value="1,247" />

  @example With trend
  <StatCard label="ACTIVE" value="892" trend={12.4} trendLabel="vs last month" />

  @example With icon
  <StatCard label="OVERDUE" value="23" variant="error">
    {#snippet icon()}<PhWarning size={24} />{/snippet}
  </StatCard>
-->
<script>
  import Skeleton from './Skeleton.svelte';

  /**
   * @typedef {'neutral' | 'success' | 'warning' | 'error' | 'info'} Variant
   */

  let {
    /** @type {string} */
    value = '',
    /** @type {string} */
    label = '',
    /** @type {Variant} */
    variant = 'neutral',
    /** @type {number | undefined} — percentage change; positive = up, negative = down, 0 = neutral */
    trend = undefined,
    /** @type {string | undefined} */
    trendLabel = undefined,
    /** @type {boolean} */
    loading = false,
    /** @type {import('svelte').Snippet | undefined} */
    icon = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const trendDirection = $derived(
    trend === undefined ? 'none'
    : trend > 0 ? 'up'
    : trend < 0 ? 'down'
    : 'neutral'
  );

  const trendText = $derived(
    trend === undefined ? ''
    : `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`
  );
</script>

<div class="stat stat-{variant} {className}" {...rest}>
  {#if loading}
    <div class="stat-loading">
      <Skeleton width="60%" height="36px" />
      <Skeleton width="80%" height="12px" />
    </div>
  {:else}
    <div class="stat-content">
      <div class="stat-main">
        <span class="stat-label">{label}</span>
        <span class="stat-value">{value}</span>
        {#if trend !== undefined}
          <span class="stat-trend stat-trend-{trendDirection}">
            {#if trendDirection === 'up'}
              <svg class="stat-trend-icon" viewBox="0 0 256 256" aria-hidden="true">
                <polyline points="64,192 128,128 192,192" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
                <line x1="128" y1="128" x2="128" y2="224" stroke="currentColor" stroke-width="24" stroke-linecap="round" />
              </svg>
            {:else if trendDirection === 'down'}
              <svg class="stat-trend-icon" viewBox="0 0 256 256" aria-hidden="true">
                <polyline points="64,64 128,128 192,64" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
                <line x1="128" y1="32" x2="128" y2="128" stroke="currentColor" stroke-width="24" stroke-linecap="round" />
              </svg>
            {:else}
              <svg class="stat-trend-icon" viewBox="0 0 256 256" aria-hidden="true">
                <line x1="40" y1="128" x2="216" y2="128" stroke="currentColor" stroke-width="24" stroke-linecap="round" />
              </svg>
            {/if}
            <span>{trendText}</span>
            {#if trendLabel}
              <span class="stat-trend-label">{trendLabel}</span>
            {/if}
          </span>
        {/if}
      </div>
      {#if icon}
        <span class="stat-icon" aria-hidden="true">
          {@render icon()}
        </span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .stat {
    display: flex;
    padding: var(--stat-padding);
    border: var(--stat-border);
    border-radius: var(--stat-radius);
    background: var(--stat-bg);
    min-width: 0;
  }

  .stat-loading {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    width: 100%;
  }

  .stat-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
    width: 100%;
  }

  .stat-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    min-width: 0;
  }

  .stat-label {
    font-family: var(--stat-label-font);
    font-size: var(--stat-label-size);
    letter-spacing: var(--stat-label-tracking);
    color: var(--stat-label-color);
  }

  .stat-value {
    font-family: var(--stat-value-font);
    font-size: var(--stat-value-size);
    font-weight: var(--stat-value-weight);
    letter-spacing: var(--stat-value-tracking);
    color: var(--color-text);
    line-height: 1;
  }

  /* ─── Variant accent on value ─── */
  .stat-success .stat-value { color: var(--color-success); }
  .stat-warning .stat-value { color: var(--color-warning); }
  .stat-error .stat-value { color: var(--color-destructive); }
  .stat-info .stat-value { color: var(--color-info); }

  /* ─── Trend ─── */
  .stat-trend {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2xs);
    font-family: var(--stat-trend-font);
    font-size: var(--stat-trend-size);
    margin-top: var(--space-2xs);
  }

  .stat-trend-up { color: var(--stat-trend-up-color); }
  .stat-trend-down { color: var(--stat-trend-down-color); }
  .stat-trend-neutral { color: var(--stat-trend-neutral-color); }

  .stat-trend-icon {
    width: var(--icon-size-xs);
    height: var(--icon-size-xs);
    flex-shrink: 0;
  }

  .stat-trend-label {
    color: var(--color-text-muted);
  }

  /* ─── Icon ─── */
  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--stat-icon-size);
    height: var(--stat-icon-size);
    color: var(--stat-icon-color);
    flex-shrink: 0;
  }

  .stat-icon :global(svg) {
    width: 100%;
    height: 100%;
  }
</style>
