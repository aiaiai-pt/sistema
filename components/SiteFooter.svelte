<!--
  @component SiteFooter

  Public site contentinfo landmark (`<footer role="contentinfo">`). Locked
  accessibility chrome for the citizen portal — holds legal links, tenant
  attribution, and secondary navigation. Structure fixed; brand varies via
  `data-theme`.

  @example
  <SiteFooter>
    {#snippet links()}
      <a href="/info/privacy">Privacy</a>
      <a href="/info/terms">Terms</a>
      <a href="/info/accessibility">Accessibility</a>
    {/snippet}
    {#snippet meta()}© 2026 Município de Valongo{/snippet}
  </SiteFooter>
-->
<script>
  let {
    /** @type {string} aria-label for the footer nav (localize it). */
    navLabel = "Footer",
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Footer navigation links. */
    links = undefined,
    /** @type {import('svelte').Snippet | undefined} Attribution / fine print. */
    meta = undefined,
    /** @type {import('svelte').Snippet | undefined} Free-form content (overrides links/meta layout). */
    children = undefined,
    ...rest
  } = $props();
</script>

<footer class="site-footer {className}" {...rest}>
  <div class="site-footer-inner">
    {#if children}
      {@render children()}
    {:else}
      {#if links}
        <nav class="site-footer-nav" aria-label={navLabel}>{@render links()}</nav>
      {/if}
      {#if meta}
        <p class="site-footer-meta">{@render meta()}</p>
      {/if}
    {/if}
  </div>
</footer>

<style>
  .site-footer {
    background: var(--color-surface-secondary);
    border-top: 1px solid var(--color-border);
    color: var(--color-text-secondary);
  }

  .site-footer-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    width: 100%;
    max-width: var(--content-width-wide);
    margin-inline: auto;
    padding: var(--space-xl) var(--content-padding-x);
  }

  /* The links slot hosts `Link` components (self-styled) — no descendant-anchor
     magic here either. */
  .site-footer-nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .site-footer-meta {
    margin: 0;
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }
</style>
