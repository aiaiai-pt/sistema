<!--
  @component CaminhoStateChip

  A Badge-variant chip rendering the four verification states as WORDS.

  The four-state machine (H1 Slice 6 / verification surface):
    to-verify    — horizon not yet reached; awaiting observation
    verified     — observed and confirmed at the horizon
    not-verified — horizon passed; observation explicitly absent
    not-done     — path discarded; verification not applicable

  States are rendered as English words, not icons or abbreviations.
  Screen readers announce the full word; no icon-only encoding.

  Built over --badge-* component tokens. English-only canonical state names
  (shared-by-default doctrine — no urban vocabulary here).

  H1 Slice 2 — westeuropeco/atelier-urban-workspace#57.

  @example All four states
  <CaminhoStateChip state="to-verify" />
  <CaminhoStateChip state="verified" />
  <CaminhoStateChip state="not-verified" />
  <CaminhoStateChip state="not-done" />
-->
<script>
  /**
   * @typedef {'to-verify' | 'verified' | 'not-verified' | 'not-done'} CaminhoState
   */

  let {
    /** @type {CaminhoState} */
    state,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /** @type {Record<CaminhoState, string>} */
  const STATE_LABELS = {
    'to-verify':    'To verify',
    'verified':     'Verified',
    'not-verified': 'Not verified',
    'not-done':     'Not done',
  };

  const label = $derived(STATE_LABELS[state] ?? state);
</script>

<span class="caminho-chip caminho-chip-{state} {className}" {...rest}>
  {label}
</span>

<style>
  .caminho-chip {
    display: inline-flex;
    align-items: center;
    font-family: var(--badge-font);
    font-size: var(--badge-size);
    letter-spacing: var(--badge-tracking);
    border-radius: var(--badge-radius);
    padding: var(--badge-padding-y) var(--badge-padding-x);
    white-space: nowrap;
  }

  /* to-verify: informational — horizon pending */
  .caminho-chip-to-verify {
    background: var(--color-info-subtle);
    color: var(--color-info);
  }

  /* verified: success — observation confirmed */
  .caminho-chip-verified {
    background: var(--color-success-subtle);
    color: var(--color-success);
  }

  /* not-verified: destructive — horizon passed, no observation */
  .caminho-chip-not-verified {
    background: var(--color-destructive-subtle);
    color: var(--color-destructive);
  }

  /* not-done: neutral — path discarded, verification not applicable */
  .caminho-chip-not-done {
    background: var(--badge-neutral-bg);
    color: var(--badge-neutral-text);
  }
</style>
