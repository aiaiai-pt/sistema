<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import Menu from '$ui/Menu.svelte';
	import MenuItem from '$ui/MenuItem.svelte';
	import MenuSeparator from '$ui/MenuSeparator.svelte';
	import Popover from '$ui/Popover.svelte';
	import Button from '$ui/Button.svelte';
	import Input from '$ui/Input.svelte';

	let menuOpen = $state(false);
	let menuAnchor = $state<HTMLElement>();
	let destructiveMenuOpen = $state(false);
	let destructiveAnchor = $state<HTMLElement>();

	let popoverOpen = $state(false);
	let popoverAnchor = $state<HTMLElement>();
	let matchWidthOpen = $state(false);
	let matchWidthAnchor = $state<HTMLElement>();

	const menuTokens = [
		'--menu-padding: var(--space-xs)',
		'--menu-item-padding: var(--space-xs) var(--space-sm)',
		'--menu-item-radius: var(--radius-sm)',
		'--menu-item-hover-bg: var(--color-surface-secondary)',
		'--menu-item-font: var(--type-body-sm-font)',
		'--menu-separator-margin: var(--space-xs) 0',
		'--popover-bg: var(--raw-color-white)',
		'--popover-border: var(--elevation-border-strong)',
		'--popover-shadow: var(--elevation-overlay)',
		'--popover-radius: var(--radius-md)',
		'--popover-z: 50',
	];
</script>

<svelte:head>
	<title>Menu & Popover — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Menu & Popover"
	description="Floating menus for contextual actions and positioned popovers for lightweight content. Arrow key navigation, typeahead search, and Escape to close."
/>

<!-- Menu -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Menu</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Anchored dropdown menu with keyboard navigation (ArrowUp/Down, Home/End, typeahead). Each MenuItem renders as a focusable button with role="menuitem".</p>

	<div class="menu-demos">
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">DEFAULT</span>
			<Button bind:ref={menuAnchor} variant="secondary" onclick={() => menuOpen = !menuOpen}>
				OPTIONS
			</Button>
			<Menu bind:open={menuOpen} anchor={menuAnchor} onclose={() => menuOpen = false}>
				<MenuItem onclick={() => menuOpen = false}>
					{#snippet leading()}
						<svg viewBox="0 0 256 256" width="16" height="16"><rect x="48" y="120" width="88" height="88" rx="8" fill="none" stroke="currentColor" stroke-width="16"/><path d="M120,40H200a8,8,0,0,1,8,8V128" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><line x1="160" y1="80" x2="120" y2="120" stroke="currentColor" stroke-width="16" stroke-linecap="round"/></svg>
					{/snippet}
					Duplicate
				</MenuItem>
				<MenuItem onclick={() => menuOpen = false}>
					{#snippet leading()}
						<svg viewBox="0 0 256 256" width="16" height="16"><path d="M224,56V200a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8H216A8,8,0,0,1,224,56Z" fill="none" stroke="currentColor" stroke-width="16"/><line x1="32" y1="104" x2="224" y2="104" stroke="currentColor" stroke-width="16"/></svg>
					{/snippet}
					Rename
					{#snippet trailing()}
						<span class="type-caption" style="color: var(--color-text-muted);">F2</span>
					{/snippet}
				</MenuItem>
				<MenuSeparator />
				<MenuItem onclick={() => menuOpen = false}>
					{#snippet leading()}
						<svg viewBox="0 0 256 256" width="16" height="16"><line x1="128" y1="40" x2="128" y2="216" stroke="currentColor" stroke-width="16" stroke-linecap="round"/><line x1="88" y1="88" x2="168" y2="88" stroke="currentColor" stroke-width="16" stroke-linecap="round"/></svg>
					{/snippet}
					Export as YAML
				</MenuItem>
			</Menu>
		</div>

		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">WITH DESTRUCTIVE</span>
			<Button bind:ref={destructiveAnchor} variant="secondary" onclick={() => destructiveMenuOpen = !destructiveMenuOpen}>
				ACTIONS
			</Button>
			<Menu bind:open={destructiveMenuOpen} anchor={destructiveAnchor} onclose={() => destructiveMenuOpen = false}>
				<MenuItem onclick={() => destructiveMenuOpen = false}>Edit</MenuItem>
				<MenuItem onclick={() => destructiveMenuOpen = false}>Archive</MenuItem>
				<MenuSeparator />
				<MenuItem variant="destructive" onclick={() => destructiveMenuOpen = false}>Delete permanently</MenuItem>
			</Menu>
		</div>
	</div>
</section>

<!-- Popover -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Popover</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Generic positioned floating content. Anchored to a trigger element with placement control and viewport-aware flipping. Used internally by Menu and Combobox.</p>

	<div class="menu-demos">
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">DEFAULT</span>
			<Button bind:ref={popoverAnchor} variant="secondary" onclick={() => popoverOpen = !popoverOpen}>
				SHOW POPOVER
			</Button>
			<Popover bind:open={popoverOpen} anchor={popoverAnchor} placement="bottom-start" onclose={() => popoverOpen = false}>
				<div style="width: 240px; display: flex; flex-direction: column; gap: var(--space-sm);">
					<span class="type-label">QUICK SETTINGS</span>
					<Input label="THRESHOLD" value="85" size="sm" />
					<div style="display: flex; justify-content: flex-end; gap: var(--space-xs);">
						<Button size="sm" variant="ghost" onclick={() => popoverOpen = false}>CANCEL</Button>
						<Button size="sm" variant="primary" onclick={() => popoverOpen = false}>APPLY</Button>
					</div>
				</div>
			</Popover>
		</div>

		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">MATCH TRIGGER WIDTH</span>
			<Button bind:ref={matchWidthAnchor} variant="secondary" onclick={() => matchWidthOpen = !matchWidthOpen} style="width: 200px;">
				MATCH WIDTH
			</Button>
			<Popover bind:open={matchWidthOpen} anchor={matchWidthAnchor} matchWidth onclose={() => matchWidthOpen = false}>
				<div style="display: flex; flex-direction: column; gap: var(--space-xs);">
					<span class="type-body-sm">Content fills trigger width.</span>
					<span class="type-caption" style="color: var(--color-text-muted);">Used by Combobox dropdown.</span>
				</div>
			</Popover>
		</div>
	</div>
</section>

<!-- Placement reference -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Popover Placement</h2>
	<div class="size-table">
		<div class="size-row">
			<code class="type-data">bottom-start</code>
			<span class="type-body-sm">Default. Below trigger, aligned left.</span>
		</div>
		<div class="size-row">
			<code class="type-data">bottom-end</code>
			<span class="type-body-sm">Below trigger, aligned right.</span>
		</div>
		<div class="size-row">
			<code class="type-data">top-start</code>
			<span class="type-body-sm">Above trigger, aligned left.</span>
		</div>
		<div class="size-row">
			<code class="type-data">top-end</code>
			<span class="type-body-sm">Above trigger, aligned right.</span>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Menu & Popover" file="components.css" tokens={menuTokens} />

<style>
	.menu-demos {
		display: flex;
		gap: var(--space-xl);
		flex-wrap: wrap;
	}

	.size-table {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.size-row {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-sm) var(--space-md);
		border-bottom: var(--elevation-border);
	}

	.size-row:last-child {
		border-bottom: none;
	}

	.size-row code {
		min-width: 120px;
	}
</style>
