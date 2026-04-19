<script lang="ts">
	import { verticais, utilizadores } from "./data";

	const activos = verticais.filter((v) => v.estado === "Activo").length;
	const utilizadoresActivos = utilizadores.filter((u) => u.estado === "Activo").length;
</script>

<svelte:head>
	<title>UBP Theme — aiaiai</title>
</svelte:head>

<div class="ubp-page">
	<header class="ubp-top">
		<div class="breadcrumb">
			<span class="crumb">Themes</span>
			<span class="sep">/</span>
			<span class="crumb active">UBP</span>
		</div>
		<div class="actions">
			<button class="btn-icon" aria-label="Notificações">
				<svg viewBox="0 0 20 20" width="18" height="18" fill="none">
					<path d="M10 4v12m-5-5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
			<div class="avatar-chip">R</div>
		</div>
	</header>

	<section class="intro">
		<h1 class="ubp-display">Urban Backoffice Platform</h1>
		<p class="ubp-lead">
			Tema bespoke Tier 2 que reproduz o look-and-feel do design legacy da UBP usando apenas overrides de tokens do aiaiai. Sidebar 288px, Hanken Grotesk, electric blue (legacy <code>#1b57fd</code>, brightened a <code>#3d7bff</code> para cumprir AA em dark), radius 4-6-8, shadows cool-tinted.
		</p>
	</section>

	<section class="kpis">
		<div class="kpi">
			<span class="kpi-label">Verticais Activas</span>
			<span class="kpi-value">{activos}</span>
			<span class="kpi-delta trend-up">+2 este mês</span>
		</div>
		<div class="kpi">
			<span class="kpi-label">Utilizadores Activos</span>
			<span class="kpi-value">{utilizadoresActivos}</span>
			<span class="kpi-delta">em {new Set(utilizadores.map(u => u.organizacao)).size} organizações</span>
		</div>
		<div class="kpi">
			<span class="kpi-label">Tokens API</span>
			<span class="kpi-value">6</span>
			<span class="kpi-delta">5 live · 1 test</span>
		</div>
		<div class="kpi">
			<span class="kpi-label">Overrides no tema</span>
			<span class="kpi-value">62</span>
			<span class="kpi-delta">Tier 2 budget: 40-80</span>
		</div>
	</section>

	<section class="pages">
		<a class="page-card" href="/themes/ubp/verticais">
			<span class="page-label">Demo · Listing</span>
			<h2 class="page-title">Gestão de Verticais</h2>
			<p class="page-body">Grid de cards com categorias, estados (Activo/Rascunho/Inactivo) e acções inline. Corresponde ao frame Figma <code>357:88357</code>.</p>
			<span class="page-cta">Abrir →</span>
		</a>
		<a class="page-card" href="/themes/ubp/utilizadores">
			<span class="page-label">Demo · Table</span>
			<h2 class="page-title">Gestão de Utilizadores</h2>
			<p class="page-body">Tabela densa com avatar, estado, grupos, último acesso. Inclui overflow de chips e estados Bloqueado/Inactivo. Frame Figma <code>1688:41254</code>.</p>
			<span class="page-cta">Abrir →</span>
		</a>
	</section>

	<section class="note">
		<span class="note-label">Nota</span>
		<p>Estas páginas forçam <code>data-theme="ubp"</code> localmente. Para ver o sistema inteiro em UBP, selecciona o tema "UBP (Bespoke · Dark)" no switcher da sidebar.</p>
	</section>
</div>

<style>
	.ubp-page {
		font-family: var(--font-sans);
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	/* ─── Top bar ─── */
	.ubp-top {
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

	.btn-icon {
		all: unset;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: background var(--duration-instant) var(--easing-default);
	}
	.btn-icon:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text);
	}
	.btn-icon:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}

	.avatar-chip {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-circle);
		background: var(--color-accent);
		color: var(--color-text-on-accent);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: var(--type-body-sm-size);
	}

	/* ─── Intro ─── */
	.ubp-display {
		font-family: var(--font-sans);
		font-size: var(--type-heading-lg-size);
		font-weight: 600;
		line-height: var(--raw-line-height-tight);
		letter-spacing: var(--raw-tracking-tight);
		color: var(--color-text);
		margin: 0 0 var(--space-sm);
	}

	.ubp-lead {
		max-width: var(--content-width-narrow);
		color: var(--color-text-secondary);
		font-size: var(--type-body-size);
		line-height: var(--raw-line-height-body);
		margin: 0;
	}

	/* ─── KPIs ─── */
	.kpis {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);
	}
	@media (min-width: 768px) {
		.kpis {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.kpi {
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.kpi-label {
		color: var(--color-text-secondary);
		font-size: var(--type-body-sm-size);
		font-weight: 500;
	}

	.kpi-value {
		color: var(--color-text);
		font-size: var(--type-heading-lg-size);
		font-weight: 600;
		line-height: 1;
	}

	.kpi-delta {
		color: var(--color-text-muted);
		font-size: var(--type-caption-size);
	}

	.trend-up {
		color: var(--color-success);
	}

	/* ─── Page cards ─── */
	.pages {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}
	@media (min-width: 768px) {
		.pages {
			grid-template-columns: 1fr 1fr;
		}
	}

	.page-card {
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		text-decoration: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		transition: border-color var(--duration-instant) var(--easing-default),
			background var(--duration-instant) var(--easing-default);
	}
	.page-card:hover {
		border-color: var(--color-accent);
		background: var(--color-surface-tertiary);
	}

	/* Legacy UBP uses Title Case throughout — no uppercase section labels. */
	.page-label {
		color: var(--color-accent);
		font-size: var(--type-caption-size);
		font-weight: 600;
		letter-spacing: var(--raw-tracking-normal);
	}

	.page-title {
		color: var(--color-text);
		font-size: var(--type-heading-size);
		font-weight: 600;
		margin: 0;
	}

	.page-body {
		color: var(--color-text-secondary);
		font-size: var(--type-body-sm-size);
		line-height: var(--raw-line-height-body);
		margin: 0;
	}

	.page-cta {
		color: var(--color-accent);
		font-size: var(--type-body-sm-size);
		font-weight: 500;
		margin-top: var(--space-xs);
	}

	code {
		font-family: var(--font-sans);
		background: var(--color-surface-tertiary);
		padding: var(--border-width) var(--space-xs);
		border-radius: var(--radius-sm);
		font-size: var(--type-body-sm-size);
		color: var(--color-text);
	}

	/* ─── Note ─── */
	.note {
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-left: var(--border-width-thick) solid var(--color-accent);
		border-radius: var(--radius-md);
		padding: var(--space-md) var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.note-label {
		color: var(--color-accent);
		font-size: var(--type-caption-size);
		font-weight: 600;
		letter-spacing: var(--raw-tracking-normal);
	}

	.note p {
		color: var(--color-text);
		margin: 0;
		font-size: var(--type-body-sm-size);
	}
</style>
