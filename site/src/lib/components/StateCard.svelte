<script lang="ts">
	import type { Snippet } from 'svelte';
	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="state-card">
	<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">{label}</span>
	{@render children()}
</div>

<style>
	.state-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-xs);
	}
</style>
