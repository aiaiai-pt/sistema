<!--
  @component SkipLink

  Accessibility skip-to-content link — the first focusable element on a page.
  Visually hidden until focused, then slides into view. Lets keyboard and
  screen-reader users bypass repeated header/nav landmarks and jump straight
  to the main content (WCAG 2.4.1 Bypass Blocks). Part of the locked public
  site-shell chrome; `AppFrame` renders one automatically.

  The target must be a focusable element (e.g. `<main id="main" tabindex="-1">`,
  which `AppFrame` provides).

  @example Default (targets #main)
  <SkipLink />

  @example Custom target + localized label
  <SkipLink href="#content">{m.skip_to_content()}</SkipLink>
-->
<script>
  let {
    /** @type {string} Fragment id of the main-content target. */
    href = "#main",
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} Override the default label (for i18n). */
    children = undefined,
    ...rest
  } = $props();
</script>

<a class="skip-link {className}" {href} {...rest}>
  {#if children}{@render children()}{:else}Skip to main content{/if}
</a>

<style>
  .skip-link {
    position: absolute;
    left: var(--space-sm);
    /* Off-screen until focused — kept in the DOM + tab order, not display:none. */
    top: calc(-1 * var(--space-4xl) - var(--space-lg));
    z-index: 100;
    padding: var(--space-2xs) var(--space-sm);
    background: var(--color-accent);
    color: var(--color-text-on-accent);
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: top 150ms ease-out;
  }

  .skip-link:focus-visible {
    top: var(--space-sm);
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  @media (prefers-reduced-motion: reduce) {
    .skip-link {
      transition: none;
    }
  }
</style>
