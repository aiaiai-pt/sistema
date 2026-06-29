<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import SiteHeader from "$ui/SiteHeader.svelte";
  import ServiceNavigation from "$ui/ServiceNavigation.svelte";
  import SectionNavigation from "$ui/SectionNavigation.svelte";

  // Sample of the portal's operator `nav_links` shape: a flat list grouped by
  // `groupHref`. The derivations below mirror the portal layout 1:1.
  type Link = {
    group?: string;
    groupHref?: string;
    href: string;
    label: string;
  };
  const navLinks: Link[] = [
    { group: "Ocorrências", groupHref: "/ocorrencias", href: "/ocorrencias/submit", label: "Reportar ocorrência" },
    { group: "Ocorrências", groupHref: "/ocorrencias", href: "/ocorrencias/browse", label: "Consultar ocorrências" },
    { group: "Ocorrências", groupHref: "/ocorrencias", href: "/ocorrencias/track", label: "Acompanhar" },
    { group: "Participação", groupHref: "/participacao", href: "/participacao", label: "Orçamento Participativo" },
    { group: "Participação", groupHref: "/participacao", href: "/participacao/mapa", label: "Mapa de propostas" },
    { group: "Participação", groupHref: "/participacao", href: "/participacao/conta", label: "A minha participação" },
  ];

  let path = $state("/ocorrencias/submit");

  const primary = $derived.by(() => {
    const out: { href: string; label: string; current: boolean }[] = [];
    const seen = new Set<string>();
    for (const i of navLinks) {
      if (i.groupHref) {
        if (seen.has(i.groupHref)) continue;
        seen.add(i.groupHref);
        out.push({ href: i.groupHref, label: i.group ?? i.href, current: path.startsWith(i.groupHref) });
      } else {
        out.push({ href: i.href, label: i.label, current: path.startsWith(i.href) });
      }
    }
    return out;
  });
  const activeSection = $derived(
    navLinks
      .map((i) => i.groupHref)
      .filter((h): h is string => !!h && path.startsWith(h))
      .sort((a, b) => b.length - a.length)[0] ?? null,
  );
  const sectionLabel = $derived(
    activeSection ? (navLinks.find((i) => i.groupHref === activeSection)?.group ?? "") : "",
  );
  const sectionItems = $derived(
    !activeSection
      ? []
      : navLinks
          .filter((i) => i.groupHref === activeSection && i.href !== activeSection)
          .map((i) => ({
            href: i.href,
            label: i.label,
            current: path === i.href || path.startsWith(i.href + "/"),
          })),
  );
  const groups = $derived(
    [...new Set(navLinks.map((i) => i.groupHref).filter(Boolean))] as string[],
  );
  const groupLabel = (g: string) => navLinks.find((i) => i.groupHref === g)?.group ?? g;
  const childrenOf = (g: string) =>
    navLinks.filter((i) => i.groupHref === g && i.href !== g);

  const routes = [
    "/",
    "/ocorrencias/submit",
    "/ocorrencias/track",
    "/participacao",
    "/participacao/mapa",
  ];
</script>

<svelte:head><title>Portal navigation — aiaiai Design System</title></svelte:head>

<PageHeader
  title="Portal navigation"
  description="Two-tier citizen-portal chrome: SiteHeader (primary sections) + an optional SectionNavigation band (the active section's pages), with a single unified mobile disclosure. Data-driven; the section band animates open below the fixed header so the primary tier never reflows."
/>

<div class="route-switch">
  <span class="type-label">Current route</span>
  {#each routes as r (r)}
    <button class="route-chip" class:active={path === r} onclick={() => (path = r)}>{r}</button>
  {/each}
</div>

<div class="demo-frame">
  <SiteHeader menuLabel="Menu" menuPanelLabel="Menu" closeLabel="Fechar">
    {#snippet brand()}
      <a href="#brand" class="demo-brand"><span class="demo-mark">◳</span>Valongo</a>
    {/snippet}
    {#snippet nav()}
      <ServiceNavigation label="Primary" items={primary} />
    {/snippet}
    {#snippet subnav()}
      <SectionNavigation label={sectionLabel} items={sectionItems} />
    {/snippet}
    {#snippet actions()}
      <span class="type-label" style="color: var(--color-text-secondary);">PT</span>
      <span class="type-label" style="color: var(--color-accent);">Entrar</span>
    {/snippet}
    {#snippet menu()}
      <nav aria-label="Menu" class="demo-menu">
        {#each groups as g (g)}
          <div class="demo-menu-group">
            <span class="demo-menu-label type-caption">{groupLabel(g)}</span>
            <a href={g} class="demo-menu-link" aria-current={path === g ? "page" : undefined}>{groupLabel(g)}</a>
            {#each childrenOf(g) as c (c.href)}
              <a
                href={c.href}
                class="demo-menu-link child"
                aria-current={path === c.href ? "page" : undefined}>{c.label}</a
              >
            {/each}
          </div>
        {/each}
      </nav>
    {/snippet}
  </SiteHeader>

  <div class="demo-page">
    <p class="type-body" style="color: var(--color-text-secondary);">
      Page content. Resize below 48rem to see the two nav tiers collapse into one
      hamburger and a single hierarchical panel.
    </p>
  </div>
</div>

<style>
  .route-switch {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2xs);
    margin-bottom: var(--space-md);
  }
  .route-switch .type-label {
    margin-inline-end: var(--space-sm);
    color: var(--color-text-muted);
  }
  .route-chip {
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    padding: var(--space-2xs) var(--space-sm);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    cursor: pointer;
  }
  .route-chip.active {
    background: var(--color-text);
    color: var(--color-surface);
    border-color: var(--color-text);
  }

  .demo-frame {
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-surface);
  }
  .demo-page {
    padding: var(--space-xl) var(--content-padding-x);
    min-height: 12rem;
  }
  .demo-brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    color: inherit;
    text-decoration: none;
    font-weight: var(--raw-font-weight-semibold);
  }
  .demo-mark {
    display: inline-grid;
    place-items: center;
    width: var(--icon-size-lg);
    height: var(--icon-size-lg);
    border-radius: var(--radius-md);
    background: var(--color-accent);
    color: var(--color-text-on-accent);
  }

  .demo-menu {
    padding-block: var(--space-sm);
  }
  .demo-menu-group {
    padding-block: var(--space-sm);
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .demo-menu-label {
    display: block;
    padding: var(--space-xs) var(--space-md);
    color: var(--color-text-muted);
    text-transform: uppercase;
  }
  .demo-menu-link {
    display: block;
    padding: var(--space-sm) var(--space-md);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: var(--type-body-size);
  }
  .demo-menu-link.child {
    padding-inline-start: var(--space-xl);
  }
  .demo-menu-link[aria-current="page"] {
    color: var(--color-text);
    font-weight: var(--raw-font-weight-semibold);
    background: var(--color-accent-subtle);
    box-shadow: inset var(--border-width-thick) 0 0 0 var(--color-accent);
  }
</style>
