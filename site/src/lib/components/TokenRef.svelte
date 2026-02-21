<script lang="ts">
	import Callout from './Callout.svelte';
	let { component, file, tokens }: { component: string; file: string; tokens: string[] } = $props();
</script>

<Callout title="TOKEN REFERENCE">
	<p class="type-body-sm" style="margin-bottom: var(--space-sm);">
		{component} use component tokens from <code class="type-data">{file}</code>:
	</p>
	<div class="token-list">
		{#each tokens as token}
			<code class="type-data token-item">{token}</code>
		{/each}
	</div>
</Callout>

<style>
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
