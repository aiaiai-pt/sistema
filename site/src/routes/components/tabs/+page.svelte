<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import Tabs from '$ui/Tabs.svelte';
	import TabList from '$ui/TabList.svelte';
	import Tab from '$ui/Tab.svelte';
	import TabPanel from '$ui/TabPanel.svelte';

	let activeTab = $state('overview');
	let settingsTab = $state('general');
</script>

<svelte:head>
	<title>Tabs — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Tabs"
	description="Tabbed interface for switching between views without navigation. Uses Svelte context for state management — Tab and TabPanel read active state from the parent Tabs container."
/>

<!-- Basic -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Basic Tabs</h2>
	<div class="demo-block">
		<Tabs bind:value={activeTab}>
			<TabList>
				<Tab value="overview">OVERVIEW</Tab>
				<Tab value="configuration">CONFIGURATION</Tab>
				<Tab value="runs">RUNS</Tab>
			</TabList>
			<TabPanel value="overview">
				<div class="demo-content">
					<p class="type-body-sm">Pipeline overview content. Shows DAG visualization, step summary, and metadata.</p>
				</div>
			</TabPanel>
			<TabPanel value="configuration">
				<div class="demo-content">
					<p class="type-body-sm">Configuration panel. Edit pipeline parameters, step settings, and scheduling.</p>
				</div>
			</TabPanel>
			<TabPanel value="runs">
				<div class="demo-content">
					<p class="type-body-sm">Run history table. Shows execution status, duration, and error logs.</p>
				</div>
			</TabPanel>
		</Tabs>
	</div>
</section>

<!-- With disabled -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Disabled Tab</h2>
	<div class="demo-block">
		<Tabs bind:value={settingsTab}>
			<TabList>
				<Tab value="general">GENERAL</Tab>
				<Tab value="advanced">ADVANCED</Tab>
				<Tab value="danger" disabled>DANGER ZONE</Tab>
			</TabList>
			<TabPanel value="general">
				<div class="demo-content">
					<p class="type-body-sm">General settings. Name, description, and scheduling.</p>
				</div>
			</TabPanel>
			<TabPanel value="advanced">
				<div class="demo-content">
					<p class="type-body-sm">Advanced configuration. Resource limits, timeout, retry policy.</p>
				</div>
			</TabPanel>
		</Tabs>
	</div>
</section>

<!-- States reference -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Tab States</h2>
	<div class="states-row">
		<div class="state-item">
			<Tabs value="active">
				<TabList>
					<Tab value="active">ACTIVE</Tab>
				</TabList>
			</Tabs>
			<span class="type-caption">Active</span>
		</div>
		<div class="state-item">
			<Tabs value="none">
				<TabList>
					<Tab value="default">DEFAULT</Tab>
				</TabList>
			</Tabs>
			<span class="type-caption">Default</span>
		</div>
		<div class="state-item">
			<Tabs value="none">
				<TabList>
					<Tab value="disabled" disabled>DISABLED</Tab>
				</TabList>
			</Tabs>
			<span class="type-caption">Disabled</span>
		</div>
	</div>
</section>

<!-- Token reference -->
<Callout title="TOKEN REFERENCE">
	<div class="token-list">
		<code class="type-data token-item">--tabs-list-bg: var(--color-surface-secondary)</code>
		<code class="type-data token-item">--tabs-list-radius: var(--radius-md)</code>
		<code class="type-data token-item">--tabs-trigger-height: 32px</code>
		<code class="type-data token-item">--tabs-trigger-font: var(--type-label-font)</code>
		<code class="type-data token-item">--tabs-trigger-color-active: var(--color-text)</code>
		<code class="type-data token-item">--tabs-trigger-bg-active: var(--color-surface)</code>
		<code class="type-data token-item">--tabs-trigger-shadow-active: var(--elevation-raised)</code>
		<code class="type-data token-item">--tabs-content-padding-top: var(--space-md)</code>
	</div>
</Callout>

<style>
	.demo-block {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.demo-content {
		padding: var(--space-md);
		background: var(--color-surface-secondary);
		border-radius: var(--radius-sm);
	}

	.states-row {
		display: flex;
		gap: var(--space-xl);
		flex-wrap: wrap;
	}

	.state-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
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
