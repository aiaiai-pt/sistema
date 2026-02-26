<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import Button from '$ui/Button.svelte';
	import Modal from '$ui/Modal.svelte';
	import Alert from '$ui/Alert.svelte';
	import Input from '$ui/Input.svelte';

	let showModal = $state(false);
	let showSmallModal = $state(false);
	let showLargeModal = $state(false);
	let renameName = $state('My Pipeline');
</script>

<svelte:head>
	<title>Overlay & Alert — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Overlay & Alert"
	description="Modal dialogs for focused interactions and inline alerts for contextual messages. Modal has focus trap, backdrop dismiss, and Escape key support. Alert is an in-flow callout (unlike Toast which floats)."
/>

<!-- Alert -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Alert</h2>
	<div class="alert-demos">
		<Alert variant="info">
			<strong>Note:</strong> This pipeline requires a configured source connection before activation.
		</Alert>
		<Alert variant="success">
			<strong>Build passed.</strong> All 14 tests passed. Pattern published to registry.
		</Alert>
		<Alert variant="warning">
			<strong>Schema drift detected.</strong> 3 columns added since last sync. Review before proceeding.
		</Alert>
		<Alert variant="error">
			<strong>CI failed.</strong> Linting errors in main.py line 42. Fix and push to retry.
		</Alert>
	</div>
</section>

<!-- Modal -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Modal</h2>

	<div class="modal-triggers">
		<Button variant="secondary" onclick={() => showSmallModal = true}>SMALL MODAL</Button>
		<Button variant="primary" onclick={() => showModal = true}>DEFAULT MODAL</Button>
		<Button variant="secondary" onclick={() => showLargeModal = true}>LARGE MODAL</Button>
	</div>

	<!-- Small modal -->
	<Modal open={showSmallModal} width="sm" title="Rename Pipeline" onclose={() => showSmallModal = false}>
		<Input label="NAME" bind:value={renameName} />
		{#snippet footer()}
			<Button variant="ghost" onclick={() => showSmallModal = false}>CANCEL</Button>
			<Button variant="primary" onclick={() => showSmallModal = false}>SAVE</Button>
		{/snippet}
	</Modal>

	<!-- Default modal -->
	<Modal open={showModal} title="Delete Pipeline" onclose={() => showModal = false}>
		<p class="type-body-sm" style="margin-bottom: var(--space-md);">
			Are you sure you want to delete <strong>customer-enrichment-v2</strong>? This action cannot be undone.
		</p>
		<Alert variant="warning">
			<strong>Warning:</strong> This will also delete 3 pipeline versions and 47 run records.
		</Alert>
		{#snippet footer()}
			<Button variant="ghost" onclick={() => showModal = false}>CANCEL</Button>
			<Button variant="destructive" onclick={() => showModal = false}>DELETE PIPELINE</Button>
		{/snippet}
	</Modal>

	<!-- Large modal -->
	<Modal open={showLargeModal} width="lg" title="Pipeline Details" onclose={() => showLargeModal = false}>
		<div style="display: flex; flex-direction: column; gap: var(--space-md);">
			<p class="type-body-sm">This is a large modal for content that needs more horizontal space — schema previews, code editors, data tables.</p>
			<div style="background: var(--color-surface-secondary); border-radius: var(--radius-sm); padding: var(--space-lg); min-height: 120px; display: flex; align-items: center; justify-content: center;">
				<span class="type-caption" style="color: var(--color-text-muted);">CONTENT AREA</span>
			</div>
		</div>
		{#snippet footer()}
			<Button variant="ghost" onclick={() => showLargeModal = false}>CLOSE</Button>
		{/snippet}
	</Modal>
</section>

<!-- Sizes reference -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Modal Sizes</h2>
	<div class="size-table">
		<div class="size-row">
			<code class="type-data">sm</code>
			<span class="type-body-sm">360px — rename, confirm, single-field forms</span>
		</div>
		<div class="size-row">
			<code class="type-data">default</code>
			<span class="type-body-sm">480px — standard dialogs, short forms</span>
		</div>
		<div class="size-row">
			<code class="type-data">lg</code>
			<span class="type-body-sm">640px — schema preview, code editor, data tables</span>
		</div>
	</div>
</section>

<!-- Token reference -->
<Callout title="TOKEN REFERENCE">
	<div class="token-columns">
		<div>
			<p class="type-body-sm" style="margin-bottom: var(--space-xs);"><strong>Alert:</strong></p>
			<div class="token-list">
				<code class="type-data token-item">--alert-radius: var(--radius-md)</code>
				<code class="type-data token-item">--alert-padding: var(--space-md)</code>
				<code class="type-data token-item">--alert-border: var(--elevation-border)</code>
				<code class="type-data token-item">--alert-bg: var(--color-surface)</code>
			</div>
		</div>
		<div>
			<p class="type-body-sm" style="margin-bottom: var(--space-xs);"><strong>Modal:</strong></p>
			<div class="token-list">
				<code class="type-data token-item">--modal-width: 480px</code>
				<code class="type-data token-item">--modal-radius: var(--radius-lg)</code>
				<code class="type-data token-item">--modal-shadow: var(--elevation-overlay)</code>
				<code class="type-data token-item">--modal-backdrop: var(--color-overlay)</code>
			</div>
		</div>
	</div>
</Callout>

<style>
	.alert-demos {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.modal-triggers {
		display: flex;
		gap: var(--space-md);
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
		min-width: 72px;
	}

	.token-columns {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.token-columns {
			grid-template-columns: 1fr 1fr;
		}
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
