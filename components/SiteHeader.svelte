<!--
  @component SiteHeader

  Public site banner landmark (`<header role="banner">`). Locked accessibility
  chrome for the citizen portal: a brand area, a primary navigation slot, and
  an actions slot (locale switch, sign-in). Structure and landmarks are fixed
  (conformance-checkable); only brand tokens vary per tenant via `data-theme`.

  Icon-agnostic, per DS convention — pass icons/logo as snippets.

  @example
  <SiteHeader>
    {#snippet brand()}<a href="/"><Logo /> Valongo</a>{/snippet}
    {#snippet nav()}<ServiceNavigation items={navItems} />{/snippet}
    {#snippet actions()}<LocaleSwitch /> <Button>Sign in</Button>{/snippet}
  </SiteHeader>
-->
<script>
  let {
    /** @type {string} aria-label for the primary nav (localize it). */
    navLabel = "Primary",
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Brand / logo area. */
    brand = undefined,
    /** @type {import('svelte').Snippet | undefined} Primary navigation links. */
    nav = undefined,
    /** @type {import('svelte').Snippet | undefined} Trailing actions (locale, auth). */
    actions = undefined,
    ...rest
  } = $props();
</script>

<header class="site-header {className}" {...rest}>
  <div class="site-header-inner">
    {#if brand}
      <div class="site-header-brand">{@render brand()}</div>
    {/if}
    {#if nav}
      <nav class="site-header-nav" aria-label={navLabel}>{@render nav()}</nav>
    {/if}
    {#if actions}
      <div class="site-header-actions">{@render actions()}</div>
    {/if}
  </div>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .site-header-inner {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    width: 100%;
    max-width: var(--content-width-wide);
    margin-inline: auto;
    padding: var(--space-sm) var(--content-padding-x);
  }

  .site-header-brand {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    color: var(--color-text);
  }

  /* The nav slot hosts a `ServiceNavigation` (data-driven, self-styled).
     The header doesn't style anchors itself — no descendant-anchor magic. */
  .site-header-nav {
    display: flex;
    align-items: center;
  }

  /* Push trailing actions to the far end regardless of nav presence. */
  .site-header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-inline-start: auto;
  }
</style>
