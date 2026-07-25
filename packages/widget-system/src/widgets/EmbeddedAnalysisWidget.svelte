<!--
  @component EmbeddedAnalysisWidget — transport-neutral embedded analysis
  (S1.4 #59).

  Renders an `<iframe>` from an ALREADY-authorized, sanitised, short-lived URL
  the caller supplies as `props.src`. It knows NOTHING about signing, grants,
  resource ids, tenants, or bindings — the host mints the URL (a signed embed
  URL or a same-origin proxy route) and hands it over. This is the generic
  contract #59 ships; it is distinct from the Atelier renderer's coupled
  MetabaseEmbedWidget, which stays in place until the BFF-resolved trusted-embed
  seam exists (BD-META-01, Atelier-owned) — this widget does not replace it.

  Defence in depth: even though the caller is responsible for authorising the
  URL, `safeEmbedSrc` admits only an http(s) absolute URL or a root-relative
  path, so a malformed/hostile `src` (`javascript:`, `data:`, protocol-relative)
  can never reach the iframe. An absent or unsafe `src` renders the empty state
  (no iframe) rather than a broken frame.

  There is NO heuristic or silent fallback to a native chart or any other widget
  — this widget renders an embed or nothing.

  String-free (D9): the caption/title is caller-supplied via `props.title`.
  SSR-safe: no browser globals; `<iframe loading="lazy">` defers the network.
-->
<script lang="ts">
  import type { WidgetRenderRequest } from "../core/index.ts";
  import { safeEmbedSrc } from "./embed-url.ts";

  let { props }: WidgetRenderRequest = $props();

  const src = $derived(safeEmbedSrc(props.src));
  const title = $derived(typeof props.title === "string" ? props.title : undefined);
  const height = $derived(
    typeof props.height === "string" && props.height ? props.height : "400px",
  );
  const half = $derived(props.width === "half");
</script>

<figure class="ea-embed" class:half data-widget="embedded-analysis">
  {#if src}
    <iframe
      {src}
      {title}
      style:height
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
    {#if title}<figcaption>{title}</figcaption>{/if}
  {:else}
    <!-- Absent or unsafe src → empty state, never a broken iframe. -->
    <div class="ea-embed-empty" style:height data-widget-state="empty" role="status">
      {title ?? ""}
    </div>
  {/if}
</figure>

<style>
  .ea-embed {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    inline-size: 100%;
    /* Overflow: the frame is height-bounded; content beyond the box scrolls
       within the iframe rather than expanding the surface. */
    max-inline-size: 100%;
  }

  .ea-embed.half {
    max-inline-size: 50%;
  }

  .ea-embed iframe {
    inline-size: 100%;
    border: var(--elevation-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }

  .ea-embed figcaption {
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }

  .ea-embed-empty {
    display: grid;
    place-items: center;
    inline-size: 100%;
    border: var(--border-width) dashed var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-secondary);
    color: var(--color-text-muted);
    font-size: var(--type-body-sm-size);
  }
</style>
