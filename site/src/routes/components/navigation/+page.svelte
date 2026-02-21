<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';

	let sidebarCollapsed = $state(false);
	let activeItem = $state('dashboard');
	let bottomActiveItem = $state('home');

	const sidebarItems = [
		{ id: 'dashboard', label: 'DASHBOARD', section: null },
		{ id: 'projects', label: 'PROJECTS', section: null, badge: 3 },
		{ id: 'tasks', label: 'TASKS', section: null },
		{ id: 'settings', label: 'SETTINGS', section: 'CONFIG' },
		{ id: 'team', label: 'TEAM', section: null },
		{ id: 'billing', label: 'BILLING', section: null }
	];

	const bottomItems = [
		{ id: 'home', label: 'Home', icon: 'home' },
		{ id: 'search', label: 'Search', icon: 'search' },
		{ id: 'create', label: 'Create', icon: 'create', badge: true },
		{ id: 'activity', label: 'Activity', icon: 'activity' },
		{ id: 'profile', label: 'Profile', icon: 'profile', disabled: true }
	];
</script>

<svelte:head>
	<title>Navigation — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Navigation"
	description="Two navigation patterns: sidebar (desktop, Ontograph-style) and bottom bar (mobile, Still Phone-style). Both use mono labels and component tokens from components.css."
/>

