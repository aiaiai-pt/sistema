<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
</script>

<svelte:head>
	<title>Principles — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Design Principles"
	description="Five principles derived from the aiaiai studio manifesto. Every design decision should pass through these filters."
/>

<!-- Principle 1: Warmth over sterility -->
<section class="principle-section">
	<div class="principle-header">
		<span class="type-data principle-number">01</span>
		<h2 class="type-heading-lg">Warmth over sterility</h2>
	</div>
	<p class="type-body" style="color: var(--color-text-secondary); max-width: var(--content-width-narrow); margin-bottom: var(--space-lg);">
		Earth tones, aged paper, warm shadows. Never clinical white, never pure black.
		The screen should feel like a well-loved object, not a light source.
	</p>
	<div class="comparison-grid">
		<div class="comparison-card comparison-do">
			<span class="type-label" style="color: var(--color-success); margin-bottom: var(--space-sm); display: block;">DO</span>
			<div class="comparison-demo" style="background: var(--color-surface); border: var(--elevation-border);">
				<div style="padding: var(--space-lg);">
					<h3 class="type-heading-sm" style="color: var(--color-text);">Project title</h3>
					<p class="type-body-sm" style="color: var(--color-text-secondary);">Warm paper surface, warm text colors, subtle warm border.</p>
				</div>
			</div>
			<span class="type-caption" style="margin-top: var(--space-xs);">Warm neutrals (#f7f5f3 surface, #2c2825 text)</span>
		</div>
		<div class="comparison-card comparison-dont">
			<span class="type-label" style="color: var(--color-destructive); margin-bottom: var(--space-sm); display: block;">DON'T</span>
			<div class="comparison-demo" style="background: #ffffff; border: 1px solid #e5e5e5;">
				<div style="padding: var(--space-lg);">
					<h3 style="font-family: var(--font-sans); font-size: var(--type-heading-sm-size); font-weight: var(--type-heading-sm-weight); color: #000000;">Project title</h3>
					<p style="font-family: var(--font-sans); font-size: var(--type-body-sm-size); color: #6b7280;">Clinical white, pure black text, cold gray border.</p>
				</div>
			</div>
			<span class="type-caption" style="margin-top: var(--space-xs);">Pure white (#ffffff) and pure black (#000000)</span>
		</div>
	</div>
</section>

<!-- Principle 2: Decisive color, not decorative -->
<section class="principle-section">
	<div class="principle-header">
		<span class="type-data principle-number">02</span>
		<h2 class="type-heading-lg">Decisive color, not decorative</h2>
	</div>
	<p class="type-body" style="color: var(--color-text-secondary); max-width: var(--content-width-narrow); margin-bottom: var(--space-lg);">
		Orange means creation and focus. Red means destruction. Color carries meaning.
		If a color does not have a job, it does not appear.
	</p>
	<div class="comparison-grid">
		<div class="comparison-card comparison-do">
			<span class="type-label" style="color: var(--color-success); margin-bottom: var(--space-sm); display: block;">DO</span>
			<div class="comparison-demo" style="background: var(--color-surface); border: var(--elevation-border); padding: var(--space-lg);">
				<div style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-md);">
					<button style="font-family: var(--button-font); font-size: var(--button-md-font-size); letter-spacing: var(--button-tracking); height: var(--button-md-height); padding: 0 var(--button-md-padding-x); border: none; border-radius: var(--button-radius); background: var(--color-accent); color: var(--color-text-on-accent); cursor: pointer;">CREATE</button>
					<button style="font-family: var(--button-font); font-size: var(--button-md-font-size); letter-spacing: var(--button-tracking); height: var(--button-md-height); padding: 0 var(--button-md-padding-x); border: none; border-radius: var(--button-radius); background: var(--color-destructive); color: var(--color-text-on-accent); cursor: pointer;">DELETE</button>
				</div>
				<span class="type-caption">Orange = creation. Red = destruction. Each color has a job.</span>
			</div>
		</div>
		<div class="comparison-card comparison-dont">
			<span class="type-label" style="color: var(--color-destructive); margin-bottom: var(--space-sm); display: block;">DON'T</span>
			<div class="comparison-demo" style="background: var(--color-surface); border: var(--elevation-border); padding: var(--space-lg);">
				<div style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-md);">
					<button style="font-family: var(--button-font); font-size: var(--button-md-font-size); letter-spacing: var(--button-tracking); height: var(--button-md-height); padding: 0 var(--button-md-padding-x); border: none; border-radius: var(--button-radius); background: #8b5cf6; color: white; cursor: pointer;">SAVE</button>
					<button style="font-family: var(--button-font); font-size: var(--button-md-font-size); letter-spacing: var(--button-tracking); height: var(--button-md-height); padding: 0 var(--button-md-padding-x); border: none; border-radius: var(--button-radius); background: #ec4899; color: white; cursor: pointer;">SHARE</button>
				</div>
				<span class="type-caption">Decorative colors with no semantic meaning.</span>
			</div>
		</div>
	</div>
