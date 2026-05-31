<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Link from "$ui/Link.svelte";
  import ServiceNavigation from "$ui/ServiceNavigation.svelte";
  import Hero from "$ui/Hero.svelte";
  import ContentBlock from "$ui/ContentBlock.svelte";
  import SiteHeader from "$ui/SiteHeader.svelte";
  import SiteFooter from "$ui/SiteFooter.svelte";

  // Demo hrefs are external placeholders so the statically-prerendered docs
  // site doesn't crawl/validate portal routes that only exist in the portal app.
  const navItems = [
    { href: "https://example.org/report", label: "Report a problem" },
    { href: "https://example.org/track", label: "Track a report", current: true },
    { href: "https://example.org/privacy", label: "Privacy" },
  ];
</script>

<svelte:head><title>Portal shell — aiaiai Design System</title></svelte:head>

<PageHeader
  title="Portal shell"
  description="Locked, accessibility-by-construction site chrome for the citizen portal (GOV.UK / Designers Italia patterns). AppFrame · SiteHeader · SiteFooter · SkipLink · ServiceNavigation · Link · Hero · ContentBlock. Structure is frozen and conformance-checkable; only brand tokens vary per tenant via data-theme."
/>

<section style="margin-bottom: var(--space-2xl);">
  <h2 class="type-heading" style="margin-bottom: var(--space-md);">Link</h2>
  <p>Inline (in prose): read our <Link href="https://example.org/privacy">privacy policy</Link> before submitting.</p>
  <div class="demo-row" style="gap: var(--space-lg); align-items:center;">
    <Link href="https://example.org/report" variant="standalone">Standalone link</Link>
    <Link href="https://example.org" variant="standalone" external>External link ↗</Link>
    <Link current>Current page (no href → non-interactive span)</Link>
  </div>
  <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">
    A Link with no <code>href</code> renders a non-interactive <code>&lt;span aria-current="page"&gt;</code> — never a keyboard-trap empty anchor.
  </p>
</section>

<section style="margin-bottom: var(--space-2xl);">
  <h2 class="type-heading" style="margin-bottom: var(--space-md);">ServiceNavigation</h2>
  <p style="margin-bottom: var(--space-sm);">Data-driven; the current item gets <code>aria-current="page"</code>. Resize below 768px for the disclosure toggle.</p>
  <ServiceNavigation label="Demo" items={navItems} menuId="demo-nav" />
  <p style="color: var(--color-text-muted); margin-top: var(--space-md);">
    Empty items renders nothing (no empty nav landmark) — an empty ServiceNavigation follows this line:
  </p>
  <ServiceNavigation label="Empty" items={[]} menuId="demo-nav-empty" />
</section>

<section style="margin-bottom: var(--space-2xl);">
  <h2 class="type-heading" style="margin-bottom: var(--space-md);">SiteHeader (composed)</h2>
  <div style="border:1px solid var(--color-border); border-radius: var(--radius-md); overflow:hidden;">
    <SiteHeader>
      {#snippet brand()}<strong>Município de Valongo</strong>{/snippet}
      {#snippet nav()}<ServiceNavigation label="Primary" items={navItems} menuId="demo-header-nav" />{/snippet}
    </SiteHeader>
  </div>
</section>

<section style="margin-bottom: var(--space-2xl);">
  <h2 class="type-heading" style="margin-bottom: var(--space-md);">Hero</h2>
  <div style="border:1px solid var(--color-border); border-radius: var(--radius-md); overflow:hidden;">
    <Hero title="Report a problem in Valongo" subtitle="Potholes, lighting, waste — in two minutes." />
  </div>
</section>

<section style="margin-bottom: var(--space-2xl);">
  <h2 class="type-heading" style="margin-bottom: var(--space-md);">ContentBlock + SiteFooter</h2>
  <div style="border:1px solid var(--color-border); border-radius: var(--radius-md); overflow:hidden;">
    <ContentBlock title="Privacy Policy">
      <p>We respect your data and process reports per RGPD.</p>
      <h2>What we collect</h2>
      <p>Only what's needed to act on your report.</p>
    </ContentBlock>
    <SiteFooter>
      {#snippet links()}
        <Link href="https://example.org/privacy" variant="standalone">Privacy</Link>
        <Link href="https://example.org/terms" variant="standalone">Terms</Link>
      {/snippet}
      {#snippet meta()}© 2026 Município de Valongo{/snippet}
    </SiteFooter>
  </div>
</section>
