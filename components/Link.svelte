<!--
  @component Link

  A text hyperlink. Two variants, following the Carbon convention:
   - `inline` (default): used inside sentences/prose — always underlined so it's
     distinguishable from surrounding text.
   - `standalone`: used on its own after content (lists, CTAs, footers) —
     underlined only on hover/focus.

  Accessibility:
   - A link with no (or empty) `href` is NOT a link — it renders a
     non-interactive `<span aria-current="page">` (the canonical "you are here"
     treatment) instead of a keyboard-trap `<a>` with no destination.
   - `external` adds `target="_blank"` + `rel="noopener noreferrer"`.
   - Visible focus ring on `:focus-visible`.

  @example Inline (prose)
  Read our <Link href="/info/privacy">privacy policy</Link>.

  @example Standalone CTA
  <Link href="/report" variant="standalone">Report a problem</Link>

  @example Current page (no href → rendered as non-interactive)
  <Link current>Home</Link>
-->
<script>
  let {
    /** @type {string | undefined} Destination. Falsy → rendered as a non-interactive span. */
    href = undefined,
    /** @type {'inline' | 'standalone'} */
    variant = "inline",
    /** @type {boolean} Marks the current page (`aria-current="page"`). */
    current = false,
    /** @type {boolean} Open in a new tab with safe rel. */
    external = false,
    /** @type {string} */
    class: className = "",
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  const isLink = $derived(typeof href === "string" && href.length > 0);
  const externalAttrs = $derived(
    external ? { target: "_blank", rel: "noopener noreferrer" } : {},
  );
</script>

{#if isLink}
  <a
    {href}
    class="link link-{variant} {className}"
    aria-current={current ? "page" : undefined}
    {...externalAttrs}
    {...rest}
  >
    {#if children}{@render children()}{/if}
  </a>
{:else}
  <!-- No destination → not a link. Non-interactive, still announces "current". -->
  <span class="link link-{variant} link-static {className}" aria-current={current ? "page" : undefined} {...rest}>
    {#if children}{@render children()}{/if}
  </span>
{/if}

<style>
  .link {
    color: var(--color-accent);
    border-radius: var(--radius-sm);
  }

  .link-inline {
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }

  .link-standalone {
    text-decoration: none;
  }
  .link-standalone:hover {
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }

  a.link:hover {
    color: var(--color-accent-hover);
  }

  a.link:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* Non-interactive (current/no-href): inherit text colour, no affordance. */
  .link-static {
    color: var(--color-text);
    text-decoration: none;
    cursor: default;
  }
</style>
