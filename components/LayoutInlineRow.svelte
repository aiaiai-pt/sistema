<script lang="ts">
  /**
   * Inline-row layout (#27 / S7).
   *
   * Parameters in each section are arranged in a single horizontal row
   * using auto-fit grid, suitable for compact admin runtime forms
   * (one-line filters, narrow inline panels). This is structurally
   * distinct from stacked-default — same parameter set produces a grid
   * with multiple columns instead of a vertical column. The S7
   * acceptance asserts the structural difference.
   */
  import Card from "./Card.svelte";
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

<div class="layout-inline" data-layout-shape="inline">
  {#each sections as section (section.name)}
    <Card variant="flat" class="section" role="group" aria-label={section.name}>
      <h4>{section.name}</h4>
      <div class="row">
        {#each section.items as parameter}
          <div class="field-cell">
            {@render field(parameter)}
          </div>
        {/each}
      </div>
    </Card>
  {/each}
</div>

<style>
  .layout-inline {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .layout-inline :global(.section) {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  /* The defining shape — auto-fit columns, NOT a vertical stack. The
     same parameter set renders as a multi-column grid here vs. one
     column in stacked-default. */
  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--space-md);
    align-items: end;
  }

  .field-cell {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 0;
  }

  h4 {
    margin: 0;
    font-size: var(--type-body-size);
  }
</style>
