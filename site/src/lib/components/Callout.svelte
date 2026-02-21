<script lang="ts">
	import type { Snippet } from 'svelte';
	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<section class="callout">
	<h3 class="type-label" style="margin-bottom: var(--space-sm);">{title}</h3>
	{@render children()}
</section>

<style>
	.callout {
		border: var(--elevation-border-strong);
		border-left: 3px solid var(--color-accent);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		background: var(--color-accent-subtle);
	}
</style>
