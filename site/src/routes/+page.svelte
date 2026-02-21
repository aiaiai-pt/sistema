<script lang="ts">
	let toggleOn = $state(true);
	let progress = $state(72);
	let time = $state('');

	$effect(() => {
		const update = () => {
			const now = new Date();
			time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		};
		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>aiaiai Design System</title>
</svelte:head>

<!-- Hero: minimal, then get out of the way -->
<div class="hero">
	<h1 class="type-display">aiaiai</h1>
	<p class="type-body" style="color: var(--color-text-secondary); max-width: var(--content-width-narrow);">
		The design system for aiaiai studio. Switch themes in the sidebar —
		every element on this page adapts without code changes.
	</p>
</div>

<!-- Live specimen: a mini-app interface that demonstrates every foundation -->
<section class="specimen">
	<div class="specimen-header">
		<span class="type-label">LIVE SPECIMEN</span>
		<span class="type-data clock">{time}</span>
	</div>

	<div class="specimen-body">
		<!-- Row 1: Metrics + Status -->
		<div class="metrics-row">
			<div class="metric-card">
				<span class="type-label">PROJECTS</span>
				<span class="type-data metric-value">12</span>
				<span class="metric-trend trend-up">
					<svg viewBox="0 0 12 12" fill="none" class="trend-icon"><path d="M2 8l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
					<span class="type-caption">+3 this month</span>
				</span>
			</div>
			<div class="metric-card">
				<span class="type-label">TOKENS</span>
				<span class="type-data metric-value">186</span>
				<span class="metric-trend">
					<span class="type-caption">across 3 tiers</span>
				</span>
			</div>
			<div class="metric-card">
				<span class="type-label">THEMES</span>
				<span class="type-data metric-value">3</span>
				<span class="metric-trend">
					<span class="type-caption">default + 2 examples</span>
				</span>
			</div>
			<div class="metric-card">
				<span class="type-label">COVERAGE</span>
				<span class="type-data metric-value">{progress}%</span>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%;"></div>
				</div>
			</div>
		</div>

		<!-- Row 2: Component showcase panel -->
		<div class="panel-row">
			<!-- Left: Interactive form fragment -->
			<div class="panel">
				<div class="panel-header">
					<span class="type-label">CONTROLS</span>
				</div>
				<div class="panel-content">
					<div class="control-group">
						<label class="control-label type-label">PROJECT NAME</label>
						<input type="text" class="control-input" placeholder="e.g. Still Phone" value="Still Phone" />
					</div>
					<div class="control-group">
						<label class="control-label type-label">STATUS</label>
						<div class="status-row">
							<span class="badge badge-success">
								<span class="badge-dot"></span>
								<span class="type-caption">Active</span>
							</span>
							<span class="badge badge-warning">
								<span class="badge-dot"></span>
								<span class="type-caption">Review</span>
							</span>
							<span class="badge badge-info">
								<span class="badge-dot"></span>
								<span class="type-caption">Draft</span>
							</span>
						</div>
					</div>
					<div class="control-group">
						<label class="control-label type-label">PUBLISH</label>
						<div class="toggle-row">
							<button
								class="toggle"
								class:toggle-on={toggleOn}
								onclick={() => toggleOn = !toggleOn}
								role="switch"
								aria-checked={toggleOn}
							>
								<span class="toggle-knob"></span>
							</button>
							<span class="type-body-sm">{toggleOn ? 'Live' : 'Draft'}</span>
						</div>
					</div>
					<div class="control-actions">
						<button class="btn btn-primary">
							<span class="type-label" style="color: var(--color-text-on-accent);">SAVE</span>
						</button>
						<button class="btn btn-secondary">
							<span class="type-label">CANCEL</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Right: Data table fragment -->
			<div class="panel">
				<div class="panel-header">
					<span class="type-label">RECENT ACTIVITY</span>
				</div>
				<div class="panel-content table-content">
					<div class="table-row">
						<div class="table-cell-main">
							<span class="type-body-sm" style="color: var(--color-text);">Color tokens updated</span>
							<span class="type-caption">tokens/base.css</span>
						</div>
						<span class="type-data table-time">2m ago</span>
					</div>
					<div class="table-row">
						<div class="table-cell-main">
							<span class="type-body-sm" style="color: var(--color-text);">Button component added</span>
							<span class="type-caption">components/button</span>
						</div>
						<span class="type-data table-time">15m ago</span>
					</div>
					<div class="table-row">
						<div class="table-cell-main">
							<span class="type-body-sm" style="color: var(--color-text);">Branded theme created</span>
							<span class="type-caption">themes/verdant-finance</span>
						</div>
						<span class="type-data table-time">1h ago</span>
					</div>
					<div class="table-row">
						<div class="table-cell-main">
							<span class="type-body-sm" style="color: var(--color-text);">Typography scale refined</span>
							<span class="type-caption">tokens/semantic.css</span>
						</div>
						<span class="type-data table-time">3h ago</span>
					</div>
					<div class="table-row">
						<div class="table-cell-main">
							<span class="type-body-sm" style="color: var(--color-text);">Feedback states completed</span>
							<span class="type-caption">components/feedback</span>
						</div>
						<span class="type-data table-time">1d ago</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Row 3: Surface hierarchy demo -->
		<div class="surfaces-row">
			<div class="surface-card surface-primary">
				<span class="type-label">SURFACE</span>
				<span class="type-caption">Primary background</span>
			</div>
			<div class="surface-card surface-secondary">
				<span class="type-label">SURFACE-SECONDARY</span>
				<span class="type-caption">Sidebar, cards</span>
			</div>
			<div class="surface-card surface-tertiary">
				<span class="type-label">SURFACE-TERTIARY</span>
				<span class="type-caption">Hover, active</span>
			</div>
			<div class="surface-card surface-accent">
				<span class="type-label" style="color: var(--color-text-on-accent);">ACCENT</span>
				<span class="type-caption" style="color: var(--color-text-on-accent); opacity: 0.8;">Primary action</span>
			</div>
		</div>
	</div>
</section>

<!-- Typography specimen -->
<section class="type-specimen">
	<span class="type-label" style="margin-bottom: var(--space-md); display: block;">TYPE SCALE</span>
	<div class="type-stack">
		<span class="type-display">Display</span>
		<span class="type-heading-lg">Heading Large</span>
		<span class="type-heading">Heading</span>
		<span class="type-heading-sm">Heading Small</span>
		<span class="type-body">Body — Instrument Sans for prose, the quiet backdrop.</span>
		<span class="type-body-sm">Body Small — Secondary information, help text.</span>
		<span class="type-label">LABEL — BERKELEY MONO, THE EXPOSED MECHANISM</span>
		<span class="type-data">Data — 186 tokens, 3 tiers, 2 themes</span>
		<span class="type-caption">Caption — Fine print, timestamps, footnotes.</span>
	</div>
</section>

<!-- Quick nav -->
<section class="quicknav">
	<a href="/system/getting-started" class="quicknav-card">
		<span class="type-label">GETTING STARTED</span>
		<span class="type-body-sm">Install, import, verify.</span>
	</a>
	<a href="/foundations/color" class="quicknav-card">
		<span class="type-label">COLOR</span>
		<span class="type-body-sm">Warm neutrals, decisive accent.</span>
	</a>
	<a href="/foundations/typography" class="quicknav-card">
		<span class="type-label">TYPOGRAPHY</span>
		<span class="type-body-sm">Sans for prose, mono for data.</span>
	</a>
	<a href="/system/theming" class="quicknav-card">
		<span class="type-label">THEMING</span>
		<span class="type-body-sm">Branded or bespoke, your call.</span>
	</a>
</section>

<style>
	/* ─── Hero ─── */
	.hero {
		margin-bottom: var(--space-2xl);
	}

	.hero h1 {
		margin-bottom: var(--space-xs);
	}

	/* ─── Live specimen ─── */
	.specimen {
		border: var(--elevation-border-strong);
		border-radius: var(--radius-md);
		overflow: hidden;
		margin-bottom: var(--space-2xl);
	}

	.specimen-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-secondary);
		border-bottom: var(--elevation-border);
	}

	.clock {
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.specimen-body {
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	/* ─── Metrics ─── */
	.metrics-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-md);
	}

	.metric-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.metric-value {
		font-size: var(--type-heading-lg-size);
		line-height: 1;
		color: var(--color-text);
	}

	.metric-trend {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.trend-up {
		color: var(--color-success);
	}

	.trend-icon {
		width: 12px;
		height: 12px;
	}

	.progress-bar {
		height: 4px;
		background: var(--color-surface-tertiary);
		border-radius: var(--radius-pill);
		overflow: hidden;
		margin-top: 2px;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: var(--radius-pill);
		transition: width var(--duration-normal) var(--easing-default);
	}

	/* ─── Panels ─── */
	.panel-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-md);
	}

	.panel {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.panel-header {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-secondary);
		border-bottom: var(--elevation-border);
	}

	.panel-content {
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	/* ─── Controls ─── */
	.control-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.control-label {
		color: var(--color-text-secondary);
	}

	.control-input {
		font-family: var(--type-data-font);
		font-size: var(--type-data-size);
		height: var(--input-md-height);
		padding: 0 var(--input-md-padding-x);
		border: var(--input-border);
		border-radius: var(--input-radius);
		background: var(--input-bg);
		color: var(--input-text);
		transition: border var(--input-transition);
		width: 100%;
	}

	.control-input:focus {
		outline: none;
		border: var(--input-border-focus);
	}

	.control-input::placeholder {
		color: var(--input-placeholder);
	}

	.status-row {
		display: flex;
		gap: var(--space-sm);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-pill);
	}

	.badge-dot {
		width: 6px;
		height: 6px;
		border-radius: var(--radius-circle);
	}

	.badge-success {
		background: var(--color-success-subtle);
	}

	.badge-success .badge-dot {
		background: var(--color-success);
	}

	.badge-success .type-caption {
		color: var(--color-success);
	}

	.badge-warning {
		background: var(--color-warning-subtle);
	}

	.badge-warning .badge-dot {
		background: var(--color-warning);
	}

	.badge-warning .type-caption {
		color: var(--color-warning);
	}

	.badge-info {
		background: var(--color-info-subtle);
	}

	.badge-info .badge-dot {
		background: var(--color-info);
	}

	.badge-info .type-caption {
		color: var(--color-info);
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.toggle {
		width: var(--toggle-width);
		height: var(--toggle-height);
		border-radius: var(--toggle-radius);
		background: var(--toggle-bg-off);
		position: relative;
		cursor: pointer;
		transition: background var(--duration-fast) var(--easing-default);
		border: none;
		padding: 0;
		flex-shrink: 0;
	}

	.toggle-on {
		background: var(--toggle-bg-on);
	}

	.toggle-knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: var(--toggle-knob-size);
		height: var(--toggle-knob-size);
		border-radius: var(--radius-circle);
		background: var(--toggle-knob-color);
		transition: transform var(--duration-fast) var(--easing-default);
	}

	.toggle-on .toggle-knob {
		transform: translateX(calc(var(--toggle-width) - var(--toggle-knob-size) - 4px));
	}

	.control-actions {
		display: flex;
		gap: var(--space-sm);
		padding-top: var(--space-xs);
	}

	.btn {
		all: unset;
		cursor: pointer;
		height: var(--button-md-height);
		padding: 0 var(--button-md-padding-x);
		border-radius: var(--button-radius);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all var(--button-transition);
	}

	.btn-primary {
		background: var(--button-primary-bg);
	}

	.btn-primary:hover {
		background: var(--button-primary-bg-hover);
	}

	.btn-secondary {
		background: var(--button-secondary-bg);
		border: var(--button-secondary-border);
	}

	.btn-secondary:hover {
		background: var(--button-secondary-bg-hover);
	}

	/* ─── Table ─── */
	.table-content {
		padding: 0;
		gap: 0;
	}

	.table-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		border-bottom: var(--elevation-border);
		transition: background var(--duration-instant) var(--easing-default);
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-row:hover {
		background: var(--color-surface-secondary);
	}

	.table-cell-main {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.table-time {
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	/* ─── Surfaces ─── */
	.surfaces-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-md);
	}

	.surface-card {
		border-radius: var(--radius-md);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		border: var(--elevation-border);
	}

	.surface-primary {
		background: var(--color-surface);
	}

	.surface-secondary {
		background: var(--color-surface-secondary);
	}

	.surface-tertiary {
		background: var(--color-surface-tertiary);
	}

	.surface-accent {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	/* ─── Type specimen ─── */
	.type-specimen {
		margin-bottom: var(--space-2xl);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.type-stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	/* ─── Quick nav ─── */
	.quicknav {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-md);
		margin-bottom: var(--space-2xl);
	}

	.quicknav-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		text-decoration: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		transition: all var(--duration-instant) var(--easing-default);
	}

	.quicknav-card:hover {
		border-color: var(--color-accent);
		background: var(--color-accent-subtle);
	}

	.quicknav-card .type-label {
		color: var(--color-accent);
	}
</style>
