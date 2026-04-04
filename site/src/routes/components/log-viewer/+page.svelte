<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import LogViewer from '$ui/LogViewer.svelte';

	/** @type {import('$ui/LogViewer.svelte').LogEntry[]} */
	const sampleEntries = [
		{ timestamp: new Date(Date.now() - 240000).toISOString(), level: 'INFO', message: 'Sync workflow started: SourceSyncBatchWorkflow' },
		{ timestamp: new Date(Date.now() - 239000).toISOString(), level: 'INFO', message: 'Activity scheduled: build_extraction_configs_activity' },
		{ timestamp: new Date(Date.now() - 238000).toISOString(), level: 'INFO', message: 'Activity started: build_extraction_configs_activity' },
		{ timestamp: new Date(Date.now() - 236000).toISOString(), level: 'INFO', message: 'Activity completed: build_extraction_configs_activity' },
		{ timestamp: new Date(Date.now() - 235000).toISOString(), level: 'INFO', message: 'Activity scheduled: create_sync_run_activity' },
		{ timestamp: new Date(Date.now() - 234000).toISOString(), level: 'WARNING', message: 'Rate limit approaching: 85% of quota consumed for API key ending in ...x4f2' },
		{ timestamp: new Date(Date.now() - 233000).toISOString(), level: 'INFO', message: 'Activity started: create_sync_run_activity' },
		{ timestamp: new Date(Date.now() - 232000).toISOString(), level: 'INFO', message: 'Activity completed: create_sync_run_activity' },
		{ timestamp: new Date(Date.now() - 230000).toISOString(), level: 'INFO', message: 'Child workflow initiated: SourceSyncWorkflow' },
		{ timestamp: new Date(Date.now() - 228000).toISOString(), level: 'INFO', message: 'Extracted 5,420 records from users table (batch 1/3)' },
		{ timestamp: new Date(Date.now() - 225000).toISOString(), level: 'INFO', message: 'Extracted 4,891 records from users table (batch 2/3)' },
		{ timestamp: new Date(Date.now() - 222000).toISOString(), level: 'WARNING', message: 'Slow query detected: extraction took 8.2s (threshold: 5s)' },
		{ timestamp: new Date(Date.now() - 220000).toISOString(), level: 'INFO', message: 'Extracted 2,103 records from users table (batch 3/3)' },
		{ timestamp: new Date(Date.now() - 218000).toISOString(), level: 'ERROR', message: 'Failed to write batch to orders table: connection reset by peer' },
		{ timestamp: new Date(Date.now() - 216000).toISOString(), level: 'INFO', message: 'Retry attempt 1/3 for orders table write' },
		{ timestamp: new Date(Date.now() - 214000).toISOString(), level: 'INFO', message: 'Write succeeded on retry: 3,200 records to orders table' },
		{ timestamp: new Date(Date.now() - 210000).toISOString(), level: 'INFO', message: 'Activity completed: finalize_sync_run_activity' },
		{ timestamp: new Date(Date.now() - 208000).toISOString(), level: 'INFO', message: 'Workflow completed successfully' },
	];

	const truncatedEntries = sampleEntries.slice(0, 6);

	const logViewerTokens = [
		'--log-viewer-bg: var(--color-surface-secondary)',
		'--log-viewer-border: var(--elevation-border)',
		'--log-viewer-radius: var(--radius-md)',
		'--log-viewer-max-height: 480px',
		'--log-viewer-toolbar-padding: var(--space-md)',
		'--log-viewer-toolbar-gap: var(--space-lg)',
		'--log-viewer-entry-padding-x: var(--space-md)',
		'--log-viewer-entry-padding-y: var(--space-xs)',
		'--log-viewer-entry-font: var(--type-data-font)',
		'--log-viewer-entry-size: var(--type-data-size)',
		'--log-viewer-timestamp-color: var(--color-text-muted)',
		'--log-viewer-timestamp-width: 140px',
		'--log-viewer-level-error-color: var(--color-destructive)',
		'--log-viewer-level-warning-color: var(--color-warning)',
	];
</script>

<svelte:head>
	<title>Log Viewer — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Log Viewer"
	description="Structured log display for viewing timestamped, level-coded entries. Composes Badge, Input, Checkbox, Toggle, Alert, EmptyState, and Skeleton into a single component optimized for scanning many entries."
/>

<!-- Default -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Default</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Toolbar with search, level filters (with counts), and relative/absolute timestamp toggle. Each entry shows timestamp, level badge, and message. Error and warning rows get a left accent stripe.</p>
	<LogViewer entries={sampleEntries} />
</section>

<!-- Truncated -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Truncated</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">When the backend caps output, a warning banner communicates that entries may be missing.</p>
	<LogViewer entries={truncatedEntries} truncated />
</section>

<!-- Empty -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Empty</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Shown when the run has no log output yet.</p>
	<div class="demo-card">
		<LogViewer entries={[]} />
	</div>
</section>

<!-- Unavailable -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Unavailable</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">When the orchestrator is unreachable, shows a fallback with an optional link to the external UI.</p>
	<div class="demo-card">
		<LogViewer
			available={false}
			fallbackUrl="https://temporal.example.com/namespaces/default/workflows/abc-123"
		/>
	</div>
</section>

<!-- Loading -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Loading</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Skeleton shimmer while log data is being fetched.</p>
	<div class="demo-card">
		<LogViewer loading />
	</div>
</section>

<!-- Token reference -->
<TokenRef component="LogViewer" file="components.css" tokens={logViewerTokens} />

<style>
	.demo-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}
</style>