</section>

<!-- Principle 3: Breathing space is information -->
<section class="principle-section">
	<div class="principle-header">
		<span class="type-data principle-number">03</span>
		<h2 class="type-heading-lg">Breathing space is information</h2>
	</div>
	<p class="type-body" style="color: var(--color-text-secondary); max-width: var(--content-width-narrow); margin-bottom: var(--space-lg);">
		Whitespace is not empty — it creates rhythm, hierarchy, and calm.
		Dense information is fine, but it needs room to breathe. Silence is as important as content.
	</p>
	<div class="comparison-grid">
		<div class="comparison-card comparison-do">
			<span class="type-label" style="color: var(--color-success); margin-bottom: var(--space-sm); display: block;">DO</span>
			<div class="comparison-demo" style="background: var(--color-surface); border: var(--elevation-border); padding: var(--space-lg);">
				<h3 class="type-heading-sm" style="margin-bottom: var(--space-lg);">Section Title</h3>
				<div style="display: flex; flex-direction: column; gap: var(--space-md);">
					<div style="border: var(--elevation-border); border-radius: var(--radius-md); padding: var(--space-md);">
						<span class="type-body-sm">Item one</span>
					</div>
					<div style="border: var(--elevation-border); border-radius: var(--radius-md); padding: var(--space-md);">
						<span class="type-body-sm">Item two</span>
					</div>
				</div>
			</div>
			<span class="type-caption" style="margin-top: var(--space-xs);">Generous spacing creates visual hierarchy</span>
		</div>
		<div class="comparison-card comparison-dont">
			<span class="type-label" style="color: var(--color-destructive); margin-bottom: var(--space-sm); display: block;">DON'T</span>
			<div class="comparison-demo" style="background: var(--color-surface); border: var(--elevation-border); padding: var(--space-xs);">
				<h3 style="font-family: var(--font-sans); font-size: var(--type-heading-sm-size); font-weight: var(--type-heading-sm-weight); margin-bottom: var(--space-2xs);">Section Title</h3>
				<div style="display: flex; flex-direction: column; gap: var(--space-2xs);">
					<div style="border: var(--elevation-border); padding: var(--space-xs);">
						<span class="type-body-sm">Item one</span>
					</div>
					<div style="border: var(--elevation-border); padding: var(--space-xs);">
						<span class="type-body-sm">Item two</span>
					</div>
				</div>
			</div>
			<span class="type-caption" style="margin-top: var(--space-xs);">Cramped layout with no room to breathe</span>
		</div>
	</div>
</section>

