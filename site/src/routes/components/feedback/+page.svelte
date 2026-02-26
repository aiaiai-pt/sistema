<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import Toast from '$ui/Toast.svelte';
	import EmptyState from '$ui/EmptyState.svelte';
	import Skeleton from '$ui/Skeleton.svelte';
	import Progress from '$ui/Progress.svelte';

	let progressValue = $state(65);

	const feedbackTokens = [
		'--toast-radius: var(--radius-md)',
		'--toast-shadow: var(--elevation-overlay)',
		'--toast-max-width: 360px',
		'--progress-height: 8px',
		'--progress-fill: var(--color-accent)',
		'--progress-radius: var(--radius-pill)',
		'--empty-icon-size: 48px',
		'--empty-gap: var(--space-md)',
		'--skeleton-bg: var(--color-surface-tertiary)',
		'--skeleton-shine: var(--color-surface-secondary)',
		'--skeleton-duration: 1.5s'
	];
</script>

<svelte:head>
	<title>Feedback — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Feedback"
	description="Toast notifications, empty states, loading skeletons, and error states. Feedback components communicate system status to the user with appropriate urgency and microcopy."
/>

<!-- Toasts -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Toast</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Non-blocking notifications. Semantic color on the left border, warm shadow for float effect.</p>
	<div class="toast-stack">
		<Toast variant="info">
			<strong>Sync complete.</strong> All changes have been saved.
		</Toast>

		<Toast variant="success">
			<strong>Project created.</strong> Your new project is ready.
		</Toast>

		<Toast variant="warning">
			<strong>Storage limit approaching.</strong> You have used 90% of available storage.
		</Toast>

		<Toast variant="error">
			<strong>Upload failed.</strong> The file exceeds the 10MB limit.
		</Toast>

		<Toast variant="info" actionLabel="UNDO" onaction={() => {}}>
			<strong>Message archived.</strong>
		</Toast>
	</div>
</section>

