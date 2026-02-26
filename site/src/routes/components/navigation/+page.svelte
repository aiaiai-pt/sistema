<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import Button from '$ui/Button.svelte';
	import Sidebar from '$ui/Sidebar.svelte';
	import SidebarItem from '$ui/SidebarItem.svelte';
	import SidebarSection from '$ui/SidebarSection.svelte';
	import BottomNav from '$ui/BottomNav.svelte';
	import BottomNavItem from '$ui/BottomNavItem.svelte';

	let sidebarCollapsed = $state(false);
	let activeItem = $state('dashboard');
	let bottomActiveItem = $state('home');
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
			<Button variant="secondary" size="sm" onclick={() => sidebarCollapsed = !sidebarCollapsed}>
				{sidebarCollapsed ? 'EXPAND' : 'COLLAPSE'}
			</Button>
		</div>

		<Sidebar bind:collapsed={sidebarCollapsed}>
			{#snippet header()}
				{#if !sidebarCollapsed}
					<span class="type-label" style="color: var(--color-text);">AIAIAI</span>
					<span class="type-caption">Studio</span>
				{:else}
					<span class="type-label" style="color: var(--color-text);">A</span>
				{/if}
			{/snippet}

			<SidebarSection title="WORKSPACE" />
			<SidebarItem active={activeItem === 'dashboard'} onclick={() => activeItem = 'dashboard'}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
				{/snippet}
				DASHBOARD
			</SidebarItem>
			<SidebarItem active={activeItem === 'projects'} badge={3} onclick={() => activeItem = 'projects'}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
				{/snippet}
				PROJECTS
			</SidebarItem>
			<SidebarItem active={activeItem === 'tasks'} onclick={() => activeItem = 'tasks'}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
				{/snippet}
				TASKS
			</SidebarItem>

			<SidebarSection title="CONFIG" />
			<SidebarItem active={activeItem === 'settings'} onclick={() => activeItem = 'settings'}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/></svg>
				{/snippet}
				SETTINGS
			</SidebarItem>
			<SidebarItem active={activeItem === 'team'} onclick={() => activeItem = 'team'}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/></svg>
				{/snippet}
				TEAM
			</SidebarItem>
			<SidebarItem active={activeItem === 'billing'} onclick={() => activeItem = 'billing'}>
				{#snippet icon()}
					<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/></svg>
				{/snippet}
				BILLING
			</SidebarItem>
		</Sidebar>

		<!-- State reference -->
		<div class="state-reference">
			<h3 class="type-heading-sm" style="margin-bottom: var(--space-md);">Sidebar States</h3>
			<div class="state-list">
				<div class="state-item">
					<SidebarItem>
						{#snippet icon()}
							<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
						{/snippet}
						DEFAULT
					</SidebarItem>
					<span class="type-caption">Default state</span>
				</div>
				<div class="state-item">
					<div class="nav-hover-preview">
						<SidebarItem>
							{#snippet icon()}
								<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
							{/snippet}
							HOVER
						</SidebarItem>
					</div>
					<span class="type-caption">Hover state</span>
				</div>
				<div class="state-item">
					<SidebarItem active>
						{#snippet icon()}
							<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
						{/snippet}
						ACTIVE
					</SidebarItem>
					<span class="type-caption">Active / current page</span>
				</div>
				<div class="state-item">
					<SidebarItem badge={5}>
						{#snippet icon()}
							<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
						{/snippet}
						WITH BADGE
					</SidebarItem>
					<span class="type-caption">With notification badge</span>
				</div>
				<div class="state-item">
					<SidebarSection title="SECTION HEADER" />
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
		<BottomNav>
			<BottomNavItem active={bottomActiveItem === 'home'} label="Home" onclick={() => bottomActiveItem = 'home'}>
				{#snippet icon()}
					<svg viewBox="0 0 20 20" fill="none">
						<path d="M3 10l7-7 7 7M5 8v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/snippet}
			</BottomNavItem>
			<BottomNavItem active={bottomActiveItem === 'search'} label="Search" onclick={() => bottomActiveItem = 'search'}>
				{#snippet icon()}
					<svg viewBox="0 0 20 20" fill="none">
						<circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.5"/>
						<path d="M13 13l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</BottomNavItem>
			<BottomNavItem active={bottomActiveItem === 'create'} label="Create" badge onclick={() => bottomActiveItem = 'create'}>
				{#snippet icon()}
					<svg viewBox="0 0 20 20" fill="none">
						<path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</BottomNavItem>
			<BottomNavItem active={bottomActiveItem === 'activity'} label="Activity" onclick={() => bottomActiveItem = 'activity'}>
				{#snippet icon()}
					<svg viewBox="0 0 20 20" fill="none">
						<path d="M3 10h3l2-6 4 12 2-6h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/snippet}
			</BottomNavItem>
			<BottomNavItem label="Profile" disabled>
				{#snippet icon()}
					<svg viewBox="0 0 20 20" fill="none">
						<circle cx="10" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/>
						<path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</BottomNavItem>
		</BottomNav>
	</div>
	<div class="bottom-states-row">
		<span class="type-caption">Default</span>
		<span class="type-caption">Default</span>
		<span class="type-caption">With badge</span>
		<span class="type-caption">Default</span>
		<span class="type-caption">Disabled</span>
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
	/* Only demo layout — all nav CSS lives in the components */
	.sidebar-demo-container {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-md);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow-x: auto;
		position: relative;
	}

	.sidebar-controls {
		position: absolute;
		top: var(--space-md);
		right: var(--space-md);
		z-index: 1;
	}

	/* State reference panel */
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
		gap: var(--space-2xs);
	}

	/* Simulated hover: wrap the item and force hover colors */
	.nav-hover-preview {
		pointer-events: none;
	}

	.nav-hover-preview :global(.nav-item) {
		color: var(--nav-item-color-hover);
		background: var(--nav-item-bg-hover);
	}

	/* Bottom nav demo */
	.bottom-nav-container {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		max-width: 400px;
	}

	.bottom-states-row {
		display: flex;
		justify-content: space-around;
		max-width: 400px;
		margin-top: var(--space-xs);
	}

	/* Token reference layout */
	.token-columns {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.token-columns {
			grid-template-columns: 1fr 1fr;
		}
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
