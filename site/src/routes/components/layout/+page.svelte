<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import Separator from '$ui/Separator.svelte';
	import Progress from '$ui/Progress.svelte';
	import Label from '$ui/Label.svelte';

	let progressValue = $state(65);
</script>

<svelte:head>
	<title>Layout — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Layout"
	description="Structural components for dividing content, labelling form fields, and showing progress. These are the connective tissue between larger components."
/>

<!-- Separator -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Separator</h2>

	<div class="demo-block">
		<p class="type-body-sm">Content above the separator</p>
		<Separator />
		<p class="type-body-sm">Content below the separator</p>
	</div>

	<h3 class="type-heading-sm" style="margin: var(--space-lg) 0 var(--space-md);">Orientation</h3>
	<div class="demo-row">
		<span class="type-body-sm">Left</span>
		<Separator orientation="vertical" />
		<span class="type-body-sm">Middle</span>
		<Separator orientation="vertical" />
		<span class="type-body-sm">Right</span>
	</div>
</section>

<!-- Progress -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Progress</h2>

	<div class="demo-block">
		<div class="progress-demos">
			<div>
				<span class="type-caption">0%</span>
				<Progress value={0} />
			</div>
			<div>
				<span class="type-caption">25%</span>
				<Progress value={25} />
			</div>
			<div>
				<span class="type-caption">65%</span>
				<Progress value={65} />
			</div>
			<div>
				<span class="type-caption">100%</span>
				<Progress value={100} />
			</div>
		</div>
	</div>

	<h3 class="type-heading-sm" style="margin: var(--space-lg) 0 var(--space-md);">Interactive</h3>
	<div class="demo-block">
		<Progress value={progressValue} />
		<input
			type="range"
			min="0"
			max="100"
			bind:value={progressValue}
			style="width: 100%; margin-top: var(--space-md);"
		/>
		<span class="type-data">{progressValue}%</span>
	</div>
</section>

<!-- Label -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Label</h2>

	<div class="demo-block">
		<div class="label-demos">
			<Label>FIELD NAME</Label>
			<Label disabled>DISABLED LABEL</Label>
		</div>
	</div>
</section>

<!-- Token reference -->
<Callout title="TOKEN REFERENCE">
	<div class="token-list">
		<code class="type-data token-item">--separator-color: var(--color-border)</code>
		<code class="type-data token-item">--separator-thickness: var(--border-width-default)</code>
		<code class="type-data token-item">--progress-height: 8px</code>
		<code class="type-data token-item">--progress-radius: var(--radius-pill)</code>
		<code class="type-data token-item">--progress-fill: var(--color-accent)</code>
	</div>
</Callout>

<style>
	.demo-block {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.demo-row {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		align-items: center;
		gap: var(--space-md);
		height: 48px;
	}

	.progress-demos {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.progress-demos > div {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.label-demos {
		display: flex;
		gap: var(--space-xl);
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
