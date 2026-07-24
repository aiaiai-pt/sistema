<script lang="ts">
	import Sidebar from '$ui/Sidebar.svelte';
	import SidebarItem from '$ui/SidebarItem.svelte';
	import SidebarSection from '$ui/SidebarSection.svelte';
	import StatGrid from '$ui/StatGrid.svelte';
	import StatCard from '$ui/StatCard.svelte';
	import DataTable from '$ui/DataTable.svelte';
	import Badge from '$ui/Badge.svelte';
	import Status from '$ui/Status.svelte';
	import Input from '$ui/Input.svelte';
	import Select from '$ui/Select.svelte';
	import Checkbox from '$ui/Checkbox.svelte';
	import Toggle from '$ui/Toggle.svelte';
	import Label from '$ui/Label.svelte';
	import Button from '$ui/Button.svelte';
	import Alert from '$ui/Alert.svelte';
	import EmptyState from '$ui/EmptyState.svelte';
	import Skeleton from '$ui/Skeleton.svelte';
	import Breadcrumb from '$ui/Breadcrumb.svelte';
	import Separator from '$ui/Separator.svelte';
	import Tab from '$ui/Tab.svelte';
	import TabList from '$ui/TabList.svelte';
	import TabPanel from '$ui/TabPanel.svelte';
	import Tabs from '$ui/Tabs.svelte';
	import 'ol/ol.css';
	import MapCluster from '$ui/MapCluster.svelte';

	type MarkerData = { id: string; lon: number; lat: number; label: string };

	// ─── Nav state ──────────────────────────────────────────────────────────
	let sidebarCollapsed = $state(false);
	let drawerOpen = $state(false);
	let activeNav = $state('ocorrencias');

	function toggleNav() {
		if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
			drawerOpen = !drawerOpen;
		} else {
			sidebarCollapsed = !sidebarCollapsed;
		}
	}

	function closeDrawer() {
		drawerOpen = false;
	}

	// ─── Table state ────────────────────────────────────────────────────────
	let sortKey = $state('reportado_em');
	let sortDir: 'asc' | 'desc' = $state('desc');
	let selectedRows = $state(new Set<string>());
	let tableTab = $state('ativas');

	// ─── Form state ─────────────────────────────────────────────────────────
	let filterTipo = $state('');
	let filterEstado = $state('');
	let filterFreguesia = $state('');
	let incluirArquivadas = $state(false);
	let alertasAtivos = $state(true);

	// ─── Data definitions ────────────────────────────────────────────────────
	const tipoOptions = [
		{ value: '', label: 'Todos os tipos' },
		{ value: 'via_publica', label: 'Via Pública' },
		{ value: 'jardim', label: 'Jardim / Parque' },
		{ value: 'iluminacao', label: 'Iluminação Pública' },
		{ value: 'residuos', label: 'Resíduos e Limpeza' },
		{ value: 'sinalizacao', label: 'Sinalização' },
		{ value: 'estrutura', label: 'Estrutura / Edifício' },
	];

	const estadoOptions = [
		{ value: '', label: 'Todos os estados' },
		{ value: 'pendente', label: 'Pendente' },
		{ value: 'em_curso', label: 'Em Curso' },
		{ value: 'resolvido', label: 'Resolvido' },
		{ value: 'rejeitado', label: 'Rejeitado' },
	];

	const freguesiaOptions = [
		{ value: '', label: 'Todas as freguesias' },
		{ value: 'areeiro', label: 'Areeiro' },
		{ value: 'arroios', label: 'Arroios' },
		{ value: 'beato', label: 'Beato' },
		{ value: 'belem', label: 'Belém' },
		{ value: 'benfica', label: 'Benfica' },
		{ value: 'campolide', label: 'Campolide' },
		{ value: 'lumiar', label: 'Lumiar' },
		{ value: 'olivais', label: 'Olivais' },
	];

	type EstadoKey = 'Pendente' | 'Em Curso' | 'Resolvido' | 'Rejeitado';
	type PrioridadeKey = 'Alta' | 'Média' | 'Baixa';
	type BadgeVariant = 'warning' | 'info' | 'success' | 'error' | 'neutral';
	const estadoVariant: Record<EstadoKey, BadgeVariant> = {
		'Pendente':   'warning',
		'Em Curso':   'info',
		'Resolvido':  'success',
		'Rejeitado':  'error',
	};
	const prioridadeVariant: Record<PrioridadeKey, BadgeVariant> = {
		'Alta':  'error',
		'Média': 'warning',
		'Baixa': 'neutral',
	};

	const columns = [
		{ key: 'referencia',   label: 'Referência',   width: '120px' },
		{ key: 'tipo',         label: 'Tipo',         sortable: true },
		{ key: 'localizacao',  label: 'Localização',  sortable: true },
		{ key: 'estado',       label: 'Estado',       width: '120px' },
		{ key: 'prioridade',   label: 'Prioridade',   width: '104px' },
		{ key: 'reportado_em', label: 'Reportado em', sortable: true, width: '140px' },
		{ key: 'responsavel',  label: 'Responsável' },
	];

	const rows = [
		{ id: 'OC-2026-00847', referencia: 'OC-2026-00847', tipo: 'Via Pública',    localizacao: 'Av. Almirante Reis, 102 — Arroios',       estado: 'Em Curso',  prioridade: 'Alta',  reportado_em: '2026-07-22 08:14', responsavel: 'Equipa B — Arroios' },
		{ id: 'OC-2026-00846', referencia: 'OC-2026-00846', tipo: 'Iluminação Pública', localizacao: 'R. Morais Soares, 45 — Arroios',        estado: 'Pendente',  prioridade: 'Média', reportado_em: '2026-07-22 07:51', responsavel: 'Por atribuir' },
		{ id: 'OC-2026-00845', referencia: 'OC-2026-00845', tipo: 'Jardim / Parque', localizacao: 'Parque das Nações — Olivais',             estado: 'Em Curso',  prioridade: 'Baixa', reportado_em: '2026-07-21 16:30', responsavel: 'Equipa C — Olivais' },
		{ id: 'OC-2026-00844', referencia: 'OC-2026-00844', tipo: 'Resíduos e Limpeza', localizacao: 'Largo do Intendente — Arroios',         estado: 'Resolvido', prioridade: 'Alta',  reportado_em: '2026-07-21 14:02', responsavel: 'Equipa B — Arroios' },
		{ id: 'OC-2026-00843', referencia: 'OC-2026-00843', tipo: 'Sinalização',    localizacao: 'R. de Entrecampos, 7 — Areeiro',           estado: 'Pendente',  prioridade: 'Baixa', reportado_em: '2026-07-21 11:45', responsavel: 'Por atribuir' },
		{ id: 'OC-2026-00842', referencia: 'OC-2026-00842', tipo: 'Estrutura / Edifício', localizacao: 'Calçada do Carriche, 88 — Lumiar',    estado: 'Em Curso',  prioridade: 'Alta',  reportado_em: '2026-07-21 09:18', responsavel: 'Equipa A — Lumiar' },
		{ id: 'OC-2026-00841', referencia: 'OC-2026-00841', tipo: 'Via Pública',    localizacao: 'R. de Benfica, 312 — Benfica',             estado: 'Resolvido', prioridade: 'Média', reportado_em: '2026-07-20 17:33', responsavel: 'Equipa D — Benfica' },
		{ id: 'OC-2026-00840', referencia: 'OC-2026-00840', tipo: 'Iluminação Pública', localizacao: 'Av. de Brasília — Belém',               estado: 'Rejeitado', prioridade: 'Baixa', reportado_em: '2026-07-20 15:20', responsavel: 'Equipa E — Belém' },
		{ id: 'OC-2026-00839', referencia: 'OC-2026-00839', tipo: 'Jardim / Parque', localizacao: 'Parque Florestal de Monsanto — Campolide', estado: 'Em Curso',  prioridade: 'Média', reportado_em: '2026-07-20 12:05', responsavel: 'Equipa F — Campolide' },
		{ id: 'OC-2026-00838', referencia: 'OC-2026-00838', tipo: 'Resíduos e Limpeza', localizacao: 'Av. de Roma, 56 — Areeiro',             estado: 'Pendente',  prioridade: 'Alta',  reportado_em: '2026-07-20 09:47', responsavel: 'Por atribuir' },
		{ id: 'OC-2026-00837', referencia: 'OC-2026-00837', tipo: 'Sinalização',    localizacao: 'R. do Beato, 14 — Beato',                  estado: 'Resolvido', prioridade: 'Baixa', reportado_em: '2026-07-19 16:22', responsavel: 'Equipa G — Beato' },
		{ id: 'OC-2026-00836', referencia: 'OC-2026-00836', tipo: 'Via Pública',    localizacao: 'Av. Infante D. Henrique — Olivais',         estado: 'Em Curso',  prioridade: 'Alta',  reportado_em: '2026-07-19 14:11', responsavel: 'Equipa C — Olivais' },
	];

	// Cluster markers (Lisbon OAR incidents)
	const markers = [
		{ id: 'a1', lon: -9.139, lat: 38.722, label: 'OC-2026-00847' },
		{ id: 'a2', lon: -9.135, lat: 38.723, label: 'OC-2026-00846' },
		{ id: 'a3', lon: -9.097, lat: 38.767, label: 'OC-2026-00845' },
		{ id: 'a4', lon: -9.138, lat: 38.718, label: 'OC-2026-00844' },
		{ id: 'a5', lon: -9.152, lat: 38.739, label: 'OC-2026-00843' },
		{ id: 'a6', lon: -9.164, lat: 38.773, label: 'OC-2026-00842' },
		{ id: 'a7', lon: -9.187, lat: 38.747, label: 'OC-2026-00841' },
		{ id: 'a8', lon: -9.213, lat: 38.698, label: 'OC-2026-00840' },
		{ id: 'a9', lon: -9.178, lat: 38.734, label: 'OC-2026-00839' },
		{ id: 'b1', lon: -9.145, lat: 38.745, label: 'OC-2026-00838' },
		{ id: 'b2', lon: -9.106, lat: 38.725, label: 'OC-2026-00837' },
		{ id: 'b3', lon: -9.099, lat: 38.745, label: 'OC-2026-00836' },
	];
