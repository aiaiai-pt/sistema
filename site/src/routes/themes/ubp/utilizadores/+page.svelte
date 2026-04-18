<script lang="ts">
	import { utilizadores, initials, type UserState } from "../data";

	const stateStyle: Record<UserState, string> = {
		Activo: "state-success",
		Inactivo: "state-muted",
		Bloqueado: "state-destructive",
	};

	function visibleGroups(grupos: string[]): { visible: string[]; extra: number } {
		if (grupos.length <= 2) return { visible: grupos, extra: 0 };
		return { visible: grupos.slice(0, 2), extra: grupos.length - 2 };
	}
</script>

<svelte:head>
	<title>Gestão de Utilizadores — UBP</title>
</svelte:head>

<div class="page">
	<header class="topbar">
		<div class="breadcrumb">
			<a class="crumb" href="/themes/ubp">UBP</a>
			<span class="sep">/</span>
			<span class="crumb">Gestão de Utilizadores</span>
			<span class="sep">/</span>
			<span class="crumb active">Utilizadores</span>
		</div>
		<div class="actions">
			<button class="btn-icon" aria-label="Notificações">
				<svg viewBox="0 0 20 20" width="18" height="18" fill="none">
					<path d="M10 4v12m-5-5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
			<div class="avatar-chip">L</div>
			<button class="btn-primary-icon" aria-label="Novo utilizador">
				<svg viewBox="0 0 20 20" width="18" height="18" fill="none">
					<path d="M10 4v12m-6-6h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</button>
		</div>
	</header>

	<div class="top-actions">
		<button class="btn-secondary">
			<svg viewBox="0 0 16 16" width="14" height="14" fill="none">
				<path d="M8 2v9m-4-4l4 4 4-4M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			Importar
		</button>
		<button class="btn-secondary">
			<svg viewBox="0 0 16 16" width="14" height="14" fill="none">
				<path d="M8 11V2m4 4l-4-4-4 4M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			Exportar
		</button>
	</div>

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

	<div class="table-wrap">
		<table class="table">
			<thead>
				<tr>
					<th class="col-check"><input type="checkbox" aria-label="Selecionar todos" /></th>
					<th class="col-id">ID</th>
					<th class="col-name">Nome e Email</th>
					<th>Organização</th>
					<th>Grupos</th>
					<th>Estado</th>
					<th>Último Acesso</th>
					<th class="col-actions" aria-label="Acções"></th>
				</tr>
			</thead>
			<tbody>
				{#each utilizadores as u}
					{@const groups = visibleGroups(u.grupos)}
					<tr class:row-muted={u.estado === "Inactivo"}>
						<td class="col-check"><input type="checkbox" aria-label={`Selecionar ${u.nome}`} /></td>
						<td class="col-id">{u.id}</td>
						<td class="col-name">
							<div class="name-cell">
								<span class="avatar">{initials(u.nome)}</span>
								<div class="name-text">
									<span class="name">{u.nome}</span>
									<span class="email">{u.email}</span>
								</div>
							</div>
						</td>
						<td>{u.organizacao}</td>
						<td>
							<div class="chips">
								{#each groups.visible as g}
									<span class="tag">{g}</span>
								{/each}
								{#if groups.extra > 0}
									<span class="tag tag-more">+{groups.extra}</span>
								{/if}
							</div>
						</td>
						<td>
							<span class="chip {stateStyle[u.estado]}">{u.estado}</span>
						</td>
						<td class="col-ultimo">{u.ultimoAcesso}</td>
						<td class="col-actions">
							<div class="row-actions">
								<button class="row-action" aria-label="Desbloquear">
									<svg viewBox="0 0 14 14" width="13" height="13" fill="none">
										<rect x="3" y="6.5" width="8" height="5" rx="1" stroke="currentColor" stroke-width="1.25" />
										<path d="M5 6.5V4.5a2 2 0 114 0" stroke="currentColor" stroke-width="1.25" />
									</svg>
								</button>
								<button class="row-action" aria-label="Histórico">
									<svg viewBox="0 0 14 14" width="13" height="13" fill="none">
										<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.25" />
										<path d="M7 4v3l2 1.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
									</svg>
								</button>
								<button class="row-action" aria-label="Mais">
									<svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor">
										<circle cx="7" cy="3" r="1" />
										<circle cx="7" cy="7" r="1" />
										<circle cx="7" cy="11" r="1" />
									</svg>
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<footer class="footer">
		<span class="count">{utilizadores.length} utilizadores</span>
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

	.top-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-sm);
	}

	.btn-secondary,
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
	.btn-secondary:hover,
	.btn-ghost:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text);
	}
	.btn-secondary:focus-visible,
	.btn-ghost:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
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

	/* ─── Table ─── */
	.table-wrap {
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--type-body-sm-size);
	}

	.table thead th {
		text-align: left;
		padding: 0 var(--space-md);
		height: 40px;
		color: var(--color-text-secondary);
		font-weight: 500;
		font-size: var(--type-body-sm-size);
		border-bottom: var(--elevation-border);
		background: var(--color-surface-secondary);
		white-space: nowrap;
	}

	.table tbody td {
		padding: var(--space-sm) var(--space-md);
		height: 56px;
		color: var(--color-text);
		border-bottom: var(--elevation-border);
		vertical-align: middle;
	}
	.table tbody tr:last-child td {
		border-bottom: none;
	}
	.table tbody tr:hover td {
		background: var(--color-surface-tertiary);
	}
	/* Muted row: semantic dimming via color tokens, not opacity —
	   opacity drops nested chip text below AA contrast. */
	.row-muted td {
		color: var(--color-text-secondary);
	}
	.row-muted .name {
		color: var(--color-text-secondary);
	}
	.row-muted .email {
		color: var(--color-text-muted);
	}

	.col-check {
		width: 48px;
	}
	.col-check input[type="checkbox"] {
		cursor: pointer;
		accent-color: var(--color-accent);
	}
	.col-id {
		width: 88px;
		color: var(--color-text-secondary);
		font-variant-numeric: tabular-nums;
	}
	.col-name {
		width: 288px;
	}
	.col-ultimo {
		color: var(--color-text-secondary);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.col-actions {
		width: 120px;
	}

	.name-cell {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.avatar {
		width: 28px;
		height: 28px;
		border-radius: var(--radius-circle);
		background: var(--color-surface-tertiary);
		border: var(--elevation-border);
		color: var(--color-text);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: var(--type-caption-size);
		font-weight: 600;
		flex-shrink: 0;
	}

	.name-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.name {
		color: var(--color-text);
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.email {
		color: var(--color-text-muted);
		font-size: var(--type-caption-size);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.tag {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-sm);
		background: var(--color-surface-tertiary);
		color: var(--color-text-secondary);
		font-size: var(--type-caption-size);
		border: var(--elevation-border);
		white-space: nowrap;
	}
	/* +N chip: white text on subtle-accent bg keeps AA contrast.
	   Blue-on-blue-tint (accent text on accent-subtle) drops to ~4:1. */
	.tag-more {
		background: var(--color-accent-subtle);
		color: var(--color-text);
		border-color: transparent;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-pill);
		font-size: var(--type-caption-size);
		font-weight: 500;
	}
	.state-success {
		background: var(--color-success-subtle);
		color: var(--color-success);
	}
	.state-destructive {
		background: var(--color-destructive-subtle);
		color: var(--color-destructive);
	}
	.state-muted {
		background: var(--color-surface-tertiary);
		color: var(--color-text-muted);
	}

	.row-actions {
		display: inline-flex;
		gap: var(--space-2xs);
	}
	.row-action {
		all: unset;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		transition: background var(--duration-instant) var(--easing-default);
	}
	.row-action:hover {
		background: var(--color-surface);
		color: var(--color-text);
	}
	.row-action:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}

	/* ─── Footer ─── */
	.footer {
		padding: var(--space-md) 0;
		border-top: var(--elevation-border);
		color: var(--color-text-muted);
		font-size: var(--type-body-sm-size);
	}
</style>