<!-- Principle 4: Every animation earns its place -->
<section class="principle-section">
	<div class="principle-header">
		<span class="type-data principle-number">04</span>
		<h2 class="type-heading-lg">Every animation earns its place</h2>
	</div>
	<p class="type-body" style="color: var(--color-text-secondary); max-width: var(--content-width-narrow); margin-bottom: var(--space-lg);">
		Motion serves orientation, feedback, or continuity. 150-300ms for UI transitions,
		longer for dramatic gestures. Never decorative motion.
	</p>
	<div class="comparison-grid">
		<div class="comparison-card comparison-do">
			<span class="type-label" style="color: var(--color-success); margin-bottom: var(--space-sm); display: block;">DO</span>
			<div class="comparison-demo" style="background: var(--color-surface); border: var(--elevation-border); padding: var(--space-lg);">
				<button class="demo-btn-earned" style="font-family: var(--button-font); font-size: var(--button-md-font-size); letter-spacing: var(--button-tracking); height: var(--button-md-height); padding: 0 var(--button-md-padding-x); border: none; border-radius: var(--button-radius); background: var(--color-accent); color: var(--color-text-on-accent); cursor: pointer; transition: background var(--duration-instant) var(--easing-default);">HOVER ME</button>
				<p class="type-caption" style="margin-top: var(--space-sm);">100ms color change on hover = instant feedback.</p>
			</div>
		</div>
		<div class="comparison-card comparison-dont">
			<span class="type-label" style="color: var(--color-destructive); margin-bottom: var(--space-sm); display: block;">DON'T</span>
			<div class="comparison-demo" style="background: var(--color-surface); border: var(--elevation-border); padding: var(--space-lg);">
				<button class="demo-btn-decorative" style="font-family: var(--button-font); font-size: var(--button-md-font-size); letter-spacing: var(--button-tracking); height: var(--button-md-height); padding: 0 var(--button-md-padding-x); border: none; border-radius: var(--button-radius); background: var(--color-accent); color: var(--color-text-on-accent); cursor: pointer; transition: all 800ms ease-in-out;">HOVER ME</button>
				<p class="type-caption" style="margin-top: var(--space-sm);">800ms bouncy animation adds nothing but delay.</p>
			</div>
		</div>
	</div>
</section>

<!-- Principle 5: Precision typography -->
<section class="principle-section">
	<div class="principle-header">
		<span class="type-data principle-number">05</span>
		<h2 class="type-heading-lg">Precision typography</h2>
	</div>
	<p class="type-body" style="color: var(--color-text-secondary); max-width: var(--content-width-narrow); margin-bottom: var(--space-lg);">
		Monospace for data (numbers, code, time). Sans for interface.
		Display for brand moments. No font appears without a reason. Every character earns its place.
	</p>
	<div class="comparison-grid">
		<div class="comparison-card comparison-do">
			<span class="type-label" style="color: var(--color-success); margin-bottom: var(--space-sm); display: block;">DO</span>
			<div class="comparison-demo" style="background: var(--color-surface); border: var(--elevation-border); padding: var(--space-lg);">
				<div style="display: flex; flex-direction: column; gap: var(--space-sm);">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<span class="type-label">BUILD TIME</span>
						<span class="type-data">2m 34s</span>
					</div>
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<span class="type-label">DEPLOY</span>
						<span class="type-data">2026-02-20</span>
					</div>
					<p class="type-body-sm" style="margin-top: var(--space-sm);">Labels in mono, data in mono, prose in sans.</p>
				</div>
			</div>
		</div>
		<div class="comparison-card comparison-dont">
			<span class="type-label" style="color: var(--color-destructive); margin-bottom: var(--space-sm); display: block;">DON'T</span>
			<div class="comparison-demo" style="background: var(--color-surface); border: var(--elevation-border); padding: var(--space-lg);">
				<div style="display: flex; flex-direction: column; gap: var(--space-sm);">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<span style="font-family: var(--font-sans); font-size: var(--type-body-sm-size);">Build Time</span>
						<span style="font-family: var(--font-sans); font-size: var(--type-body-sm-size);">2m 34s</span>
					</div>
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<span style="font-family: var(--font-sans); font-size: var(--type-body-sm-size);">Deploy</span>
						<span style="font-family: var(--font-sans); font-size: var(--type-body-sm-size);">2026-02-20</span>
					</div>
					<p class="type-body-sm" style="margin-top: var(--space-sm);">Everything in sans. Data and labels lose their structural clarity.</p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.principle-section {
		margin-bottom: var(--space-3xl);
		padding-bottom: var(--space-2xl);
		border-bottom: var(--elevation-border);
	}

	.principle-section:last-of-type {
		border-bottom: none;
	}

	.principle-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-md);
		margin-bottom: var(--space-sm);
	}

	.principle-number {
		font-size: var(--type-data-size);
		color: var(--color-accent);
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.comparison-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.comparison-card {
		display: flex;
		flex-direction: column;
	}

	.comparison-demo {
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.demo-btn-earned:hover {
		background: var(--color-accent-hover) !important;
	}

	.demo-btn-decorative:hover {
		background: var(--color-accent-hover) !important;
		transform: scale(1.1) rotate(2deg);
		box-shadow: var(--elevation-overlay);
	}
</style>
