<!--
  @component ChartTileMockWidget — an openly-declared placeholder chart face.

  A board with a hole in it reads as broken; a board with a mock that looks real
  reads as WORKING, which is worse. This widget exists so surfaces are not voids
  before real charts land, and its whole contract is that nobody — sighted,
  screen-reader, or screenshot-reader — can mistake it for data.

  Hence the LAW it enforces: a mock face may not render without a visible
  earmark. `earmarkLabel` is required and the widget throws without it. The
  earmark is real text in the DOM (not a watermark, not a CSS pseudo-element),
  so it survives copy, quotation, export and screen readers — the same reasoning
  as the evidence seal riding the datum.

  The bars are DECORATIVE and carry no numbers. `data` is accepted and
  deliberately ignored for the shape of the bars: rendering caller data at a
  plausible scale is exactly how a mock stops being obviously a mock. The bar
  heights come from a fixed, arbitrary ramp.

  String-free (D9): every visible word is caller-supplied. This package ships no
  copy of its own, and no vocabulary.

  Real charts are the native-chart widget and the product's charting path; this
  face names its own replacement via `replacementRef` so the debt is legible in
  the UI rather than only in a backlog.
-->
<script lang="ts">
  import type { WidgetRenderRequest } from "../core/index";

  let { props }: WidgetRenderRequest = $props();

  /**
   * BOUNDARY GUARD — a mock never renders unmarked.
   *
   * The failure this prevents is silent and expensive: a placeholder that looks
   * like a chart gets read as a finding, screenshotted, and quoted. Refusing to
   * render is the only outcome that cannot be mistaken.
   */
  const earmarkLabel = $derived(
    typeof props?.earmarkLabel === "string" ? props.earmarkLabel.trim() : "",
  );

  const assertEarmarked = (label: string) => {
    if (label === "") {
      throw new Error(
        "[ChartTileMockWidget] A mock chart face must carry a visible earmark. " +
          "Pass props.earmarkLabel (caller-supplied copy). An unmarked mock is " +
          "indistinguishable from real data, which is the failure this widget exists to prevent.",
      );
    }
  };

  assertEarmarked(earmarkLabel);
  $effect(() => assertEarmarked(earmarkLabel));

  /** Optional caller copy. Absent ones simply do not render — no defaults. */
  const caption = $derived(
    typeof props?.caption === "string" ? props.caption : undefined,
  );
  const replacementRef = $derived(
    typeof props?.replacementRef === "string" ? props.replacementRef : undefined,
  );
  const replacementLabel = $derived(
    typeof props?.replacementLabel === "string"
      ? props.replacementLabel
      : undefined,
  );

  /**
   * A fixed arbitrary ramp — deliberately NOT derived from `data`. Decorative
   * only, and hidden from assistive tech: there is nothing here to read.
   */
  const BARS = [38, 62, 45, 78, 55, 84, 49];
</script>

<div class="chart-tile-mock" data-earmarked="true">
  <div class="chart-tile-mock-head">
    {#if caption}
      <span class="chart-tile-mock-caption">{caption}</span>
    {/if}
    <!-- Real text, not decoration: it must survive copy, export and AT. -->
    <span class="chart-tile-mock-earmark">{earmarkLabel}</span>
  </div>

  <div class="chart-tile-mock-plot" aria-hidden="true">
    {#each BARS as height, i (i)}
      <span class="chart-tile-mock-bar" style="height: {height}%"></span>
    {/each}
  </div>

  {#if replacementRef}
    <p class="chart-tile-mock-replacement">
      {#if replacementLabel}<span>{replacementLabel}</span>{/if}
      <code>{replacementRef}</code>
    </p>
  {/if}
</div>

<style>
  .chart-tile-mock {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--stat-padding);
    border: var(--elevation-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-secondary);
  }

  .chart-tile-mock-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-sm);
  }

  .chart-tile-mock-caption {
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    font-weight: var(--type-label-weight);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-text-secondary);
  }

  /* The earmark reads as a warning, and reads at all — never a faint watermark. */
  .chart-tile-mock-earmark {
    font-family: var(--type-overline-font);
    font-size: var(--type-overline-size);
    font-weight: var(--type-overline-weight);
    letter-spacing: var(--type-overline-tracking);
    text-transform: uppercase;
    padding: var(--badge-padding-y) var(--badge-padding-x);
    border-radius: var(--badge-radius);
    background: var(--color-warning-subtle);
    color: var(--color-warning);
    white-space: nowrap;
  }

  .chart-tile-mock-plot {
    display: flex;
    align-items: flex-end;
    gap: var(--space-2xs);
    height: var(--space-4xl);
  }

  .chart-tile-mock-bar {
    flex: 1;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    /* Muted on purpose: a mock should look unfinished, not designed. */
    background: var(--color-border);
  }

  .chart-tile-mock-replacement {
    margin: 0;
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    line-height: var(--type-caption-leading);
    color: var(--color-text-muted);
  }

  .chart-tile-mock-replacement code {
    font-family: var(--type-data-font);
  }
</style>
