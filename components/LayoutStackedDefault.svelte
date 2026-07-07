<script lang="ts">
  /**
   * Default vertical-stack layout for the action renderer (#27 / S7).
   *
   * Each section is a labelled <fieldset>, parameters laid out as a
   * single-column flex column. This is the safe fallback for unknown
   * layout keys — see `resolve.ts`.
   *
   * #634 S3 — a section declaring `columns: 2` lays its cells on a
   * two-column grid; `span: full` params (and wide types — geo/file)
   * break out to the full row (the EntityFormSurface two-col precedent).
   * Default (columns 1 / absent) keeps the single-column stack
   * byte-identical.
   */
  import Card from "./Card.svelte";
  import { fieldSpansFull, type LayoutSection } from "./action-form-renderer-layouts";
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
      <div
        class="rows"
        class:two-col={(section.columns ?? 1) === 2}
        data-columns={section.columns ?? 1}
      >
        {#each section.items as parameter}
          <div
            class="field-row"
            class:span-full={fieldSpansFull(parameter, section.columns)}
          >
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

  /* #634 S3 — two-column density: half-width cells flow the grid,
     span-full cells break out to the whole row. Collapses back to one
     column on narrow viewports (the EntityFormSurface breakpoint). */
  .rows.two-col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--space-md);
    row-gap: var(--space-md);
  }

  .rows.two-col .field-row.span-full {
    grid-column: 1 / -1;
  }

  @media (max-width: 48rem) {
    .rows.two-col {
      grid-template-columns: 1fr;
    }
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
