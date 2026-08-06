<!--
  @component DefinitionMembersCardWidget — a member list that cannot be naked.

  THE LAW: members are never a naked list. A set of rows with no statement of
  where the set came from is an assertion wearing the costume of a fact — the
  reader cannot tell a curated selection from a query result from a stale cache.
  So the provenance header is MANDATORY and this widget throws without it, the
  same refusal SealChip makes for an unsealed value.

  The header is real DOM text above the list, in reading order before any member,
  so it survives copy, quotation and export and a screen reader reaches it first.
  It is not a tooltip and not a footnote.

  IT NEVER FETCHES. Drill and expand are CALLBACKS; the host owns transport,
  authorization and paging. `count` is the caller's own total — this widget never
  infers it from `members.length`, because a truncated page would then quietly
  under-report the set.

  Rows: `member.label` renders by default so the widget works on the registry
  dispatch path, which cannot carry snippets. A `row` snippet overrides it for
  direct composition.

  String-free (D9) and vocabulary-free: every visible word, including the expand
  and drill affordances and the count phrasing, is caller-supplied.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { WidgetRenderRequest } from "../core/index";

  /** One member row. `ref` is opaque and echoed back to callbacks untouched. */
  interface Member {
    /** Already formatted by the host — never formatted here. */
    label: string;
    /** Optional secondary line, caller-supplied. */
    detail?: string;
    ref?: unknown;
  }

  interface Props extends WidgetRenderRequest {
    /** Optional per-row renderer for direct composition (not dispatch-safe). */
    row?: Snippet<[Member, number]>;
  }

  let { data, props, row }: Props = $props();

  const members = $derived.by((): Member[] => {
    const list = (data as { members?: unknown } | null)?.members;
    return Array.isArray(list) ? (list as Member[]) : [];
  });

  /**
   * BOUNDARY GUARD — members are never a naked list.
   *
   * A missing provenance header is not a cosmetic gap: it is the difference
   * between "these twelve rows are the answer" and "these twelve rows came from
   * somewhere nobody recorded". Refusing to render is the only outcome that
   * cannot be misread.
   */
  const provenance = $derived(
    typeof props?.provenance === "string" ? props.provenance.trim() : "",
  );

  const assertProvenance = (line: string) => {
    if (line === "") {
      throw new Error(
        "[DefinitionMembersCardWidget] A member list must declare its provenance. " +
          "Pass props.provenance (caller-supplied prose naming where this set came " +
          "from). Members are never a naked list.",
      );
    }
  };

  assertProvenance(provenance);
  $effect(() => assertProvenance(provenance));

  const title = $derived(
    typeof props?.title === "string" ? props.title : undefined,
  );
  /** The caller's own total, already phrased — e.g. «12 membros». */
  const countLabel = $derived(
    typeof props?.countLabel === "string" ? props.countLabel : undefined,
  );
  const expandLabel = $derived(
    typeof props?.expandLabel === "string" ? props.expandLabel : undefined,
  );
  const drillLabel = $derived(
    typeof props?.drillLabel === "string" ? props.drillLabel : undefined,
  );
  const emptyLabel = $derived(
    typeof props?.emptyLabel === "string" ? props.emptyLabel : undefined,
  );

  const onExpand = $derived(
    typeof props?.onExpand === "function"
      ? (props.onExpand as () => void)
      : undefined,
  );
  const onDrill = $derived(
    typeof props?.onDrill === "function"
      ? (props.onDrill as (ref: unknown) => void)
      : undefined,
  );

  const listId = $props.id();
</script>

<section class="definition-members-card" aria-labelledby={title ? `${listId}-t` : undefined}>
  <header class="definition-members-card-head">
    {#if title}
      <h3 id="{listId}-t" class="definition-members-card-title">{title}</h3>
    {/if}
    <!--
      The provenance header. First in reading order, above every member —
      the law made structural rather than advisory.
    -->
    <p class="definition-members-card-provenance">{provenance}</p>
    {#if countLabel}
      <p class="definition-members-card-count">{countLabel}</p>
    {/if}
  </header>

  {#if members.length > 0}
    <ul class="definition-members-card-list">
      {#each members as member, i (member.ref ?? i)}
        <li class="definition-members-card-item">
          {#if row}
            {@render row(member, i)}
          {:else if onDrill && drillLabel}
            <button
              type="button"
              class="definition-members-card-row definition-members-card-row-action"
              onclick={() => onDrill?.(member.ref)}
            >
              <span class="definition-members-card-label">{member.label}</span>
              {#if member.detail}<span class="definition-members-card-detail"
                  >{member.detail}</span
                >{/if}
            </button>
          {:else}
            <div class="definition-members-card-row">
              <span class="definition-members-card-label">{member.label}</span>
              {#if member.detail}<span class="definition-members-card-detail"
                  >{member.detail}</span
                >{/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {:else if emptyLabel}
    <p class="definition-members-card-empty">{emptyLabel}</p>
  {/if}

  {#if expandLabel && onExpand}
    <button type="button" class="definition-members-card-expand" onclick={() => onExpand?.()}
      >{expandLabel}</button
    >
  {/if}
</section>

<style>
  .definition-members-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--stat-padding);
    border: var(--stat-border);
    border-radius: var(--stat-radius);
    background: var(--stat-bg);
  }

  .definition-members-card-head {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  .definition-members-card-title {
    margin: 0;
    font-family: var(--type-overline-font);
    font-size: var(--type-overline-size);
    font-weight: var(--type-overline-weight);
    letter-spacing: var(--type-overline-tracking);
    text-transform: uppercase;
    color: var(--stat-label-color);
  }

  /* Provenance is part of the record, not a caption — it reads at body weight. */
  .definition-members-card-provenance {
    margin: 0;
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    line-height: var(--type-caption-leading);
    color: var(--color-text-secondary);
  }

  .definition-members-card-count {
    margin: 0;
    font-family: var(--type-data-font);
    font-size: var(--type-data-size);
    color: var(--color-text-muted);
  }

  .definition-members-card-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  .definition-members-card-item + .definition-members-card-item {
    border-top: var(--elevation-border);
  }

  .definition-members-card-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-xs) 0;
    text-align: left;
  }

  .definition-members-card-row-action {
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .definition-members-card-row-action:focus-visible,
  .definition-members-card-expand:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }

  .definition-members-card-label {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text);
  }

  .definition-members-card-detail {
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }

  .definition-members-card-empty {
    margin: 0;
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }

  .definition-members-card-expand {
    align-self: flex-start;
    padding: 0;
    border: none;
    background: none;
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-accent);
    cursor: pointer;
  }
</style>
