<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Link from "$ui/Link.svelte";
  import ServiceNavigation from "$ui/ServiceNavigation.svelte";
  import Hero from "$ui/Hero.svelte";
  import ContentBlock from "$ui/ContentBlock.svelte";
  import SiteHeader from "$ui/SiteHeader.svelte";
  import SiteFooter from "$ui/SiteFooter.svelte";
  import StatusTimeline from "$ui/StatusTimeline.svelte";
  import WidgetGrid from "$ui/WidgetGrid.svelte";
  import Card from "$ui/Card.svelte";
  import StatCard from "$ui/StatCard.svelte";
  import VotingWidget from "$ui/VotingWidget.svelte";

  const proposals = [
    { id: "riverside", label: "Riverside walking path", votes: 412 },
    { id: "playground", label: "School playground renewal", votes: 268 },
    { id: "lighting", label: "Old-town street lighting", votes: 153 },
  ];
  let demoVote = $state<string | undefined>(undefined);

  const timelineSteps = [
    { label: "Submitted", status: "complete" as const, timestamp: "12 May 2026" },
    { label: "Under review", status: "complete" as const, timestamp: "13 May 2026" },
    { label: "In progress", status: "current" as const, description: "A crew has been assigned to your street." },
    { label: "Resolved", status: "upcoming" as const },
  ];

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
  <h2 class="type-heading" style="margin-bottom: var(--space-md);">Hero with background image</h2>
  <p class="type-body-sm" style="margin-bottom: var(--space-md);">An <code class="type-data">image</code> renders cover/center under the <code class="type-data">--hero-scrim</code> overlay — a surface-tinted (theme-following) scrim, so the text tokens keep their contrast on any photo. Raise the scrim mix for busier imagery.</p>
  <div style="border:1px solid var(--color-border); border-radius: var(--radius-md); overflow:hidden;">
    <Hero
      title="Report a problem in Valongo"
      subtitle="The scrim keeps this readable over the photo."
      headingLevel={2}
      image="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%234a7c59'/%3E%3Cstop offset='0.6' stop-color='%23856a3d'/%3E%3Cstop offset='1' stop-color='%23403428'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='300' fill='url(%23g)'/%3E%3Ccircle cx='650' cy='70' r='40' fill='%23f2e8d5' opacity='0.7'/%3E%3C/svg%3E"
    />
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

<section style="margin-bottom: var(--space-2xl);">
  <h2 class="type-heading" style="margin-bottom: var(--space-md);">StatusTimeline</h2>
  <p style="margin-bottom: var(--space-md);">
    Ordered <code>&lt;ol&gt;</code> progress timeline for the <code>tracker</code> page. The current step gets
    <code>aria-current="step"</code>; each step announces a visually-hidden state label (localizable for the portal's i18n).
  </p>
  <div style="border:1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-xl); max-width: var(--content-width-narrow);">
    <StatusTimeline label="Report progress" steps={timelineSteps} />
  </div>
</section>

<section style="margin-bottom: var(--space-2xl);">
  <h2 class="type-heading" style="margin-bottom: var(--space-md);">WidgetGrid</h2>
  <p style="margin-bottom: var(--space-md);">
    Dashboard layout for <code>landing</code> / information-portal pages. Children opt into width with
    <code>widget-span-2</code> / <code>widget-span-full</code>. Resize to see it fold to two columns, then one.
  </p>
  <div style="border:1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-xl);">
    <WidgetGrid columns="3">
      <Card class="widget-span-2">
        <Hero title="Participate in Valongo" subtitle="Open consultations, reports, and local budget voting." />
      </Card>
      <StatCard value="1 284" label="Reports resolved" variant="success" />
      <StatCard value="7" label="Open consultations" variant="info" />
      <StatCard value="312" label="Votes this week" variant="neutral" />
      <Card class="widget-span-full">
        <strong>Recent activity</strong>
        <p style="margin: var(--space-xs) 0 0; color: var(--color-text-secondary);">
          A full-width widget — e.g. a map or an activity feed spanning the whole row.
        </p>
      </Card>
    </WidgetGrid>
  </div>
</section>

<section style="margin-bottom: var(--space-2xl);">
  <h2 class="type-heading" style="margin-bottom: var(--space-md);">VotingWidget</h2>
  <p style="margin-bottom: var(--space-md);">
    Valongo V10 participation primitive. A <code>&lt;fieldset&gt;</code> radio group; the portal wires
    <code>onsubmit</code> to the BFF voting placement and renders the bot challenge into the <code>captcha</code> slot.
  </p>
  <WidgetGrid columns="3">
    <Card>
      <VotingWidget
        question="Which project should Valongo fund first?"
        name="demo-open"
        options={proposals}
        bind:selected={demoVote}
      />
    </Card>
    <Card>
      <VotingWidget
        question="Results so far"
        name="demo-results"
        options={proposals}
        submitted
        showResults
        submittedLabel="Thanks — your vote is counted."
      >
        {#snippet receipt()}
          <code style="font-size: var(--type-data-size); color: var(--color-text-muted);">Receipt: vlg-7f3a-9c21</code>
        {/snippet}
      </VotingWidget>
    </Card>
    <Card>
      <VotingWidget
        question="Should the market move to Saturdays?"
        name="demo-closed"
        options={[{ id: "yes", label: "Yes", votes: 640 }, { id: "no", label: "No", votes: 210 }]}
        closed
        showResults
        closedLabel="Voting closed on 30 May 2026."
      />
    </Card>
  </WidgetGrid>
</section>
