<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Callout from '$lib/components/Callout.svelte';
</script>

<svelte:head>
	<title>Theming — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Theming"
	description="Two-tier theming architecture. Tier 1 (Branded) swaps accent and surfaces. Tier 2 (Bespoke) is a full personality shift. Use the theme switcher in the sidebar to see both tiers applied live."
/>

<!-- Architecture overview -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Architecture</h2>
	<div class="arch-diagram">
		<div class="arch-layer">
			<span class="type-label">BASE TOKENS</span>
			<code class="type-data arch-file">tokens/base.css</code>
			<span class="type-caption">Raw values. Never used directly in components.</span>
		</div>
		<div class="arch-arrow">
			<svg viewBox="0 0 24 24" fill="none" class="arrow-icon">
				<path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</div>
		<div class="arch-layer">
			<span class="type-label">SEMANTIC TOKENS</span>
			<code class="type-data arch-file">tokens/semantic.css</code>
			<span class="type-caption">Role-based aliases. This is what themes override.</span>
		</div>
		<div class="arch-arrow">
			<svg viewBox="0 0 24 24" fill="none" class="arrow-icon">
				<path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</div>
		<div class="arch-layer">
			<span class="type-label">COMPONENT TOKENS</span>
			<code class="type-data arch-file">tokens/components.css</code>
			<span class="type-caption">Component-scoped. Reference semantic tokens.</span>
		</div>
	</div>
</section>

<!-- Tier 1: Branded -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-sm);">Tier 1: Branded</h2>
	<p class="type-body-sm" style="color: var(--color-text-secondary); margin-bottom: var(--space-lg);">
		Client dashboards, whitelabel products, internal tools with client branding.
		The result still feels like an aiaiai product, but with the client's color identity.
	</p>

	<div class="tier-grid">
		<div class="tier-card">
			<span class="type-label" style="color: var(--color-success); margin-bottom: var(--space-sm); display: block;">WHAT CHANGES</span>
			<ul class="tier-list">
				<li class="type-body-sm">Accent color (orange to client brand)</li>
				<li class="type-body-sm">Surface tint direction (warm/cool)</li>
				<li class="type-body-sm">Border colors (follow surface tint)</li>
				<li class="type-body-sm">Text colors (follow tint direction)</li>
				<li class="type-body-sm">Overlay tint</li>
			</ul>
		</div>
		<div class="tier-card">
			<span class="type-label" style="color: var(--color-accent); margin-bottom: var(--space-sm); display: block;">WHAT STAYS</span>
			<ul class="tier-list">
				<li class="type-body-sm">Typography (Instrument Sans + Berkeley Mono)</li>
				<li class="type-body-sm">Spacing scale (8px grid)</li>
				<li class="type-body-sm">Motion language (snappy, functional)</li>
				<li class="type-body-sm">Radius scale (sharp, precise)</li>
				<li class="type-body-sm">Elevation model (borders over shadows)</li>
				<li class="type-body-sm">Component sizing</li>
			</ul>
		</div>
	</div>

	<div class="token-count">
		<span class="type-data" style="font-size: var(--type-display-size); color: var(--color-accent);">&lt;20</span>
		<span class="type-label">TOKENS TO OVERRIDE</span>
	</div>

	<!-- Example: Verdant Finance -->
	<div class="example-block">
		<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">EXAMPLE: VERDANT FINANCE</span>
		<p class="type-body-sm" style="margin-bottom: var(--space-md); color: var(--color-text-secondary);">
			A fintech client that uses teal instead of orange. Cooler surface tint.
			Switch to "Branded (Tier 1)" in the sidebar to see this live.
		</p>
		<div class="code-block">
			<pre class="type-data code-pre"><code>[data-theme="branded-example"] &#123;
  /* Accent: teal instead of orange */
  --color-accent: #0d9488;
  --color-accent-hover: #0f766e;
  --color-accent-subtle: #f0fdfa;

  /* Surface: cooler tint direction */
  --color-surface: #f8faf9;
  --color-surface-secondary: #f0f4f2;
  --color-surface-tertiary: #e4ebe7;

  /* Borders: slightly cooler */
  --color-border: #d4ddd8;
  --color-border-strong: #a8b8b0;

  /* Text: still warm, slightly cooled */
  --color-text: #1a2c25;
  --color-text-secondary: #4a6358;
  --color-text-muted: #7a9488;

  /* Total: 14 tokens */
