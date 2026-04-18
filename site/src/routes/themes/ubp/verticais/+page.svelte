<script lang="ts">
	import { verticais, categorias, type VerticalState } from "../data";

	let categoria = $state("Todos");

	let filtradas = $derived(
		categoria === "Todos"
			? verticais
			: verticais.filter((v) => v.categoria === categoria)
	);

	const stateStyle: Record<VerticalState, string> = {
		Activo: "state-success",
		Inactivo: "state-muted",
		Rascunho: "state-warning",
	};

	function formatEntidades(n: number): string {
		if (n >= 1000) return n.toLocaleString("pt-PT");
		return String(n);
	}
</script>

<svelte:head>
	<title>Gestão de Verticais — UBP</title>
</svelte:head>

<div class="page">
	<header class="topbar">
		<div class="breadcrumb">
			<a class="crumb" href="/themes/ubp">UBP</a>
			<span class="sep">/</span>
			<span class="crumb">Gestão de Verticais</span>
			<span class="sep">/</span>
			<span class="crumb active">Verticais</span>
		</div>
		<div class="actions">
			<button class="btn-icon" aria-label="Notificações">
				<svg viewBox="0 0 20 20" width="18" height="18" fill="none">
					<path d="M10 4v12m-5-5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
			<div class="avatar-chip">L</div>
			<button class="btn-primary-icon" aria-label="Nova vertical">
				<svg viewBox="0 0 20 20" width="18" height="18" fill="none">
					<path d="M10 4v12m-6-6h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</button>
		</div>
	</header>

	<nav class="tabs">
		{#each categorias as cat}
			<button
				class="tab"
				class:active={categoria === cat}
				onclick={() => (categoria = cat)}
			>
				{cat}
			</button>
		{/each}
	</nav>

	<div class="toolbar">
		<div class="search">
			<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
				<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
				<path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			<input type="text" placeholder="Pesquisar" />
			<span class="kbd">/</span>
		</div>
		<button class="btn-ghost">
			<span>Filtros</span>
			<svg viewBox="0 0 16 16" width="14" height="14" fill="none">
				<path d="M3 5h10M5 8h6M7 11h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
		</button>
	</div>

	<div class="grid">
		{#each filtradas as v}
			<article class="card" class:card-muted={v.estado === "Inactivo"}>
				<header class="card-head">
					<div class="card-icon" aria-hidden="true">
						<svg viewBox="0 0 16 16" width="14" height="14" fill="none">
							<rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" stroke-width="1.25" />
							<path d="M5 8h6M5 5.5h6M5 10.5h4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
						</svg>
					</div>
					<div class="card-meta" aria-hidden="true">
						<svg viewBox="0 0 16 16" width="14" height="14" fill="none">
							<circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.25" />
							<circle cx="8" cy="8" r="1.25" fill="currentColor" />
						</svg>
						<svg viewBox="0 0 16 16" width="14" height="14" fill="none">
							<circle cx="6" cy="6" r="2" stroke="currentColor" stroke-width="1.25" />
							<circle cx="11" cy="7" r="1.5" stroke="currentColor" stroke-width="1.25" />
							<path d="M2 13c1-2 3-3 4-3s3 1 4 3" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
						</svg>
						<svg viewBox="0 0 16 16" width="14" height="14" fill="none">
							<rect x="3" y="4" width="10" height="9" rx="1" stroke="currentColor" stroke-width="1.25" />
							<path d="M6 3v2M10 3v2" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
						</svg>
					</div>
					<span class="chip {stateStyle[v.estado]}">{v.estado}</span>
				</header>

				<div class="card-body">
					<h3 class="card-title">{v.nome}</h3>
					<span class="card-category">{v.categoria}</span>
					<p class="card-desc" class:empty={!v.descricao}>
						{v.descricao || "—"}
					</p>
				</div>

				<footer class="card-actions">
					<button class="card-action">
						<svg viewBox="0 0 14 14" width="13" height="13" fill="none">
							<path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round" />
						</svg>
						Editar
					</button>
					<button class="card-action">
						<svg viewBox="0 0 14 14" width="13" height="13" fill="none">
							<rect x="3" y="3" width="8" height="9" rx="1" stroke="currentColor" stroke-width="1.25" />
							<path d="M5 3V1.5h6V10" stroke="currentColor" stroke-width="1.25" />
						</svg>
						Duplicar
					</button>
					<button class="card-action card-action-more" aria-label="Mais acções">
						<svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor">
							<circle cx="3" cy="7" r="1" />
							<circle cx="7" cy="7" r="1" />
							<circle cx="11" cy="7" r="1" />
						</svg>
					</button>
				</footer>
			</article>
		{/each}
	</div>

	<footer class="footer">
		<span class="count">{filtradas.length} verticais disponíveis</span>
	</footer>
</div>

<style>
	.page {
		font-family: var(--font-sans);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	/* ─── Topbar ─── */
	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: var(--space-md);
		border-bottom: var(--elevation-border);
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-secondary);
		font-size: var(--type-body-sm-size);
	}
	.crumb {
		color: var(--color-text-secondary);
		text-decoration: none;
	}
	.crumb:hover {
		color: var(--color-text);
	}
	.crumb.active {
		color: var(--color-text);
		font-weight: 500;
	}
	.sep {
		color: var(--color-text-muted);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.btn-icon,
	.btn-primary-icon {
		all: unset;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: background var(--duration-instant) var(--easing-default);
	}
	.btn-icon {
		color: var(--color-text-secondary);
	}
	.btn-icon:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text);
	}
	.btn-primary-icon {
		background: var(--color-accent);
		color: var(--color-text-on-accent);
	}
	.btn-primary-icon:hover {
		background: var(--color-accent-hover);
	}
	.btn-icon:focus-visible,
	.btn-primary-icon:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}

	.avatar-chip {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-circle);
		background: var(--color-surface-tertiary);
		color: var(--color-text);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: var(--type-body-sm-size);
		border: var(--elevation-border);
	}

	/* ─── Tabs ─── */
	.tabs {
		display: flex;
		gap: var(--space-xs);
		border-bottom: var(--elevation-border);
	}
	.tab {
		all: unset;
		cursor: pointer;
		padding: var(--space-sm) var(--space-md);
		color: var(--color-text-secondary);
		font-size: var(--type-body-sm-size);
		font-weight: 500;
		border-bottom: var(--border-width-thick) solid transparent;
		margin-bottom: calc(var(--border-width) * -1);
		transition: color var(--duration-instant) var(--easing-default),
			border-color var(--duration-instant) var(--easing-default);
	}
	.tab:hover {
		color: var(--color-text);
	}
	.tab.active {
		color: var(--color-text);
		border-bottom-color: var(--color-accent);
	}
	.tab:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
		border-radius: var(--radius-sm);
	}

	/* ─── Toolbar ─── */
	.toolbar {
		display: flex;
		gap: var(--space-md);
		align-items: center;
	}

	.search {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: 0 var(--space-sm);
		height: 36px;
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		transition: border-color var(--duration-instant) var(--easing-default);
	}
	.search:focus-within {
		border-color: var(--color-border-strong);
	}
	.search input {
		all: unset;
		flex: 1;
		color: var(--color-text);
		font-family: var(--font-sans);
		font-size: var(--type-body-sm-size);
	}
	.search input::placeholder {
		color: var(--color-text-muted);
	}
	.kbd {
		font-family: var(--font-sans);
		font-size: var(--type-caption-size);
		color: var(--color-text-muted);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--radius-sm);
		background: var(--color-surface-tertiary);
		border: var(--elevation-border);
	}

	.btn-ghost {
		all: unset;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: 0 var(--space-md);
		height: 36px;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: var(--type-body-sm-size);
		font-weight: 500;
		border: var(--elevation-border);
		background: var(--color-surface-secondary);
		transition: background var(--duration-instant) var(--easing-default);
	}
	.btn-ghost:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text);
	}
	.btn-ghost:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}

	/* ─── Grid ─── */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--space-md);
	}

	.card {
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		transition: border-color var(--duration-instant) var(--easing-default);
	}
	.card:hover {
		border-color: var(--color-border-strong);
	}
	/* Muted card: semantic dimming via bg + text tokens, not opacity —
	   opacity compounds below AA contrast on the nested chip/caption text. */
	.card-muted {
		background: var(--color-surface-secondary);
	}
	.card-muted .card-title {
		color: var(--color-text-secondary);
	}
	.card-muted .card-desc {
		color: var(--color-text-muted);
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
	}

	.card-icon {
		color: var(--color-text-secondary);
		display: inline-flex;
	}

	.card-meta {
		flex: 1;
		display: inline-flex;
		gap: var(--space-sm);
		color: var(--color-text-muted);
		align-items: center;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.card-title {
		color: var(--color-text);
		font-size: var(--type-heading-sm-size);
		font-weight: 600;
		line-height: 1.3;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
	}

	.card-category {
		color: var(--color-text-muted);
		font-size: var(--type-caption-size);
		margin-top: calc(var(--space-2xs) * -1);
	}

	.card-desc {
		color: var(--color-text-secondary);
		font-size: var(--type-body-sm-size);
		line-height: var(--raw-line-height-body);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		min-height: calc(var(--type-body-sm-size) * var(--raw-line-height-body) * 2);
	}
	.card-desc.empty {
		color: var(--color-text-muted);
	}

	.card-actions {
		display: flex;
		gap: var(--space-xs);
		padding-top: var(--space-xs);
		border-top: var(--elevation-border);
	}

	.card-action {
		all: unset;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-size: var(--type-caption-size);
		font-weight: 500;
		transition: background var(--duration-instant) var(--easing-default);
	}
	.card-action:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text);
	}
	.card-action:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}
	.card-action-more {
		margin-left: auto;
		padding: var(--space-xs);
	}

	/* ─── Chips / State ─── */
	.chip {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-pill);
		font-size: var(--type-caption-size);
		font-weight: 500;
		flex-shrink: 0;
	}
	.state-success {
		background: var(--color-success-subtle);
		color: var(--color-success);
	}
	.state-warning {
		background: var(--color-warning-subtle);
		color: var(--color-warning);
	}
	.state-muted {
		background: var(--color-surface-tertiary);
		color: var(--color-text-muted);
	}

	/* ─── Footer ─── */
	.footer {
		padding: var(--space-md) 0;
		border-top: var(--elevation-border);
		color: var(--color-text-muted);
		font-size: var(--type-body-sm-size);
	}
</style>
