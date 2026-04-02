<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import PageContainer from '$ui/PageContainer.svelte';

	const tokens = [
		'--content-width-narrow: 640px (forms, settings)',
		'--content-width: 960px (articles, detail pages)',
		'--content-width-wide: 1200px (list pages, dashboards)',
		'--content-width-full: 1440px (wide layouts)',
		'--content-padding-x: responsive (md: 16px, lg: 24px, xl: 32px)',
		'--content-padding-y: responsive (md: 24px, lg: 32px, xl: 48px)',
	];
</script>

<PageHeader
	title="Page Container"
	description="Content container for page-level layout. Centers content with max-width and responsive padding. Used once per page inside an app shell's main content area."
/>

<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Sizes</h2>
	<DemoGrid columns="1fr">
		<StateCard label="narrow (640px) — forms, settings">
			<div style="width: 100%;">
				<div class="demo-container" style="max-width: var(--content-width-narrow);">
					<div class="demo-bar"></div>
				</div>
			</div>
		</StateCard>

		<StateCard label="default (960px) — articles, detail pages">
			<div style="width: 100%;">
				<div class="demo-container" style="max-width: var(--content-width);">
					<div class="demo-bar"></div>
				</div>
			</div>
		</StateCard>

		<StateCard label="wide (1200px) — list pages, dashboards [default]">
			<div style="width: 100%;">
				<div class="demo-container" style="max-width: var(--content-width-wide);">
					<div class="demo-bar"></div>
				</div>
			</div>
		</StateCard>

		<StateCard label="full (1440px) — canvas, wide layouts">
			<div style="width: 100%;">
				<div class="demo-container" style="max-width: var(--content-width-full);">
					<div class="demo-bar"></div>
				</div>
			</div>
		</StateCard>
	</DemoGrid>
</section>

<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Usage</h2>
	<DemoGrid columns="1fr">
		<StateCard label="In your layout or page">
			<div style="width: 100%;">
				<pre class="code-block"><code>&lt;PageContainer&gt;
  &lt;h1&gt;Page Title&lt;/h1&gt;
  &lt;p&gt;Content here&lt;/p&gt;
&lt;/PageContainer&gt;

&lt;!-- Narrow for settings --&gt;
&lt;PageContainer size="narrow"&gt;
  &lt;SettingsForm /&gt;
&lt;/PageContainer&gt;

&lt;!-- Wide for list pages --&gt;
&lt;PageContainer size="wide"&gt;
  &lt;DataTable /&gt;
&lt;/PageContainer&gt;</code></pre>
			</div>
		</StateCard>
	</DemoGrid>
</section>

<TokenRef {tokens} />

<style>
	.demo-container {
		width: 100%;
		margin-inline: auto;
		border: var(--border-width) dashed var(--color-border);
		border-radius: var(--radius-sm);
		padding: var(--space-sm);
	}

	.demo-bar {
		height: var(--space-sm);
		background: var(--color-accent);
		border-radius: var(--radius-sm);
		opacity: 0.3;
	}

	.code-block {
		background: var(--color-surface);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		line-height: 1.5;
		color: var(--color-text);
		margin: 0;
		overflow-x: auto;
	}
</style>
