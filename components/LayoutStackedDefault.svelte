<script lang="ts">
  /**
   * Default vertical-stack layout for the action renderer (#27 / S7).
   *
   * Each section is a labelled <fieldset>, parameters laid out as a
   * single-column flex column. This is the safe fallback for unknown
   * layout keys — see `resolve.ts`.
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

<div class="layout-stacked" data-layout-shape="stacked">
  {#each sections as section (section.name)}
    <Card variant="flat" class="section" role="group" aria-label={section.name}>
      <h4>{section.name}</h4>
      <div class="rows">
        {#each section.items as parameter}
          <div class="field-row">
            {@render field(parameter)}
          </div>
        {/each}
      </div>
    </Card>
  {/each}
</div>

<style>
  .layout-stacked {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .layout-stacked :global(.section) {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .field-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  h4 {
    margin: 0;
    font-size: var(--type-body-size);
  }
</style>
