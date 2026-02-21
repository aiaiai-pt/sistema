<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';

	const feedbackTokens = [
		'--toast-radius: var(--radius-md)',
		'--toast-shadow: var(--elevation-overlay)',
		'--toast-max-width: 360px',
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
		<!-- Info -->
		<div class="toast toast-info">
			<div class="toast-accent" style="background: var(--color-info);"></div>
			<div class="toast-content">
				<span class="type-body-sm"><strong>Sync complete.</strong> All changes have been saved.</span>
			</div>
		</div>

		<!-- Success -->
		<div class="toast toast-success">
			<div class="toast-accent" style="background: var(--color-success);"></div>
			<div class="toast-content">
				<span class="type-body-sm"><strong>Project created.</strong> Your new project is ready.</span>
			</div>
		</div>

		<!-- Warning -->
		<div class="toast toast-warning">
			<div class="toast-accent" style="background: var(--color-warning);"></div>
			<div class="toast-content">
				<span class="type-body-sm"><strong>Storage limit approaching.</strong> You have used 90% of available storage.</span>
			</div>
		</div>

		<!-- Error -->
		<div class="toast toast-error">
			<div class="toast-accent" style="background: var(--color-destructive);"></div>
			<div class="toast-content">
				<span class="type-body-sm"><strong>Upload failed.</strong> The file exceeds the 10MB limit.</span>
			</div>
		</div>

		<!-- With action -->
		<div class="toast toast-info">
			<div class="toast-accent" style="background: var(--color-info);"></div>
			<div class="toast-content">
				<span class="type-body-sm"><strong>Message archived.</strong></span>
				<button class="toast-action">
					<span class="type-label" style="color: var(--color-accent);">UNDO</span>
				</button>
			</div>
		</div>
	</div>
</section>

<!-- Empty states -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Empty State</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Shown when there is nothing to display. Different copy for different contexts.</p>
	<div class="empty-grid">
		<!-- First use -->
		<div class="empty-state">
			<div class="empty-icon">
				<svg viewBox="0 0 48 48" fill="none">
					<rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="2"/>
					<path d="M18 24h12M24 18v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</div>
			<h3 class="type-heading-sm">Create your first project</h3>
			<p class="type-body-sm" style="color: var(--color-text-secondary); text-align: center;">Projects organize your work into focused spaces. Start with one and grow from there.</p>
			<button class="empty-action">
				<span class="type-label" style="color: var(--color-text-on-accent);">NEW PROJECT</span>
			</button>
			<span class="type-caption" style="margin-top: var(--space-xs);">First-use empty state</span>
		</div>

		<!-- No results -->
		<div class="empty-state">
			<div class="empty-icon">
				<svg viewBox="0 0 48 48" fill="none">
					<circle cx="22" cy="22" r="12" stroke="currentColor" stroke-width="2"/>
					<path d="M31 31l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</div>
			<h3 class="type-heading-sm">No results found</h3>
			<p class="type-body-sm" style="color: var(--color-text-secondary); text-align: center;">Try adjusting your search or filters to find what you are looking for.</p>
			<button class="empty-action-secondary">
				<span class="type-label">CLEAR FILTERS</span>
			</button>
			<span class="type-caption" style="margin-top: var(--space-xs);">No-results empty state</span>
		</div>

		<!-- Error recovery -->
		<div class="empty-state">
			<div class="empty-icon" style="color: var(--color-destructive);">
				<svg viewBox="0 0 48 48" fill="none">
					<circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2"/>
					<path d="M24 16v12M24 32v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</div>
			<h3 class="type-heading-sm">Couldn't load your projects</h3>
			<p class="type-body-sm" style="color: var(--color-text-secondary); text-align: center;">The server didn't respond. Check your connection and try again.</p>
			<button class="empty-action-secondary">
				<span class="type-label">TRY AGAIN</span>
			</button>
			<span class="type-caption" style="margin-top: var(--space-xs);">Error-recovery empty state</span>
		</div>

		<!-- Permission -->
		<div class="empty-state">
			<div class="empty-icon">
				<svg viewBox="0 0 48 48" fill="none">
					<rect x="14" y="20" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
					<path d="M19 20v-4a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<circle cx="24" cy="29" r="2" fill="currentColor"/>
					<path d="M24 31v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</div>
			<h3 class="type-heading-sm">You don't have access to this project</h3>
			<p class="type-body-sm" style="color: var(--color-text-secondary); text-align: center;">Ask the project owner for permission, or switch to a project you own.</p>
			<button class="empty-action">
				<span class="type-label" style="color: var(--color-text-on-accent);">REQUEST ACCESS</span>
			</button>
			<span class="type-caption" style="margin-top: var(--space-xs);">Permission empty state</span>
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
				<div class="skeleton" style="width: 40%; height: 12px;"></div>
				<div class="skeleton" style="width: 100%; height: 16px;"></div>
				<div class="skeleton" style="width: 85%; height: 14px;"></div>
				<div class="skeleton" style="width: 60%; height: 14px;"></div>
			</div>
		</div>

		<!-- Card skeleton -->
		<div class="skeleton-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">CARD</span>
			<div class="skeleton-card-demo">
				<div class="skeleton" style="width: 100%; height: 120px; border-radius: var(--radius-md);"></div>
				<div class="skeleton" style="width: 60%; height: 14px; margin-top: var(--space-sm);"></div>
				<div class="skeleton" style="width: 80%; height: 12px; margin-top: var(--space-xs);"></div>
			</div>
		</div>

		<!-- Avatar + text -->
		<div class="skeleton-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">AVATAR + TEXT</span>
			<div class="skeleton-avatar-demo">
				<div class="skeleton" style="width: 40px; height: 40px; border-radius: var(--radius-circle); flex-shrink: 0;"></div>
				<div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-xs);">
					<div class="skeleton" style="width: 50%; height: 14px;"></div>
					<div class="skeleton" style="width: 80%; height: 12px;"></div>
				</div>
			</div>
			<div class="skeleton-avatar-demo" style="margin-top: var(--space-sm);">
				<div class="skeleton" style="width: 40px; height: 40px; border-radius: var(--radius-circle); flex-shrink: 0;"></div>
				<div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-xs);">
					<div class="skeleton" style="width: 40%; height: 14px;"></div>
					<div class="skeleton" style="width: 70%; height: 12px;"></div>
				</div>
			</div>
		</div>

		<!-- Table row -->
		<div class="skeleton-card">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">TABLE ROW</span>
			{#each Array(3) as _}
				<div class="skeleton-table-row">
					<div class="skeleton" style="width: 30%; height: 12px;"></div>
					<div class="skeleton" style="width: 20%; height: 12px;"></div>
					<div class="skeleton" style="width: 15%; height: 12px;"></div>
					<div class="skeleton" style="width: 10%; height: 12px;"></div>
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
		<div class="error-card error-page">
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">PAGE-LEVEL</span>
			<div class="error-demo-page">
				<svg class="error-icon" viewBox="0 0 32 32" fill="none">
					<circle cx="16" cy="16" r="12" stroke="var(--color-destructive)" stroke-width="2"/>
					<path d="M16 10v8M16 22v1" stroke="var(--color-destructive)" stroke-width="2" stroke-linecap="round"/>
				</svg>
				<h4 class="type-heading-sm">Page not found</h4>
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
				<svg class="error-inline-icon" style="margin-top: 2px;" viewBox="0 0 16 16" fill="none">
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
	/* ─── Toast ─── */
	.toast-stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		max-width: var(--toast-max-width);
	}

	.toast {
		display: flex;
		overflow: hidden;
		border-radius: var(--toast-radius);
		border: var(--toast-border);
		box-shadow: var(--toast-shadow);
		background: var(--toast-bg);
	}

	.toast-accent {
		width: 3px;
		flex-shrink: 0;
	}

	.toast-content {
		padding: var(--toast-padding);
		font-family: var(--toast-font);
		font-size: var(--toast-font-size);
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex: 1;
	}

	.toast-action {
		all: unset;
		cursor: pointer;
		flex-shrink: 0;
		transition: opacity var(--duration-instant) var(--easing-default);
	}

	.toast-action:hover {
		opacity: 0.8;
	}

	/* ─── Empty state ─── */
	.empty-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-md);
	}

	.empty-state {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-2xl) var(--space-lg);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--empty-gap);
		text-align: center;
	}

	.empty-icon {
		width: var(--empty-icon-size);
		height: var(--empty-icon-size);
		color: var(--empty-icon-color);
	}

	.empty-icon svg {
		width: 100%;
		height: 100%;
	}

	.empty-action {
		font-family: var(--button-font);
		font-size: var(--button-md-font-size);
		letter-spacing: var(--button-tracking);
		height: var(--button-md-height);
		padding: 0 var(--button-md-padding-x);
		border: none;
		border-radius: var(--button-radius);
		background: var(--color-accent);
		cursor: pointer;
		transition: background var(--button-transition);
	}

	.empty-action:hover {
		background: var(--color-accent-hover);
	}

	.empty-action-secondary {
		font-family: var(--button-font);
		font-size: var(--button-md-font-size);
		letter-spacing: var(--button-tracking);
		height: var(--button-md-height);
		padding: 0 var(--button-md-padding-x);
		border: var(--elevation-border);
		border-radius: var(--button-radius);
		background: transparent;
		cursor: pointer;
		transition: background var(--button-transition);
	}

	.empty-action-secondary:hover {
		background: var(--color-surface-secondary);
	}

	/* ─── Skeleton ─── */
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

	.skeleton {
		background: var(--skeleton-bg);
		border-radius: var(--skeleton-radius);
		position: relative;
		overflow: hidden;
	}

	.skeleton::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, var(--skeleton-shine), transparent);
		animation: shimmer var(--skeleton-duration) infinite;
	}

	@keyframes shimmer {
		100% { left: 100%; }
	}

	.skeleton-card-demo {
		display: flex;
		flex-direction: column;
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

	/* ─── Error state ─── */
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

	.error-banner {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-warning-subtle);
		border: 1px solid var(--color-warning);
		border-radius: var(--radius-sm);
	}

</style>
