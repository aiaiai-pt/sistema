<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { navigation } from '$lib/nav';
	import { getTheme, getThemes, getThemeLabel, setTheme, initTheme } from '$lib/theme.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let sidebarOpen = $state(true);

	onMount(() => {
		initTheme();
	});
</script>

<div class="layout">
	<!-- Sidebar -->
	<aside class="sidebar" class:collapsed={!sidebarOpen}>
		<div class="sidebar-header">
			<span class="type-label" style="color: var(--color-text);">AIAIAI</span>
			<span class="type-caption">Design System</span>
		</div>

		<!-- Theme switcher -->
		<div class="theme-switcher">
			<span class="type-caption" style="text-transform: uppercase;">Theme</span>
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

	<!-- Main content -->
	<main class="content">
		<div class="content-inner">
			{@render children()}
		</div>
	</main>
</div>

<style>
	.layout {
		display: flex;
		min-height: 100dvh;
	}

	.sidebar {
		width: var(--nav-sidebar-width);
		min-width: var(--nav-sidebar-width);
		background: var(--color-surface-secondary);
		border-right: var(--elevation-border);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		position: sticky;
		top: 0;
		height: 100dvh;
		overflow-y: auto;
	}

	.sidebar-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		padding: var(--space-sm);
		border-bottom: var(--elevation-border);
		padding-bottom: var(--space-md);
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
		gap: 2px;
	}

	.theme-button {
		all: unset;
		cursor: pointer;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		transition: background var(--duration-instant) var(--easing-default);
	}

	.theme-button:hover {
		background: var(--color-surface-tertiary);
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
		gap: 1px;
	}

	.nav-section-title {
		padding: var(--space-sm) var(--space-sm) var(--space-xs);
		text-transform: uppercase;
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

	.content {
		flex: 1;
		min-width: 0;
	}

	.content-inner {
		max-width: var(--content-width);
		margin: 0 auto;
		padding: var(--space-2xl) var(--space-xl);
	}
</style>
