<script lang="ts">
  /**
   * Compact-mobile layout (#27 / S7).
   *
   * Sections collapse into a single tight column with reduced padding
   * and smaller meta. Used by `public_submit` placements that target
   * narrow viewports (citizen mobile portal). Structurally a single
   * column like stacked-default, but distinguishable by reduced gap +
   * absent section card chrome — section labels become inline headings
   * so the form reads denser on mobile.
   */
  import type { LayoutSection } from "./action-form-renderer-layouts";
  import type { Snippet } from "svelte";

  let {
    sections,
    field,
  }: {
    sections: LayoutSection[];
    field: Snippet<[Record<string, unknown>]>;
  } = $props();
</script>

<div class="layout-compact" data-layout-shape="compact">
  {#each sections as section (section.name)}
    <section class="compact-section" aria-label={section.name}>
      <h5>{section.name}</h5>
      {#each section.items as parameter}
        <div class="field-row">
          {@render field(parameter)}
        </div>
      {/each}
    </section>
  {/each}
</div>

<style>
  /* Single tight column — distinguishable from stacked-default by:
     1. No Card chrome around sections (HTML <section>, not DS Card),
     2. Compact gap and padding,
     3. <h5> heading not <h4>. */
  .layout-compact {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .compact-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-xs) 0;
    border-bottom: var(--elevation-border);
  }

  .compact-section:last-child {
    border-bottom: 0;
  }

  .compact-section h5 {
    margin: 0;
    font-size: var(--type-caption-size);
    /* #63 typography — uppercase reserved for code tokens. */
    color: var(--color-text-muted);
  }

  .field-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
</style>