<!-- Sidebar Navigation -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Sidebar Navigation</h2>
	<div class="sidebar-demo-container">
		<div class="sidebar-controls">
			<button class="control-btn" onclick={() => sidebarCollapsed = !sidebarCollapsed}>
				<span class="type-label">{sidebarCollapsed ? 'EXPAND' : 'COLLAPSE'}</span>
			</button>
		</div>
		<div class="sidebar-demo" class:sidebar-collapsed={sidebarCollapsed}>
			<div class="sidebar-header-demo">
				{#if !sidebarCollapsed}
					<span class="type-label" style="color: var(--color-text);">AIAIAI</span>
					<span class="type-caption">Studio</span>
				{:else}
					<span class="type-label" style="color: var(--color-text);">A</span>
				{/if}
			</div>

			<nav class="sidebar-nav-demo">
				<!-- Workspace section -->
				{#if !sidebarCollapsed}
					<span class="nav-section-title">WORKSPACE</span>
				{/if}
				{#each sidebarItems.slice(0, 3) as item}
					<button
						class="nav-item-demo"
						class:nav-item-active={activeItem === item.id}
						onclick={() => activeItem = item.id}
					>
						<svg class="nav-icon" viewBox="0 0 16 16" fill="none">
							<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
						</svg>
						{#if !sidebarCollapsed}
							<span class="nav-item-label">{item.label}</span>
							{#if item.badge}
								<span class="nav-badge">{item.badge}</span>
							{/if}
						{/if}
					</button>
				{/each}

				<!-- Config section -->
				{#if !sidebarCollapsed}
					<span class="nav-section-title" style="margin-top: var(--nav-section-margin-top);">CONFIG</span>
				{/if}
				{#each sidebarItems.slice(3) as item}
					<button
						class="nav-item-demo"
						class:nav-item-active={activeItem === item.id}
						onclick={() => activeItem = item.id}
					>
						<svg class="nav-icon" viewBox="0 0 16 16" fill="none">
							<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/>
						</svg>
						{#if !sidebarCollapsed}
							<span class="nav-item-label">{item.label}</span>
						{/if}
					</button>
				{/each}
			</nav>
		</div>

		<!-- State reference -->
		<div class="state-reference">
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-md);">Sidebar States</h3>
			<div class="state-list">
				<div class="state-item">
					<div class="state-demo-row">
						<div class="nav-item-demo nav-item-preview">
							<svg class="nav-icon" viewBox="0 0 16 16" fill="none">
								<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
							</svg>
							<span class="nav-item-label">DEFAULT</span>
						</div>
					</div>
					<span class="type-caption">Default state</span>
				</div>
				<div class="state-item">
					<div class="state-demo-row">
						<div class="nav-item-demo nav-item-preview nav-item-hover-preview">
							<svg class="nav-icon" viewBox="0 0 16 16" fill="none">
								<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
							</svg>
							<span class="nav-item-label">HOVER</span>
						</div>
					</div>
					<span class="type-caption">Hover state</span>
				</div>
				<div class="state-item">
					<div class="state-demo-row">
						<div class="nav-item-demo nav-item-preview nav-item-active">
							<svg class="nav-icon" viewBox="0 0 16 16" fill="none">
								<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
							</svg>
							<span class="nav-item-label">ACTIVE</span>
						</div>
					</div>
					<span class="type-caption">Active / current page</span>
				</div>
				<div class="state-item">
					<div class="state-demo-row">
						<div class="nav-item-demo nav-item-preview">
							<svg class="nav-icon" viewBox="0 0 16 16" fill="none">
								<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
							</svg>
							<span class="nav-item-label">WITH BADGE</span>
							<span class="nav-badge">5</span>
						</div>
					</div>
					<span class="type-caption">With notification badge</span>
				</div>
				<div class="state-item">
					<div class="state-demo-row">
						<span class="nav-section-title" style="padding: 0;">SECTION HEADER</span>
					</div>
					<span class="type-caption">Section divider label</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Bottom Navigation -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Bottom Navigation</h2>
	<div class="bottom-nav-container">
		<div class="bottom-nav-demo">
			{#each bottomItems as item}
				<button
					class="bottom-nav-item"
					class:bottom-nav-active={bottomActiveItem === item.id}
					class:bottom-nav-disabled={item.disabled}
					onclick={() => { if (!item.disabled) bottomActiveItem = item.id; }}
					disabled={item.disabled}
				>
					<div class="bottom-nav-icon-wrap">
						{#if item.icon === 'home'}
							<svg class="bottom-nav-icon" viewBox="0 0 20 20" fill="none">
								<path d="M3 10l7-7 7 7M5 8v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{:else if item.icon === 'search'}
							<svg class="bottom-nav-icon" viewBox="0 0 20 20" fill="none">
								<circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.5"/>
								<path d="M13 13l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
						{:else if item.icon === 'create'}
							<svg class="bottom-nav-icon" viewBox="0 0 20 20" fill="none">
								<path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
						{:else if item.icon === 'activity'}
							<svg class="bottom-nav-icon" viewBox="0 0 20 20" fill="none">
								<path d="M3 10h3l2-6 4 12 2-6h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{:else}
							<svg class="bottom-nav-icon" viewBox="0 0 20 20" fill="none">
								<circle cx="10" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/>
								<path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
						{/if}
						{#if item.badge}
							<span class="bottom-nav-badge"></span>
						{/if}
					</div>
					<span class="bottom-nav-label">{item.label}</span>
				</button>
			{/each}
		</div>
	</div>
	<div class="bottom-states-row">
		<div class="state-label-pair">
			<span class="type-caption">Default</span>
		</div>
		<div class="state-label-pair">
			<span class="type-caption">Default</span>
		</div>
		<div class="state-label-pair">
			<span class="type-caption">With badge</span>
		</div>
		<div class="state-label-pair">
			<span class="type-caption">Default</span>
		</div>
		<div class="state-label-pair">
			<span class="type-caption">Disabled</span>
		</div>
	</div>
</section>

<!-- Token reference -->
<Callout title="TOKEN REFERENCE">
	<div class="token-columns">
		<div>
			<p class="type-body-sm" style="margin-bottom: var(--space-xs);"><strong>Sidebar:</strong></p>
			<div class="token-list">
				<code class="type-data token-item">--nav-sidebar-width: 240px</code>
				<code class="type-data token-item">--nav-sidebar-width-collapsed: 48px</code>
				<code class="type-data token-item">--nav-item-height: 32px</code>
				<code class="type-data token-item">--nav-item-font: var(--type-label-font)</code>
			</div>
		</div>
		<div>
			<p class="type-body-sm" style="margin-bottom: var(--space-xs);"><strong>Bottom bar:</strong></p>
			<div class="token-list">
				<code class="type-data token-item">--nav-bottom-height: 56px</code>
				<code class="type-data token-item">--nav-bottom-item-color: var(--color-text-muted)</code>
				<code class="type-data token-item">--nav-bottom-item-color-active: var(--color-accent)</code>
			</div>
		</div>
	</div>
</Callout>

<style>
	/* ─── Sidebar demo ─── */
	.sidebar-demo-container {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-md);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.sidebar-controls {
		position: absolute;
		top: var(--space-md);
		right: var(--space-md);
	}

	.sidebar-demo-container {
		position: relative;
	}

	.control-btn {
		font-family: var(--button-font);
		letter-spacing: var(--button-tracking);
		font-size: var(--button-sm-font-size);
		height: var(--button-sm-height);
		padding: 0 var(--button-sm-padding-x);
		border: var(--elevation-border);
		border-radius: var(--button-radius);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--button-transition);
	}

	.control-btn:hover {
		background: var(--color-surface-secondary);
	}

	.sidebar-demo {
		width: var(--nav-sidebar-width);
		min-width: var(--nav-sidebar-width);
		background: var(--nav-sidebar-bg);
		border-right: var(--nav-sidebar-border);
		padding: var(--nav-sidebar-padding);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		transition: width var(--duration-slow) var(--easing-default),
					min-width var(--duration-slow) var(--easing-default);
	}

	.sidebar-collapsed {
		width: var(--nav-sidebar-width-collapsed);
		min-width: var(--nav-sidebar-width-collapsed);
	}

	.sidebar-header-demo {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		padding: var(--space-sm);
		border-bottom: var(--elevation-border);
		padding-bottom: var(--space-md);
	}

	.sidebar-nav-demo {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.nav-section-title {
		font-family: var(--nav-section-font);
		font-size: var(--nav-section-size);
		letter-spacing: var(--nav-section-tracking);
		color: var(--nav-section-color);
		padding: var(--space-sm) var(--space-sm) var(--space-xs);
	}

	.nav-item-demo {
		all: unset;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		height: var(--nav-item-height);
		padding: 0 var(--nav-item-padding-x);
		border-radius: var(--nav-item-radius);
		font-family: var(--nav-item-font);
		font-size: var(--nav-item-font-size);
		letter-spacing: var(--nav-item-tracking);
		color: var(--nav-item-color);
		cursor: pointer;
		transition: all var(--nav-item-transition);
	}

	.nav-item-demo:hover {
		color: var(--nav-item-color-hover);
		background: var(--nav-item-bg-hover);
	}

	.nav-item-active {
		color: var(--nav-item-color-active);
		background: var(--nav-item-bg-active);
	}

	.nav-item-label {
		font-family: inherit;
		font-size: inherit;
		letter-spacing: inherit;
		white-space: nowrap;
	}

	.nav-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.nav-badge {
		font-family: var(--type-data-font);
		font-size: var(--type-caption-size);
		background: var(--color-accent);
		color: var(--color-text-on-accent);
		border-radius: var(--radius-pill);
		padding: 0 var(--space-xs);
		min-width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: auto;
	}

	/* ─── State reference ─── */
	.state-reference {
		padding: var(--space-lg);
	}

	.state-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.state-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.state-demo-row {
		display: flex;
	}

	.nav-item-preview {
		pointer-events: none;
		background: transparent;
		min-width: 180px;
	}

	.nav-item-hover-preview {
		color: var(--nav-item-color-hover);
		background: var(--nav-item-bg-hover);
	}

	/* ─── Bottom nav ─── */
	.bottom-nav-container {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		max-width: 400px;
	}

	.bottom-nav-demo {
		height: var(--nav-bottom-height);
		background: var(--nav-bottom-bg);
		border-top: var(--nav-bottom-border-top);
		display: flex;
		align-items: center;
		justify-content: space-around;
	}

	.bottom-nav-item {
		all: unset;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		cursor: pointer;
		color: var(--nav-bottom-item-color);
		transition: color var(--duration-instant) var(--easing-default);
		padding: var(--space-xs);
	}

	.bottom-nav-active {
		color: var(--nav-bottom-item-color-active);
	}

	.bottom-nav-disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.bottom-nav-icon-wrap {
		position: relative;
	}

	.bottom-nav-icon {
		width: 20px;
		height: 20px;
	}

	.bottom-nav-badge {
		position: absolute;
		top: -2px;
		right: -4px;
		width: 8px;
		height: 8px;
		background: var(--color-accent);
		border-radius: var(--radius-circle);
	}

	.bottom-nav-label {
		font-family: var(--nav-bottom-item-font);
		font-size: var(--nav-bottom-item-size);
	}

	.bottom-states-row {
		display: flex;
		justify-content: space-around;
		max-width: 400px;
		margin-top: var(--space-xs);
	}

	.state-label-pair {
		text-align: center;
	}

	/* ─── Layout ─── */
	.token-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-lg);
	}

	.token-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.token-item {
		font-size: var(--type-caption-size);
		color: var(--color-text-secondary);
	}
</style>
