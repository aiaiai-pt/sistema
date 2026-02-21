<svelte:head>
	<title>Getting Started — aiaiai Design System</title>
</svelte:head>

<h1 class="type-display" style="margin-bottom: var(--space-sm);">Getting Started</h1>
<p class="type-body" style="color: var(--color-text-secondary); max-width: var(--content-width-narrow); margin-bottom: var(--space-2xl);">
	Three steps to integrate the aiaiai design system into your project.
	Tokens in, consistent UI out.
</p>

<!-- ─── Section 1: Install ─── -->
<section class="gs-section">
	<h2 class="type-heading" style="margin-bottom: var(--space-sm);">1. Install</h2>
	<p class="type-body-sm" style="color: var(--color-text-secondary); margin-bottom: var(--space-md);">
		Add the package to your project.
	</p>
	<div class="code-block">
		<pre class="type-data code-pre"><code>npm install aiaiai-design-system</code></pre>
	</div>
	<p class="type-caption" style="margin-top: var(--space-sm);">
		Or clone/link the repo directly if you're working within the aiaiai monorepo.
	</p>
</section>

<!-- ─── Section 2: Import ─── -->
<section class="gs-section">
	<h2 class="type-heading" style="margin-bottom: var(--space-sm);">2. Import</h2>
	<p class="type-body-sm" style="color: var(--color-text-secondary); margin-bottom: var(--space-md);">
		Import the semantic tokens and a theme into your main stylesheet.
	</p>
	<div class="code-block">
		<pre class="type-data code-pre"><code>@import 'aiaiai-design-system/tokens/semantic.css';
@import 'aiaiai-design-system/tokens/themes/aiaiai.css';</code></pre>
	</div>

	<p class="type-body-sm" style="color: var(--color-text-secondary); margin-top: var(--space-lg); margin-bottom: var(--space-md);">
		For Tailwind v4 projects, bridge the tokens into utility classes:
	</p>
	<div class="code-block">
		<pre class="type-data code-pre"><code>@theme inline &#123;
  --color-surface: var(--color-surface);
  --color-text: var(--color-text);
  --color-accent: var(--color-accent);
  /* ... */
&#125;</code></pre>
	</div>
	<p class="type-caption" style="margin-top: var(--space-sm);">
		See the full @theme mapping in the <a href="/system/theming" class="link">Theming guide</a>.
	</p>
</section>

<!-- ─── Section 3: Verify ─── -->
<section class="gs-section">
	<h2 class="type-heading" style="margin-bottom: var(--space-sm);">3. Verify</h2>
	<p class="type-body-sm" style="color: var(--color-text-secondary); margin-bottom: var(--space-md);">
		If your page has a warm paper background (<code class="inline-code">#f7f5f3</code>),
		warm brown text (<code class="inline-code">#2c2825</code>),
		and orange accent (<code class="inline-code">#ff6b35</code>), the system is working.
	</p>

	<div class="verify-card">
		<span class="type-label" style="margin-bottom: var(--space-xs); display: block;">VERIFICATION</span>
		<p class="type-body" style="margin-bottom: var(--space-md);">
			This card uses system tokens. The background is <code class="inline-code">--color-surface</code>,
			the text is <code class="inline-code">--color-text</code>,
			and the button below is <code class="inline-code">--color-accent</code>.
		</p>
		<button class="verify-button type-label">
			LOOKS GOOD
		</button>
	</div>
</section>

<!-- ─── Section 4: Next Steps ─── -->
<section class="gs-section" style="margin-bottom: 0;">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Next Steps</h2>
	<div class="next-grid">
		<a href="/foundations/color" class="next-link">
			<span class="type-label next-link-label">FOUNDATIONS</span>
			<span class="type-body-sm">Color</span>
		</a>
		<a href="/foundations/typography" class="next-link">
			<span class="type-label next-link-label">FOUNDATIONS</span>
			<span class="type-body-sm">Typography</span>
		</a>
		<a href="/system/theming" class="next-link">
			<span class="type-label next-link-label">SYSTEM</span>
			<span class="type-body-sm">Theming</span>
		</a>
		<a href="/components/button" class="next-link">
			<span class="type-label next-link-label">COMPONENTS</span>
			<span class="type-body-sm">Button</span>
		</a>
	</div>
</section>

<style>
	/* ─── Sections ─── */
	.gs-section {
		margin-bottom: var(--space-2xl);
	}

	/* ─── Code blocks ─── */
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

	.inline-code {
		font-family: var(--font-mono);
		font-size: var(--type-caption-size);
		background: var(--color-surface-secondary);
		padding: 1px var(--space-xs);
		border-radius: var(--radius-sm);
		border: var(--elevation-border);
	}

	/* ─── Verification card ─── */
	.verify-card {
		background: var(--color-surface);
		border: var(--elevation-border-strong);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
	}

	.verify-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: var(--button-md-height);
		padding: 0 var(--button-md-padding-x);
		background: var(--button-primary-bg);
		color: var(--button-primary-text);
		border: var(--button-primary-border);
		border-radius: var(--button-radius);
		font-family: var(--button-font);
		font-size: var(--button-md-font-size);
		letter-spacing: var(--button-tracking);
		cursor: pointer;
		transition: background var(--button-transition);
	}

	.verify-button:hover {
		background: var(--button-primary-bg-hover);
	}

	/* ─── Next steps grid ─── */
	.next-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: var(--space-md);
	}

	.next-link {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding: var(--space-md);
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: border-color var(--duration-instant) var(--easing-default);
	}

	.next-link:hover {
		border-color: var(--color-border-strong);
	}

	.next-link-label {
		color: var(--color-text-muted);
	}

	/* ─── Inline link ─── */
	.link {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: var(--space-2xs);
	}

	.link:hover {
		color: var(--color-accent-hover);
	}
</style>
