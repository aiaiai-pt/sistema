<script lang="ts">
	import type { Snippet } from 'svelte';
	let { columns = 'repeat(auto-fill, minmax(180px, 1fr))', children }: { columns?: string; children: Snippet } = $props();
</script>

<div class="demo-grid" style="grid-template-columns: {columns};">
	{@render children()}
</div>

<style>
	.demo-grid {
		display: grid;
		gap: var(--space-md);
	}
</style>