</script>

<svelte:head>
	<title>UBP Instrument Specimen — aiaiai Design System</title>
</svelte:head>

<!-- Full-bleed instrument shell — breaks out of PageContainer's centered max-width -->
<div class="specimen-shell" style="margin: calc(-1 * var(--space-2xl)) calc(-1 * var(--space-2xl));">

	<!-- Mobile overlay — closes drawer when tapped outside -->
	{#if drawerOpen}
		<div class="mobile-overlay" onclick={closeDrawer} aria-hidden="true"></div>
	{/if}

	<!-- ─── Inner rail navigation (desktop: sticky rail; mobile: drawer) ────── -->
	<div class="rail-wrapper" class:drawer-open={drawerOpen}>
		<Sidebar bind:collapsed={sidebarCollapsed} class="instrument-rail">
			{#snippet header()}
				{#if !sidebarCollapsed}
					<div style="display:flex; flex-direction:column; gap:var(--space-2xs);">
						<span class="type-label" style="color:var(--color-text);">UBP</span>
						<span class="type-caption" style="color:var(--color-text-muted);">Gestão Urbana</span>
					</div>
				{:else}
					<span class="type-label" style="color:var(--color-accent);">U</span>
				{/if}
			{/snippet}

			<SidebarSection title="OPERAÇÕES" />
			<SidebarItem active={activeNav === 'ocorrencias'} onclick={() => { activeNav = 'ocorrencias'; closeDrawer(); }}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M8 2L14 13H2L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
					</svg>
				{/snippet}
				Ocorrências
			</SidebarItem>
			<SidebarItem active={activeNav === 'licencas'} badge={12} onclick={() => { activeNav = 'licencas'; closeDrawer(); }}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<rect x="2.5" y="1.5" width="11" height="13" rx="1" stroke="currentColor" stroke-width="1.5"/>
						<path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
					</svg>
				{/snippet}
				Licenças
			</SidebarItem>
			<SidebarItem active={activeNav === 'mapa'} onclick={() => { activeNav = 'mapa'; closeDrawer(); }}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<circle cx="8" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>
						<path d="M8 13.5C8 13.5 3 10.5 3 7a5 5 0 0110 0c0 3.5-5 6.5-5 6.5Z" stroke="currentColor" stroke-width="1.5"/>
					</svg>
				{/snippet}
				Mapa
			</SidebarItem>
			<SidebarItem active={activeNav === 'previsoes'} onclick={() => { activeNav = 'previsoes'; closeDrawer(); }}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<polyline points="2,12 6,7 9,10 14,4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/snippet}
				Previsões
			</SidebarItem>

			<SidebarSection title="GESTÃO" />
			<SidebarItem active={activeNav === 'equipas'} onclick={() => { activeNav = 'equipas'; closeDrawer(); }}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<circle cx="6" cy="6" r="3" stroke="currentColor" stroke-width="1.5"/>
						<circle cx="11" cy="5" r="2" stroke="currentColor" stroke-width="1.2"/>
						<path d="M1 13.5a5 5 0 0110 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						<path d="M11 10a4 4 0 013.5 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
					</svg>
				{/snippet}
				Equipas
			</SidebarItem>
			<SidebarItem active={activeNav === 'configuracoes'} onclick={() => { activeNav = 'configuracoes'; closeDrawer(); }}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.5"/>
						<path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M11.75 4.25l-.85.85M4.25 11.75l-.85.85" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
					</svg>
				{/snippet}
				Configurações
			</SidebarItem>

			{#snippet footer()}
				<div style="padding:var(--space-xs) var(--space-sm);">
					<Status variant="success">Sistema operacional</Status>
				</div>
			{/snippet}
		</Sidebar>
	</div>

	<!-- ─── Main instrument canvas ──────────────────────────────────────────── -->
	<div class="instrument-canvas">

		<!-- Toolbar / breadcrumb row -->
		<header class="canvas-toolbar">
			<Breadcrumb items={[
				{ label: 'Gestão Urbana', href: '#' },
				{ label: 'Ocorrências', href: '#' },
				{ label: 'Lista Ativa' },
			]} />
			<div style="display:flex; align-items:center; gap:var(--space-sm);">
				<Button size="sm" variant="ghost" onclick={toggleNav}
					aria-label={sidebarCollapsed ? 'Expandir painel' : 'Colapsar painel'}>
					<svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
						<rect x="2" y="3.5" width="12" height="1.2" rx=".6" fill="currentColor"/>
						<rect x="2" y="7.4" width="12" height="1.2" rx=".6" fill="currentColor"/>
						<rect x="2" y="11.3" width="12" height="1.2" rx=".6" fill="currentColor"/>
					</svg>
				</Button>
				<Button size="sm" variant="secondary">Exportar</Button>
				<Button size="sm">Nova ocorrência</Button>
			</div>
		</header>

		<div class="canvas-body">

			<!-- KPI row -->
			<section class="canvas-section" aria-label="Indicadores chave">
				<StatGrid>
					<StatCard label="TOTAL ATIVAS" value="847" trend={4.2} trendLabel="vs mês anterior" />
					<StatCard label="EM CURSO" value="312" variant="info" trend={-2.1} trendLabel="vs mês anterior" />
					<StatCard label="PENDENTES" value="423" variant="warning" trend={8.7} trendLabel="vs semana anterior" />
					<StatCard label="RESOLVIDAS HOJE" value="38" variant="success" trend={12.5} trendLabel="vs ontem" />
				</StatGrid>
			</section>

			<Separator />

			<!-- Map + filter panel row -->
			<section class="canvas-map-row canvas-section" aria-label="Mapa e filtros">

				<!-- Map canvas placeholder -->
				<div class="map-panel" role="region" aria-label="Mapa de ocorrências">
					<div class="map-header">
						<span class="type-overline">Mapa de ocorrências — Lisboa</span>
						<div style="display:flex; gap:var(--space-xs);">
							<Badge variant="info" dot>CLUSTERS ACTIVOS</Badge>
							<Badge variant="neutral">12 PONTOS</Badge>
						</div>
					</div>
					<div class="map-viewport">
						<MapCluster
							center={[-9.15, 38.73]}
							zoom={12}
							{markers}
							onclick={(m: MarkerData) => console.log('Marcador:', m.label)}
						/>
					</div>
				</div>

				<!-- Filter form -->
				<aside class="filter-panel" aria-label="Filtros de pesquisa">
					<div class="filter-header">
						<span class="type-overline">Filtros</span>
						<Button size="sm" variant="ghost">Limpar</Button>
					</div>

					<div class="filter-body">
						<Select label="Tipo" bind:value={filterTipo} options={tipoOptions} />
						<Select label="Estado" bind:value={filterEstado} options={estadoOptions} />
						<Select label="Freguesia" bind:value={filterFreguesia} options={freguesiaOptions} />
						<Input label="Referência" placeholder="OC-2026-…" />
						<Input label="Reportado por" placeholder="Nome ou contacto" />

						<Separator />

						<Label>
							<Checkbox bind:checked={incluirArquivadas} />
							Incluir arquivadas
						</Label>
						<div style="display:flex; align-items:center; justify-content:space-between; gap:var(--space-sm);">
							<span class="type-label" style="color:var(--color-text-secondary);">Alertas activos</span>
							<Toggle bind:checked={alertasAtivos} />
						</div>

						<Button style="width:100%;">Aplicar filtros</Button>
					</div>
				</aside>
			</section>

			<Separator />

			<!-- Dense data table -->
			<section class="canvas-section" aria-label="Lista de ocorrências">
				<div class="table-header">
					<Tabs bind:value={tableTab}>
						<TabList>
							<Tab value="ativas">
								Ativas <Badge variant="warning">847</Badge>
							</Tab>
							<Tab value="resolvidas">
								Resolvidas
							</Tab>
							<Tab value="rejeitadas">
								Rejeitadas
							</Tab>
						</TabList>
					</Tabs>
					{#if selectedRows.size > 0}
						<div style="display:flex; align-items:center; gap:var(--space-sm); margin-left:auto;">
							<span class="type-label">{selectedRows.size} selecionadas</span>
							<Button size="sm" variant="ghost" onclick={() => selectedRows = new Set()}>Limpar</Button>
							<Button size="sm" variant="secondary">Atribuir</Button>
							<Button size="sm" variant="destructive">Rejeitar</Button>
						</div>
					{/if}
				</div>

				<DataTable
					{columns}
					{rows}
					selectable
					sort_key={sortKey}
					sort_direction={sortDir}
					bind:selected_rows={selectedRows}
					on_sort={(key: string, dir: 'asc' | 'desc') => { sortKey = key; sortDir = dir; }}
					on_row_click={(row: Record<string, unknown>) => console.log('Ocorrência:', row.referencia)}
				>
					{#snippet cell({ row, column, value }: { row: Record<string, unknown>; column: { key: string }; value: unknown })}
						{#if column.key === 'estado'}
							<Badge variant={estadoVariant[value as EstadoKey] ?? 'neutral'}>{value as string}</Badge>
						{:else if column.key === 'prioridade'}
							<Badge variant={prioridadeVariant[value as PrioridadeKey] ?? 'neutral'}>{value as string}</Badge>
						{:else}
							{value ?? '—'}
						{/if}
					{/snippet}
				</DataTable>
			</section>

			<Separator />

			<!-- Badges and status ─────────────────────────────────────────────── -->
			<section class="canvas-section" aria-label="Estados de badge e status">
				<h2 class="type-heading" style="margin-bottom:var(--space-md);">Badges e indicadores de estado</h2>
				<p class="type-body-sm" style="color:var(--color-text-secondary); margin-bottom:var(--space-lg);">
					Todos os estados representados — legíveis sob o tema UBP em ambos os esquemas (claro e escuro).
				</p>

				<div class="badge-grid">
					<div class="badge-row">
						<span class="type-label" style="color:var(--color-text-muted); width:var(--specimen-badge-label-width);">Badge</span>
						<Badge variant="neutral">NEUTRO</Badge>
						<Badge variant="info">INFORMAÇÃO</Badge>
						<Badge variant="success">SUCESSO</Badge>
						<Badge variant="warning">AVISO</Badge>
						<Badge variant="error">ERRO</Badge>
						<Badge variant="info" dot>COM PONTO</Badge>
					</div>
					<div class="badge-row">
						<span class="type-label" style="color:var(--color-text-muted); width:var(--specimen-badge-label-width);">Status</span>
						<Status variant="success">OPERACIONAL</Status>
						<Status variant="warning" pulse>EM ACTUALIZAÇÃO</Status>
						<Status variant="error">FALHA</Status>
						<Status variant="inactive">INACTIVO</Status>
					</div>
				</div>

				<!-- Alert variants (inline callouts, persistent) -->
				<div style="display:flex; flex-direction:column; gap:var(--space-sm); margin-top:var(--space-lg);">
					<Alert variant="info">
						<strong>Informação:</strong> O relatório mensal será gerado automaticamente no dia 1 de agosto.
					</Alert>
					<Alert variant="success">
						<strong>Sincronização concluída.</strong> 38 ocorrências actualizadas às 09:14.
					</Alert>
					<Alert variant="warning">
						<strong>Atenção:</strong> Existem 12 ocorrências em licenças caducadas há mais de 30 dias.
					</Alert>
					<Alert variant="error">
						<strong>Falha na sincronização.</strong> Verifique a ligação ao servidor GIS. Última tentativa: 08:47.
					</Alert>
				</div>
			</section>

			<Separator />

			<!-- Loading / empty / error states ────────────────────────────────── -->
			<section class="canvas-section" aria-label="Estados de carregamento e vazio">
				<h2 class="type-heading" style="margin-bottom:var(--space-md);">Estados da tabela</h2>
				<p class="type-body-sm" style="color:var(--color-text-secondary); margin-bottom:var(--space-lg);">
					Carregamento, vazio e erro — veículos para verificação de acessibilidade sob cópia longa em português e zoom a 160%.
				</p>

				<div class="states-grid">
					<!-- Loading -->
					<div class="state-card">
						<span class="type-label" style="margin-bottom:var(--space-sm); display:block; color:var(--color-text-muted);">Carregamento</span>
						<DataTable {columns} rows={[]} loading />
					</div>

					<!-- Empty -->
					<div class="state-card">
						<span class="type-label" style="margin-bottom:var(--space-sm); display:block; color:var(--color-text-muted);">Sem resultados</span>
						<DataTable
							{columns}
							rows={[]}
							empty_heading="Nenhuma ocorrência encontrada"
							empty_body="Ajuste os filtros ou registe uma nova ocorrência para começar."
						/>
					</div>

					<!-- Skeleton rows (loading inference) -->
					<div class="state-card">
						<span class="type-label" style="margin-bottom:var(--space-sm); display:block; color:var(--color-text-muted);">Esqueleto de carregamento</span>
						<div style="display:flex; flex-direction:column; gap:var(--space-sm); padding:var(--space-md); background:var(--color-surface); border:var(--elevation-border); border-radius:var(--radius-md);">
							{#each [1,2,3,4] as _}
								<div style="display:flex; gap:var(--space-md); align-items:center;">
									<Skeleton width="80px" height="16px" />
									<Skeleton width="140px" height="16px" />
									<Skeleton width="200px" height="16px" />
									<Skeleton width="80px" height="20px" />
								</div>
							{/each}
						</div>
					</div>

					<!-- Error state -->
					<div class="state-card">
						<span class="type-label" style="margin-bottom:var(--space-sm); display:block; color:var(--color-text-muted);">Erro de carregamento</span>
						<div style="border:var(--elevation-border); border-radius:var(--radius-md); overflow:hidden;">
							<EmptyState
								heading="Não foi possível carregar as ocorrências"
								body="Ocorreu um erro ao comunicar com o servidor. Tente novamente ou contacte o suporte técnico se o problema persistir."
							>
								{#snippet actions()}
									<Button size="sm" variant="secondary">Tentar novamente</Button>
								{/snippet}
							</EmptyState>
						</div>
					</div>
				</div>
			</section>

		</div><!-- /canvas-body -->
	</div><!-- /instrument-canvas -->
</div><!-- /specimen-shell -->

<style>
	/* ─── Specimen shell — breaks out of PageContainer centering ────────────── */
	.specimen-shell {
		/* Named custom properties for hardcoded dimensions (items → tokens) */
		--specimen-filter-width: 280px;
		--specimen-map-height: 280px;
		--specimen-badge-label-width: 6.25rem; /* 100px at 16px base */

		display: flex;
		min-height: calc(100dvh - var(--space-2xl));
		background: var(--color-surface);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	/* ─── Rail wrapper — transparent on desktop; becomes fixed drawer on mobile ── */
	.rail-wrapper {
		display: contents; /* transparent: Sidebar is a direct flex child on desktop */
	}

	/* ─── Mobile overlay backdrop ───────────────────────────────────────────── */
	.mobile-overlay {
		position: fixed;
		inset: 0;
		background: var(--color-overlay);
		z-index: 99;
	}

	/* ─── Inner instrument rail ─────────────────────────────────────────────── */
	:global(.instrument-rail) {
		position: sticky;
		top: 0;
		height: 100dvh;
		flex-shrink: 0;
	}

	/* ─── Main canvas ───────────────────────────────────────────────────────── */
	.instrument-canvas {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}

	/* ─── Toolbar ───────────────────────────────────────────────────────────── */
	.canvas-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-surface-secondary);
		border-bottom: var(--elevation-border);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	/* ─── Canvas body ───────────────────────────────────────────────────────── */
	.canvas-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.canvas-section {
		padding: var(--space-lg);
	}

	/* ─── Map + filter row ──────────────────────────────────────────────────── */
	.canvas-map-row {
		display: grid;
		grid-template-columns: 1fr var(--specimen-filter-width);
		gap: var(--space-lg);
		align-items: start;
	}

	/* ─── Map panel ─────────────────────────────────────────────────────────── */
	.map-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.map-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border-bottom: var(--elevation-border);
	}

	.map-viewport {
		height: var(--specimen-map-height);
		position: relative;
		background: var(--color-surface-tertiary);
	}

	:global(.map-viewport .ol-viewport) {
		height: var(--specimen-map-height);
	}

	/* ─── Filter panel ──────────────────────────────────────────────────────── */
	.filter-panel {
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.filter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-sm) var(--space-md);
		border-bottom: var(--elevation-border);
	}

	.filter-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-md);
	}

	/* ─── Table header (tabs + bulk actions) ────────────────────────────────── */
	.table-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
		flex-wrap: wrap;
	}

	/* ─── Badge grid ────────────────────────────────────────────────────────── */
	.badge-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.badge-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	/* ─── States grid ───────────────────────────────────────────────────────── */
	.states-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-lg);
	}

	.state-card {
		display: flex;
		flex-direction: column;
	}

	/* ─── Responsive: below 1024px — two-up KPI grid ────────────────────────── */
	@media (max-width: 1023px) {
		/* StatGrid uses card-grid-4 (4 columns at ≥768px per CardGrid component).
		   Specimen overrides to 2-up at tablet to avoid overflow in the narrow canvas. */
		:global(.instrument-canvas .card-grid-4) {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* ─── Responsive: mobile (<768px) ──────────────────────────────────────── */
	@media (max-width: 767px) {
		.specimen-shell {
			flex-direction: column;
		}

		/* Rail becomes a fixed drawer — slides in from the left */
		.rail-wrapper {
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			height: 100dvh;
			z-index: 100;
			transform: translateX(-100%);
			transition: transform 200ms ease;
		}

		.rail-wrapper.drawer-open {
			transform: translateX(0);
			box-shadow: var(--elevation-overlay);
		}

		/* Rail inside drawer: static positioning (wrapper is already fixed) */
		:global(.instrument-rail) {
			position: static;
			height: 100dvh;
		}

		/* Stacked single-column layouts */
		.canvas-map-row {
			grid-template-columns: 1fr;
		}

		.states-grid {
			grid-template-columns: 1fr;
		}
	}

	/* ─── Reduced motion ────────────────────────────────────────────────────── */
	@media (prefers-reduced-motion: reduce) {
		.specimen-shell * {
			animation-duration: 0.01ms !important;
			transition-duration: 0.01ms !important;
		}
		.rail-wrapper {
			transition: none;
		}
	}
</style>
