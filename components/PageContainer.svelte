<!--
  @component PageContainer

  Content container for page-level layout. Centers content with max-width
  and consistent horizontal/vertical padding. Used inside an app shell's
  main content area — one per page.

  Uses semantic content-width and content-padding tokens from semantic.css.

  @example Default (standard content width)
  <PageContainer>
    <h1>Page Title</h1>
    <p>Content here</p>
  </PageContainer>

  @example Narrow (forms, settings)
  <PageContainer size="narrow">
    <SettingsForm />
  </PageContainer>

  @example Wide (dashboards, data tables)
  <PageContainer size="wide">
    <DataTable />
  </PageContainer>

  @example Fluid (no max-width)
  <PageContainer size="full">
    <CanvasEditor />
  </PageContainer>
-->
<script>
  let {
    /** @type {'narrow' | 'default' | 'wide' | 'full'} */
    size = 'wide',
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();
</script>

<div
  class="page-container page-container-{size} {className}"
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .page-container {
    width: 100%;
    margin-inline: auto;
    padding: var(--content-padding-y) var(--content-padding-x);
  }

  .page-container-narrow {
    max-width: var(--content-width-narrow);
  }

  .page-container-default {
    max-width: var(--content-width);
  }

  .page-container-wide {
    max-width: var(--content-width-wide);
  }

  .page-container-full {
    max-width: var(--content-width-full);
  }
</style>
