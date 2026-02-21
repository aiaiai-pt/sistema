<script lang="ts">
	let { title, description }: { title: string; description: string } = $props();
</script>

<h1 class="type-display" style="margin-bottom: var(--space-sm);">{title}</h1>
<p class="type-body" style="color: var(--color-text-secondary); max-width: var(--content-width-narrow); margin-bottom: var(--space-2xl);">
	{description}
</p>
