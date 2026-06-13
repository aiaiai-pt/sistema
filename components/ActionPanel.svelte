<!--
  @component ActionPanel

  A config-driven vertical stack of detail-page call-to-action buttons —
  vote / support / comment / acknowledge / reserve … Vertical-agnostic: every
  CTA is data ({ label, href, icon?, variant?, disabled?, reason? }).

  Presentational only — the consumer decides each CTA's enabled/disabled state
  and the reason it's closed (grant or row-state). An ENABLED CTA renders as a
  link (it navigates to the action form); a CLOSED CTA renders as a disabled
  control with its reason as VISIBLE, programmatically-associated helper text
  (`aria-describedby`) — never a dead button. Decorative icons are aria-hidden.

  Consumes semantic tokens (`--space-*`, `--color-*`) so dark / high-contrast
  schemes (#244) ride through without per-component token entries.

  @example
  <ActionPanel actions={[
    { key: 'vote', label: 'Vote for this proposal', href: '/submit/vote', icon: ThumbsUpIcon },
    { key: 'support', label: 'Support', disabled: true, reason: 'Voting has closed.' },
  ]} />
-->
<script module>
  let _actionPanelUid = 0;
  /**
   * @typedef {{
   *   key?: string,
   *   label: string,
   *   href?: string,
   *   icon?: import('svelte').Component,
   *   variant?: 'primary' | 'secondary' | 'ghost' | 'destructive',
   *   disabled?: boolean,
   *   reason?: string,
   * }} ActionPanelItem
   */
</script>

<script>
  import Button from './Button.svelte';

  let {
    /** @type {ActionPanelItem[]} The CTAs to render, in order. */
    actions = [],
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const uid = `action-panel-${_actionPanelUid++}`;
</script>

{#if actions.length > 0}
  <div class="action-panel {className}" {...rest}>
    {#each actions as action, i (action.key ?? i)}
      {@const Icon = action.icon}
      {@const isClosed = action.disabled === true || !action.href}
      {@const reasonId =
        action.disabled === true && action.reason ? `${uid}-reason-${i}` : undefined}
      <div class="action-panel-item">
        <Button
          variant={action.variant ?? 'primary'}
          href={isClosed ? undefined : action.href}
          disabled={isClosed}
          class="action-panel-btn"
          aria-describedby={reasonId}
        >
          {#if Icon}<span class="action-panel-icon" aria-hidden="true"><Icon /></span>{/if}
          {action.label}
        </Button>
        {#if action.disabled === true && action.reason}
          <p class="action-panel-reason" id={reasonId}>{action.reason}</p>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .action-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .action-panel-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  /* Ficha CTAs read as a stacked column — each button spans the panel. */
  .action-panel :global(.action-panel-btn) {
    width: 100%;
  }

  .action-panel-icon {
    display: inline-flex;
    align-items: center;
  }

  .action-panel-icon :global(svg) {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }

  .action-panel-reason {
    margin: 0;
    font-size: var(--type-body-sm-size);
    color: var(--color-text-secondary);
  }
</style>
