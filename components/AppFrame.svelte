<!--
  @component AppFrame

  The locked public site-shell scaffold: skip-link → header → a single `<main>`
  landmark → footer, in fixed DOM (= reading) order. This is the
  accessibility-by-construction frame for the citizen portal — every page is
  wrapped in exactly one AppFrame, guaranteeing one main landmark, a working
  skip target, and linear reading order (ARTE Silver / WCAG 1.3.2, 2.4.1).
  Structure is frozen and conformance-checkable; only brand tokens vary per
  tenant via `data-theme`.

  `header` and `footer` are slots so a tenant composes `SiteHeader` / `SiteFooter`
  with its own brand + nav; the page content is the default `children`.

  @example
  <AppFrame>
    {#snippet header()}<SiteHeader>…</SiteHeader>{/snippet}
    {#snippet footer()}<SiteFooter>…</SiteFooter>{/snippet}
    <PageContainer>{@render page()}</PageContainer>
  </AppFrame>
-->
<script>
  import SkipLink from "./SkipLink.svelte";

  let {
    /** @type {string} id of the main landmark (skip-link target). */
    mainId = "main",
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Override the default skip link (e.g. localized). */
    skipLink = undefined,
    /** @type {import('svelte').Snippet | undefined} Site banner (compose `SiteHeader`). */
    header = undefined,
    /** @type {import('svelte').Snippet | undefined} Site footer (compose `SiteFooter`). */
    footer = undefined,
    /** @type {import('svelte').Snippet | undefined} Page content (rendered inside `<main>`). */
    children = undefined,
    ...rest
  } = $props();
</script>

<div class="app-frame {className}" {...rest}>
  {#if skipLink}{@render skipLink()}{:else}<SkipLink href={`#${mainId}`} />{/if}

  {#if header}{@render header()}{/if}

  <!-- Single main landmark + focus target for the skip link. tabindex=-1 so
       the skip link can move focus here without making it tabbable otherwise. -->
  <main id={mainId} tabindex="-1" class="app-frame-main">
    {#if children}{@render children()}{/if}
  </main>

  {#if footer}{@render footer()}{/if}
</div>

<style>
  .app-frame {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--color-surface);
    color: var(--color-text);
  }

  /* Main grows to push the footer down; the focus target shows no outline box
     (focus is programmatic via the skip link, not a visible widget). */
  .app-frame-main {
    flex: 1 0 auto;
  }

  .app-frame-main:focus {
    outline: none;
  }
</style>
