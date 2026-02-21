<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';

	const durations = [
		{ name: '--duration-instant', value: '100ms', usage: 'Hover states, color changes, opacity toggles' },
		{ name: '--duration-fast', value: '150ms', usage: 'Micro-interactions: button press, checkbox, toggle' },
		{ name: '--duration-normal', value: '250ms', usage: 'Standard: panel open, dropdown expand, page element enter' },
		{ name: '--duration-slow', value: '400ms', usage: 'Larger movements: modal enter, sidebar collapse' },
		{ name: '--duration-dramatic', value: '600ms+', usage: 'Product-specific dramatic gestures (not system default)' }
	];

	const easings = [
		{
			name: '--easing-default',
			value: 'cubic-bezier(0.2, 0, 0, 1)',
			desc: 'Snappy deceleration. Default for all UI motion.',
			feel: 'Quick start, smooth stop. The workhorse.'
		},
		{
			name: '--easing-enter',
			value: 'cubic-bezier(0, 0, 0.2, 1)',
			desc: 'Elements entering view. Decelerating.',
			feel: 'Slides in and gently settles.'
		},
		{
			name: '--easing-exit',
			value: 'cubic-bezier(0.4, 0, 1, 1)',
			desc: 'Elements leaving view. Accelerating.',
			feel: 'Starts slow, then quickly departs.'
		},
		{
			name: '--easing-linear',
			value: 'linear',
			desc: 'Progress bars, continuous animations only.',
			feel: 'Constant speed. Mechanical.'
		}
	];
</script>

<svelte:head>
	<title>Motion — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Motion"
	description="Functional and snappy. Every animation earns its place — motion serves orientation, feedback, or continuity. Never decorative. 100ms for hover, 150ms for micro, 250ms for standard."
/>