<!-- Empty states -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Empty State</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Shown when there is nothing to display. Different copy for different contexts.</p>
	<div class="empty-grid">
		<div class="empty-card">
			<EmptyState
				heading="Create your first project"
				body="Projects organize your work into focused spaces. Start with one and grow from there."
				actionLabel="NEW PROJECT"
				onaction={() => {}}
			>
				{#snippet icon()}
					<svg viewBox="0 0 48 48" fill="none">
						<rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="2"/>
						<path d="M18 24h12M24 18v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</EmptyState>
			<span class="type-caption demo-label">First-use empty state</span>
		</div>

		<div class="empty-card">
			<EmptyState
				heading="No results found"
				body="Try adjusting your search or filters to find what you are looking for."
				actionLabel="CLEAR FILTERS"
				actionVariant="secondary"
				onaction={() => {}}
			>
				{#snippet icon()}
					<svg viewBox="0 0 48 48" fill="none">
						<circle cx="22" cy="22" r="12" stroke="currentColor" stroke-width="2"/>
						<path d="M31 31l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</EmptyState>
			<span class="type-caption demo-label">No-results empty state</span>
		</div>

		<div class="empty-card">
			<EmptyState
				heading="Couldn't load your projects"
				body="The server didn't respond. Check your connection and try again."
				actionLabel="TRY AGAIN"
				actionVariant="secondary"
				onaction={() => {}}
			>
				{#snippet icon()}
					<svg viewBox="0 0 48 48" fill="none" style="color: var(--color-destructive);">
						<circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2"/>
						<path d="M24 16v12M24 32v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</EmptyState>
			<span class="type-caption demo-label">Error-recovery empty state</span>
		</div>

		<div class="empty-card">
			<EmptyState
				heading="You don't have access to this project"
				body="Ask the project owner for permission, or switch to a project you own."
				actionLabel="REQUEST ACCESS"
				onaction={() => {}}
			>
				{#snippet icon()}
					<svg viewBox="0 0 48 48" fill="none">
						<rect x="14" y="20" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
						<path d="M19 20v-4a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="24" cy="29" r="2" fill="currentColor"/>
						<path d="M24 31v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</EmptyState>
			<span class="type-caption demo-label">Permission empty state</span>
		</div>
	</div>
</section>

<!-- Progress -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Progress</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Determinate progress bar for sync, upload, and pipeline execution status.</p>
	<div class="progress-demos">
		<div class="progress-row">
			<span class="type-label">UPLOADING</span>
			<Progress value={35} />
			<span class="type-data">35%</span>
		</div>
		<div class="progress-row">
			<span class="type-label">SYNCING</span>
			<Progress value={72} />
			<span class="type-data">72%</span>
		</div>
		<div class="progress-row">
			<span class="type-label">COMPLETE</span>
			<Progress value={100} />
			<span class="type-data">100%</span>
		</div>
	</div>
</section>

<!-- Loading skeleton -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Loading Skeleton</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Placeholder shapes that indicate content is loading. Uses the shimmer animation.</p>
	<div class="skeleton-grid">
		<!-- Text lines -->
		<div class="skeleton-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">TEXT LINES</span>
			<div class="skeleton-demo">
				<Skeleton width="40%" height="12px" />
				<Skeleton width="100%" height="16px" />
				<Skeleton width="85%" height="14px" />
				<Skeleton width="60%" height="14px" />
			</div>
		</div>

		<!-- Card skeleton -->
		<div class="skeleton-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">CARD</span>
			<Skeleton width="100%" height="120px" radius="var(--radius-md)" />
			<Skeleton width="60%" height="14px" style="margin-top: var(--space-sm);" />
			<Skeleton width="80%" height="12px" style="margin-top: var(--space-xs);" />
		</div>

		<!-- Avatar + text -->
		<div class="skeleton-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">AVATAR + TEXT</span>
			<div class="skeleton-avatar-demo">
				<Skeleton width="40px" height="40px" circle />
				<div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-xs);">
					<Skeleton width="50%" height="14px" />
					<Skeleton width="80%" height="12px" />
				</div>
			</div>
			<div class="skeleton-avatar-demo" style="margin-top: var(--space-sm);">
				<Skeleton width="40px" height="40px" circle />
				<div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-xs);">
					<Skeleton width="40%" height="14px" />
					<Skeleton width="70%" height="12px" />
				</div>
			</div>
		</div>

		<!-- Table row -->
		<div class="skeleton-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">TABLE ROW</span>
			{#each Array(3) as _}
				<div class="skeleton-table-row">
					<Skeleton width="30%" height="12px" />
					<Skeleton width="20%" height="12px" />
					<Skeleton width="15%" height="12px" />
					<Skeleton width="10%" height="12px" />
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Error state -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Error State</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Different error presentations depending on scope: page-level, inline, field-level.</p>
	<div class="error-grid">
		<!-- Page-level error -->
		<div class="error-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">PAGE-LEVEL</span>
			<div class="error-demo-page">
				<svg class="error-icon" viewBox="0 0 32 32" fill="none">
					<circle cx="16" cy="16" r="12" stroke="var(--color-destructive)" stroke-width="2"/>
					<path d="M16 10v8M16 22v1" stroke="var(--color-destructive)" stroke-width="2" stroke-linecap="round"/>
				</svg>
				<h3 class="type-heading-sm">Page not found</h3>
				<p class="type-body-sm" style="color: var(--color-text-secondary);">The page you are looking for does not exist or has been moved.</p>
			</div>
		</div>

		<!-- Inline error -->
		<div class="error-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">INLINE</span>
			<div class="error-inline">
				<svg class="error-inline-icon" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="var(--color-destructive)" stroke-width="1.5"/>
					<path d="M8 5v4M8 11v.5" stroke="var(--color-destructive)" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
				<span class="type-body-sm" style="color: var(--color-destructive);">Failed to load comments. <button class="error-retry"><span class="type-label" style="color: var(--color-accent);">RETRY</span></button></span>
			</div>
		</div>

		<!-- Offline -->
		<div class="error-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">OFFLINE</span>
			<div class="error-banner">
				<span class="type-body-sm">You are offline. Changes will sync when reconnected.</span>
			</div>
		</div>

		<!-- Timeout -->
		<div class="error-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">TIMEOUT</span>
			<div class="error-inline" style="align-items: flex-start;">
				<svg class="error-inline-icon" style="margin-top: var(--space-2xs);" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="var(--color-destructive)" stroke-width="1.5"/>
					<path d="M8 5v4M8 11v.5" stroke="var(--color-destructive)" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
				<div style="display: flex; flex-direction: column; gap: var(--space-xs);">
					<span class="type-body-sm" style="color: var(--color-destructive);"><strong>Request timed out.</strong></span>
					<span class="type-body-sm" style="color: var(--color-text-secondary);">The server took too long to respond. This usually resolves on its own.</span>
					<button class="error-retry"><span class="type-label" style="color: var(--color-accent);">TRY AGAIN</span></button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Feedback components" file="components.css" tokens={feedbackTokens} />

<style>
	/* Only demo layout — all component CSS lives in the components */
	.progress-demos {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		max-width: 400px;
	}

	.progress-row {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.progress-row :global(.progress) {
		flex: 1;
	}

	.toast-stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		max-width: 360px;
	}

	.empty-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-md);
	}

	.empty-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.demo-label {
		padding-bottom: var(--space-md);
	}

	.skeleton-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-md);
	}

	.skeleton-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.skeleton-demo {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.skeleton-avatar-demo {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.skeleton-table-row {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-sm) 0;
		border-bottom: var(--elevation-border);
	}

	.skeleton-table-row:last-child {
		border-bottom: none;
	}

	/* ─── Error state (no component — composed inline) ─── */
	.error-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-md);
	}

	.error-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.error-demo-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		text-align: center;
		padding: var(--space-lg) 0;
	}

	.error-icon {
		width: 32px;
		height: 32px;
	}

	.error-inline {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm);
		background: var(--color-destructive-subtle);
		border-radius: var(--radius-sm);
	}

	.error-inline-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.error-retry {
		all: unset;
		cursor: pointer;
	}

	.error-retry:hover {
		text-decoration: underline;
	}

	.error-retry:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-accent);
		outline-offset: var(--focus-ring-offset);
	}

	.error-banner {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-warning-subtle);
		border: var(--border-width) solid var(--color-warning);
		border-radius: var(--radius-sm);
	}
</style>
