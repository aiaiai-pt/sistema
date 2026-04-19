<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { navigation } from '$lib/nav';
	import { getTheme, getThemes, getThemeLabel, setTheme, initTheme } from '$lib/theme.svelte';
	import PageContainer from '$ui/PageContainer.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let sidebarOpen = $state(false);

	onMount(() => {
		initTheme();
	});

	// Close mobile sidebar on navigation
	$effect(() => {
		$page.url.pathname;
		sidebarOpen = false;
	});
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && sidebarOpen) sidebarOpen = false; }} />

<div class="layout">
	<!-- Mobile top bar -->
	<header class="mobile-header">
		<button class="menu-btn" onclick={() => sidebarOpen = true} aria-label="Open navigation">
			<svg viewBox="0 0 24 24" fill="none" width="20" height="20">
				<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
			</svg>
		</button>
		<span class="type-label" style="color: var(--color-text);">AIAIAI</span>
		<span class="type-caption">Design System</span>
	</header>

	<!-- Backdrop (mobile drawer) -->
	<div
		class="backdrop"
		class:visible={sidebarOpen}
		onclick={() => sidebarOpen = false}
		role="presentation"
	></div>

	<!-- Sidebar -->
	<aside class="sidebar" class:open={sidebarOpen}>
		<div class="sidebar-header">
			<div class="sidebar-brand">
				<span class="type-label" style="color: var(--color-text);">AIAIAI</span>
				<span class="type-caption">Design System</span>
			</div>
			<button class="sidebar-close" onclick={() => sidebarOpen = false} aria-label="Close navigation">
				<svg viewBox="0 0 24 24" fill="none" width="18" height="18">
					<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>
		</div>

		<!-- Theme switcher -->
		<div class="theme-switcher">
			<span class="type-caption theme-switcher-label">Theme</span>
			<div class="theme-buttons">
				{#each getThemes() as theme}
					<button
						class="theme-button"
						class:active={getTheme() === theme}
						onclick={() => setTheme(theme)}
					>
						<span class="type-caption">{getThemeLabel(theme)}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Navigation -->
		<nav class="sidebar-nav">
			{#each navigation as section}
				<div class="nav-section">
					<span class="nav-section-title type-caption">{section.title}</span>
					{#each section.items as item}
						<a
							href={item.href}
							class="nav-item type-label"
							class:active={$page.url.pathname === item.href}
						>
							{item.label}
						</a>
					{/each}
				</div>
			{/each}
		</nav>
	</aside>

	<!-- Main content (inert when mobile drawer is open for focus trap) -->
	<main class="content" inert={sidebarOpen || undefined}>
		<PageContainer>
			{@render children()}
		</PageContainer>
	</main>
</div>

<style>
	/* ─── Layout ─── */
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	@media (min-width: 1024px) {
		.layout {
			flex-direction: row;
		}
	}

	/* ─── Mobile header ─── */
	.mobile-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		height: var(--nav-mobile-header-height);
		padding: 0 var(--space-md);
		background: var(--nav-mobile-header-bg);
		border-bottom: var(--nav-mobile-header-border);
		position: sticky;
		top: 0;
		z-index: var(--nav-mobile-header-z);
	}

	@media (min-width: 1024px) {
		.mobile-header {
			display: none;
		}
	}

	.menu-btn {
		all: unset;
		box-sizing: border-box;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--button-lg-height);
		height: var(--button-lg-height);
		border-radius: var(--radius-sm);
		color: var(--color-text);
		transition: background var(--duration-instant) var(--easing-default);
	}

	.menu-btn:hover {
		background: var(--color-surface-tertiary);
	}

	.menu-btn:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}

	/* ─── Backdrop ─── */
	.backdrop {
		position: fixed;
		inset: 0;
		background: var(--color-overlay);
		z-index: var(--nav-sidebar-backdrop-z);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--duration-normal) var(--easing-default);
	}

	.backdrop.visible {
		opacity: 1;
		pointer-events: auto;
	}

	@media (min-width: 1024px) {
		.backdrop {
			display: none;
		}
	}

	/* ─── Sidebar ─── */
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		z-index: var(--nav-sidebar-drawer-z);
		width: var(--nav-sidebar-width);
		min-width: var(--nav-sidebar-width);
		height: 100dvh;
		background: var(--nav-sidebar-bg);
		border-right: var(--nav-sidebar-border);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		overflow-y: auto;
		transform: translateX(-100%);
		transition: transform var(--duration-normal) var(--easing-default);
	}

	.sidebar.open {
		transform: translateX(0);
	}

	@media (min-width: 1024px) {
		.sidebar {
			position: sticky;
			top: 0;
			align-self: flex-start;
			height: 100dvh;
			transform: none;
			transition: none;
		}
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-sm);
		border-bottom: var(--elevation-border);
		padding-bottom: var(--space-md);
	}

	.sidebar-brand {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
	}

	.sidebar-close {
		all: unset;
		box-sizing: border-box;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--button-sm-height);
		height: var(--button-sm-height);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		transition: all var(--duration-instant) var(--easing-default);
	}

	.sidebar-close:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text);
	}

	.sidebar-close:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}

	@media (min-width: 1024px) {
		.sidebar-close {
			display: none;
		}
	}

	.theme-switcher {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding: var(--space-sm);
		border-bottom: var(--elevation-border);
		padding-bottom: var(--space-md);
	}

	.theme-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.theme-button {
		all: unset;
		box-sizing: border-box;
		cursor: pointer;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		transition: background var(--duration-instant) var(--easing-default);
	}

	.theme-button:hover {
		background: var(--color-surface-tertiary);
	}

	.theme-button:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}

	.theme-button.active {
		background: var(--color-surface);
		border: var(--elevation-border-strong);
	}

	.theme-button.active .type-caption {
		color: var(--color-text);
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.nav-section {
		display: flex;
		flex-direction: column;
		gap: var(--border-width);
	}

	.nav-section-title,
	.theme-switcher-label {
		padding: var(--space-sm) var(--space-sm) var(--space-xs);
		text-transform: var(--nav-section-transform);
		color: var(--color-text-muted);
	}

	.nav-item {
		display: block;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: all var(--duration-instant) var(--easing-default);
	}

	.nav-item:hover {
		color: var(--color-text);
		background: var(--color-surface-tertiary);
	}

	.nav-item.active {
		color: var(--color-text);
		background: var(--color-surface);
	}

	/* ─── Mobile touch targets (44px minimum) ─── */
	@media (max-width: 1023px) {
		.nav-item {
			min-height: 44px;
			display: flex;
			align-items: center;
			padding: var(--space-sm) var(--space-sm);
		}

		.theme-button {
			min-height: 44px;
			display: flex;
			align-items: center;
		}

		.sidebar-close {
			width: var(--button-lg-height);
			height: var(--button-lg-height);
		}
	}

	/* ─── Content ─── */
	.content {
		flex: 1;
		min-width: 0;
	}

	/* ─── Reduced motion ─── */
	@media (prefers-reduced-motion: reduce) {
		.sidebar {
			transition: none;
		}
		.backdrop {
			transition: none;
		}
	}
</style>