<!-- Duration scale -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Duration Scale</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Hover over each row to see the timing in action.</p>
	<div class="duration-list">
		{#each durations as dur}
			<div class="duration-row">
				<div class="duration-demo">
					<div class="duration-bar" style="transition-duration: var({dur.name}); transition-timing-function: var(--easing-default);"></div>
				</div>
				<div class="duration-meta">
					<code class="type-data token-name">{dur.name}</code>
					<span class="type-label">{dur.value}</span>
					<span class="type-caption">{dur.usage}</span>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Easing curves -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Easing Curves</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Hover over each card to see how the easing feels.</p>
	<div class="easing-grid">
		{#each easings as ease}
			<div class="easing-card">
				<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">{ease.name.replace('--easing-', '').toUpperCase()}</span>
				<div class="easing-demo">
					<div class="easing-dot" style="transition-timing-function: var({ease.name}); transition-duration: var(--duration-normal);"></div>
				</div>
				<code class="type-data" style="font-size: var(--type-caption-size); margin-top: var(--space-sm);">{ease.name}</code>
				<code class="type-caption" style="word-break: break-all;">{ease.value}</code>
				<p class="type-caption" style="margin-top: var(--space-xs); color: var(--color-text-secondary);">{ease.feel}</p>
			</div>
		{/each}
	</div>
</section>

<!-- Interactive hover demo -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Interactive: Duration Tiers</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Hover over these buttons to feel the difference between duration tiers.</p>
	<div class="interactive-grid">
		<button class="motion-button motion-instant">
			<span class="type-label" style="color: var(--color-text-on-accent);">INSTANT (100ms)</span>
		</button>
		<button class="motion-button motion-fast">
			<span class="type-label" style="color: var(--color-text-on-accent);">FAST (150ms)</span>
		</button>
		<button class="motion-button motion-normal">
			<span class="type-label" style="color: var(--color-text-on-accent);">NORMAL (250ms)</span>
		</button>
		<button class="motion-button motion-slow">
			<span class="type-label" style="color: var(--color-text-on-accent);">SLOW (400ms)</span>
		</button>
		<button class="motion-button motion-dramatic">
			<span class="type-label" style="color: var(--color-text-on-accent);">DRAMATIC (600ms)</span>
		</button>
	</div>
</section>

<!-- Choreography rules -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Choreography Rules</h2>
	<div class="rules-grid">
		<div class="rule-card rule-do">
			<span class="type-label" style="color: var(--color-success); margin-bottom: var(--space-sm); display: block;">DO</span>
			<ul class="rule-list">
				<li class="type-body-sm">Use <code class="type-data">transform</code> and <code class="type-data">opacity</code> for animations</li>
				<li class="type-body-sm">Elements enter from the direction they will exit to</li>
				<li class="type-body-sm">Stagger list items: 30ms between items, max 150ms total</li>
				<li class="type-body-sm">Hover states are instant (100ms) — never make the user wait</li>
			</ul>
		</div>
		<div class="rule-card rule-dont">
			<span class="type-label" style="color: var(--color-destructive); margin-bottom: var(--space-sm); display: block;">DON'T</span>
			<ul class="rule-list">
				<li class="type-body-sm">Animate layout properties (<code class="type-data">width</code>, <code class="type-data">height</code>, <code class="type-data">top</code>, <code class="type-data">left</code>)</li>
				<li class="type-body-sm">Add motion that does not serve orientation, feedback, or continuity</li>
				<li class="type-body-sm">Use spring physics or bouncy easings (system default is snappy)</li>
				<li class="type-body-sm">Stagger more than 5 items — after 5, all remaining appear instantly</li>
			</ul>
		</div>
	</div>
</section>

<!-- Key rule callout -->
<Callout title="KEY RULE">
	<p class="type-body">
		Every animation must earn its place by serving <strong>orientation</strong> (where am I?),
		<strong>feedback</strong> (did that work?), or <strong>continuity</strong> (where did that go?).
		If an animation does not serve one of these three purposes, remove it.
	</p>
</Callout>

<style>
	.duration-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.duration-row {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-surface);
		border-bottom: var(--elevation-border);
	}

	.duration-row:last-child {
		border-bottom: none;
	}

	.duration-demo {
		flex-shrink: 0;
		width: 120px;
		height: 8px;
		background: var(--color-surface-tertiary);
		border-radius: var(--radius-pill);
		overflow: hidden;
	}

	.duration-bar {
		width: 0%;
		height: 100%;
		background: var(--color-accent);
		border-radius: var(--radius-pill);
		transition-property: width;
	}

	.duration-row:hover .duration-bar {
		width: 100%;
	}

	.duration-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.token-name {
		font-size: var(--type-caption-size);
		color: var(--color-text);
	}

	.easing-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-md);
	}

	.easing-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
	}

	.easing-demo {
		width: 100%;
		height: 40px;
		background: var(--color-surface-secondary);
		border-radius: var(--radius-sm);
		position: relative;
		overflow: hidden;
	}

	.easing-dot {
		width: 24px;
		height: 24px;
		background: var(--color-accent);
		border-radius: var(--radius-circle);
		position: absolute;
		top: 8px;
		left: 8px;
		transition-property: transform;
	}

	.easing-card:hover .easing-dot {
		transform: translateX(calc(100% + 60px));
	}

	.interactive-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
	}

	.motion-button {
		font-family: var(--button-font);
		letter-spacing: var(--button-tracking);
		height: var(--button-md-height);
		padding: 0 var(--button-md-padding-x);
		border: none;
		border-radius: var(--button-radius);
		background: var(--color-accent);
		cursor: pointer;
		transition-property: background-color, transform;
		transition-timing-function: var(--easing-default);
	}

	.motion-instant { transition-duration: var(--duration-instant); }
	.motion-fast { transition-duration: var(--duration-fast); }
	.motion-normal { transition-duration: var(--duration-normal); }
	.motion-slow { transition-duration: var(--duration-slow); }
	.motion-dramatic { transition-duration: var(--duration-dramatic); }

	.motion-button:hover {
		background: var(--color-accent-hover);
		transform: scale(1.05);
	}

	.motion-button:active {
		transform: scale(0.97);
	}

	.rules-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-md);
	}

	.rule-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.rule-do {
		border-left: 3px solid var(--color-success);
	}

	.rule-dont {
		border-left: 3px solid var(--color-destructive);
	}

	.rule-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.rule-list li {
		padding-left: var(--space-md);
		position: relative;
	}

	.rule-list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 8px;
		width: 6px;
		height: 6px;
		border-radius: var(--radius-circle);
		background: var(--color-text-muted);
	}

	.rule-list code {
		font-size: var(--type-label-size);
	}

</style>