&#125;</code></pre>
		</div>
	</div>
</section>

<!-- Tier 2: Bespoke -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-sm);">Tier 2: Bespoke</h2>
	<p class="type-body-sm" style="color: var(--color-text-secondary); margin-bottom: var(--space-lg);">
		Client-facing consumer products where aiaiai builds something that
		does not look like aiaiai. Full personality shift.
	</p>

	<div class="tier-grid">
		<div class="tier-card">
			<span class="type-label" style="color: var(--color-success); margin-bottom: var(--space-sm); display: block;">WHAT CHANGES</span>
			<ul class="tier-list">
				<li class="type-body-sm">Full color palette</li>
				<li class="type-body-sm">Typography pairing (different fonts)</li>
				<li class="type-body-sm">Surface materials (texture vs. flat)</li>
				<li class="type-body-sm">Motion personality (snappy vs. bouncy)</li>
				<li class="type-body-sm">Elevation style (shadows vs. borders)</li>
				<li class="type-body-sm">Radius language (sharp vs. rounded)</li>
				<li class="type-body-sm">Component sizing and feel</li>
			</ul>
		</div>
		<div class="tier-card">
			<span class="type-label" style="color: var(--color-accent); margin-bottom: var(--space-sm); display: block;">WHAT STAYS</span>
			<ul class="tier-list">
				<li class="type-body-sm">Spacing scale (8px grid, non-negotiable)</li>
				<li class="type-body-sm">Grid structure and breakpoints</li>
				<li class="type-body-sm">Accessibility minimums (contrast, touch targets)</li>
				<li class="type-body-sm">Token naming convention</li>
				<li class="type-body-sm">Semantic color roles</li>
			</ul>
		</div>
	</div>

	<div class="token-count">
		<span class="type-data" style="font-size: var(--type-display-size); color: var(--color-accent);">40-80</span>
		<span class="type-label">TOKENS TO OVERRIDE</span>
	</div>

	<!-- Example: Sprout -->
	<div class="example-block">
		<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">EXAMPLE: SPROUT (CHILDREN'S APP)</span>
		<p class="type-body-sm" style="margin-bottom: var(--space-md); color: var(--color-text-secondary);">
			A fictional children's learning app. Purple accent, rounded corners, bouncy motion, shadow-based elevation.
			Switch to "Bespoke (Tier 2)" in the sidebar to see this live.
		</p>
		<div class="code-block">
			<pre class="type-data code-pre"><code>[data-theme="bespoke-example"] &#123;
  /* Full color palette override */
  --color-accent: #7c3aed;
  --color-surface: #fffdf7;
  --color-text: #2d2006;

  /* Different fonts entirely */
  --font-sans: "Nunito", "Quicksand", sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;

  /* Larger type for children */
  --type-body-size: var(--raw-font-size-18);

  /* Shadows instead of borders */
  --elevation-border: none;
  --elevation-raised: 0 2px 8px rgba(60,40,10,0.1), ...;

  /* Rounded, friendly radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Bouncy easing */
  --easing-default: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Total: ~54 tokens */
&#125;</code></pre>
		</div>
	</div>
</section>

