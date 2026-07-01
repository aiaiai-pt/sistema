<script lang="ts">
  import type { WidgetProps } from "./types";

  // `embed` widget (#517, atelier) — a Metabase analytics embed on the unified
  // dashboard/portal `Block[]` grid. PRESENTATION-ONLY: the DS never mints or
  // holds a Metabase URL; the HOST resolves the signed/proxy URL and passes it
  // as `props.src` (an `/internal/metabase-embed/…` route or a signed URL), and
  // this widget renders an `<iframe>`. Presentational kind → `resolveData`
  // short-circuits it (no DS fetch); the widget owns its props.
  //
  //   props.src         — the iframe URL (host-resolved). Absent ⇒ placeholder.
  //   props.title       — accessible iframe title / caption.
  //   props.height      — CSS height (e.g. "400px"); defaults to 400px.
  //   props.width       — "full" | "half" (grid-agnostic max-width hint).
  //   props.embed_type  — "dashboard" | "question" (informational; caption).
  let { props }: WidgetProps = $props();

  const src = $derived(typeof props.src === "string" ? props.src : "");
  const title = $derived(typeof props.title === "string" && props.title ? props.title : "Metabase embed");
  const height = $derived(typeof props.height === "string" && props.height ? props.height : "400px");
  const half = $derived(props.width === "half");
</script>

<figure class="mb-embed" class:half data-widget="metabase-embed">
  {#if src}
    <iframe {src} {title} style:height loading="lazy" referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
    {#if props.title}<figcaption>{props.title}</figcaption>{/if}
  {:else}
    <div class="mb-embed-empty" style:height>
      <p>Metabase embed not configured — set the dashboard/question id.</p>
    </div>
  {/if}
</figure>

<style>
  .mb-embed {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    inline-size: 100%;
  }

  .mb-embed.half {
    max-inline-size: 50%;
  }

  .mb-embed iframe {
    inline-size: 100%;
    border: var(--elevation-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }

  .mb-embed figcaption {
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }

  .mb-embed-empty {
    display: grid;
    place-items: center;
    inline-size: 100%;
    border: var(--border-width) dashed var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-secondary);
  }

  .mb-embed-empty p {
    margin: 0;
    padding: var(--space-md);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
  }
</style>