<!-- How to create a theme -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Creating a Theme</h2>
	<div class="steps-list">
		<div class="step">
			<span class="type-data step-number">1</span>
			<div class="step-content">
				<h3 class="type-heading-sm">Choose your tier</h3>
				<p class="type-body-sm" style="color: var(--color-text-secondary);">
					Tier 1 if the product should still feel like aiaiai with different colors.
					Tier 2 if it should be a completely different product.
				</p>
			</div>
		</div>
		<div class="step">
			<span class="type-data step-number">2</span>
			<div class="step-content">
				<h3 class="type-heading-sm">Create a theme file</h3>
				<p class="type-body-sm" style="color: var(--color-text-secondary);">
					Copy the appropriate example file and override the tokens.
				</p>
				<div class="code-block" style="margin-top: var(--space-sm);">
					<code class="type-data" style="font-size: var(--type-label-size);">tokens/themes/my-client.css</code>
				</div>
			</div>
		</div>
		<div class="step">
			<span class="type-data step-number">3</span>
			<div class="step-content">
				<h3 class="type-heading-sm">Scope with data-theme attribute</h3>
				<p class="type-body-sm" style="color: var(--color-text-secondary);">
					All overrides go inside a <code class="type-data">[data-theme="my-client"]</code> selector.
				</p>
				<div class="code-block" style="margin-top: var(--space-sm);">
					<pre class="type-data code-pre"><code>&lt;html data-theme="my-client"&gt;
  &lt;!-- Everything inside uses the theme --&gt;
&lt;/html&gt;</code></pre>
				</div>
			</div>
		</div>
		<div class="step">
			<span class="type-data step-number">4</span>
			<div class="step-content">
				<h3 class="type-heading-sm">Import in your project</h3>
				<p class="type-body-sm" style="color: var(--color-text-secondary);">
					Import the base tokens, then your theme file.
				</p>
				<div class="code-block" style="margin-top: var(--space-sm);">
					<pre class="type-data code-pre"><code>@import 'aiaiai-design-system/tokens/semantic.css';
@import 'aiaiai-design-system/tokens/components.css';
@import 'aiaiai-design-system/tokens/themes/my-client.css';</code></pre>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Live demo callout -->
<Callout title="LIVE DEMO">
	<p class="type-body">
		Use the <strong>theme switcher in the sidebar</strong> to toggle between the three themes.
		Every page on this site updates live — foundations, components, and this page itself.
		The theme switcher demonstrates that the token architecture works as designed:
		swap the theme, and every component adapts without any code changes.
	</p>
</Callout>

<style>
	/* ─── Architecture diagram ─── */
	.arch-diagram {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		background: var(--color-surface);
	}

	.arch-layer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--space-md) var(--space-xl);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		background: var(--color-surface-secondary);
		width: 100%;
		max-width: 400px;
		text-align: center;
	}

	.arch-file {
		font-size: var(--type-caption-size);
	}

	.arch-arrow {
		padding: var(--space-xs);
	}

	.arrow-icon {
		width: 20px;
		height: 20px;
		color: var(--color-text-muted);
	}

	/* ─── Tier cards ─── */
	.tier-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
	}

	@media (min-width: 768px) {
		.tier-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.tier-card {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.tier-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.tier-list li {
		padding-left: var(--space-md);
		position: relative;
	}

	.tier-list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: var(--space-sm);
		width: var(--space-xs);
		height: var(--space-xs);
		border-radius: var(--radius-circle);
		background: var(--color-text-muted);
	}

	.token-count {
		display: flex;
		align-items: baseline;
		gap: var(--space-md);
		padding: var(--space-md) 0;
	}

	/* ─── Example block ─── */
	.example-block {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		background: var(--color-surface);
	}

	.code-block {
		background: var(--color-surface-secondary);
		border: var(--elevation-border);
		border-radius: var(--radius-sm);
		padding: var(--space-md);
		overflow-x: auto;
	}

	.code-pre {
		margin: 0;
		font-size: var(--type-label-size);
		line-height: 1.6;
		white-space: pre;
	}

	/* ─── Steps ─── */
	.steps-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.step {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
	}

	.step-number {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: var(--elevation-border-strong);
		border-radius: var(--radius-circle);
		flex-shrink: 0;
		color: var(--color-accent);
		font-size: var(--type-data-size);
	}

	.step-content {
		flex: 1;
	}

	.step-content code {
		font-size: var(--type-label-size);
	}

</style>
