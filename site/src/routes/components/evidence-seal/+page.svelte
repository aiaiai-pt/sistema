<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import SealChip from '$ui/SealChip.svelte';
	import KpiRegister from '$ui/KpiRegister.svelte';
	import CaminhoStateChip from '$ui/CaminhoStateChip.svelte';

	const sealTokens = [
		'--seal-measured-text / --seal-measured-bg',
		'--seal-inferred-text / --seal-inferred-bg',
		'--seal-projected-text / --seal-projected-bg',
		'--seal-stale-text / --seal-stale-bg',
		'--badge-neutral-bg / --badge-neutral-text (probability chip)',
		'--color-surface-secondary + --elevation-border (why panel)',
		'--type-caption-* (why panel text)',
	];
</script>

<svelte:head>
	<title>Evidence Seal — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Evidence Seal"
	description="Provenance as a property of the datum, not as chart styling. Every value that is not a direct reading carries a seal: two orthogonal axes that never merge, a why that is always one click away, and screen-reader text that survives copy, quotation and export."
/>

<!-- The laws -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">The laws</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		These are enforced by the components, not left to the caller. SealChip and KpiRegister are
		boundary elements: they throw rather than render a value whose provenance has gone missing.
	</p>
	<ul class="type-body-sm" style="margin-bottom: var(--space-md); padding-left: var(--space-lg);">
		<li>
			<strong>Two orthogonal axes.</strong> Evidence is
			<code>measured | inferred | projected</code>; probability is
			<code>probable | uncertain</code>. They render as two adjacent chips and never collapse into
			one score or one label. Evidence alone is a valid seal; probability alone is not.
		</li>
		<li><strong>A seal never appears without its evidence chip.</strong></li>
		<li><strong>A projected value never renders without its seal.</strong></li>
		<li>
			<strong>Measured out-ranks projected</strong> — in type size, in position, and in what a
			screen reader reaches first.
		</li>
		<li><strong>A why is always reachable</strong> from the seal, one click away.</li>
		<li>
			<strong>Never label-alone.</strong> The seal is a chip beside its value, never a bare word.
		</li>
		<li>
			<strong>The seal survives re-render, quotation and screen readers.</strong> It is adjacent DOM
			text, so anything that quotes the value quotes the seal with it. A dashed line does none of
			this.
		</li>
	</ul>
</section>

<!-- SealChip: the evidence axis -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">SealChip — the evidence axis</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		The one seal renderer for every value surface: KPI registers, map badges, record lines,
		citations, saved projections, briefs. No surface renders a seal any other way. A screen reader
		hears the value and its seal as one phrase — «+14 cm/h — measured».
	</p>

	<div style="display: flex; gap: var(--space-lg); flex-wrap: wrap; align-items: baseline;">
		<SealChip value="+14 cm/h" evidence="measured" />
		<SealChip value="2,1 m" evidence="inferred" />
		<SealChip value="−18 cm" evidence="projected" />
	</div>
</section>

<!-- Staleness -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Staleness</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		When the validity window closes, the seal goes stale. The word carries the meaning; the muted
		wash is redundant emphasis, so the state survives greyscale and high-contrast alike.
	</p>

	<div style="display: flex; gap: var(--space-lg); flex-wrap: wrap; align-items: baseline;">
		<SealChip value="1,9 MW" evidence="projected" stale />
		<SealChip value="2,1 m" evidence="inferred" stale />
	</div>
</section>

<!-- The second axis -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">The probability axis</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		Orthogonal to evidence, and rendered as its own adjacent chip so the two vocabularies never
		merge into a single phrase. No data source populates this axis today — the slot exists so a
		source can fill it without an API change. Pass it only when you genuinely have one.
	</p>

	<div style="display: flex; gap: var(--space-lg); flex-wrap: wrap; align-items: baseline;">
		<SealChip value="−18 cm" evidence="projected" probability="probable" />
		<SealChip value="2,1 m" evidence="inferred" probability="uncertain" stale />
	</div>
</section>

<!-- The why -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">The why disclosure</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		Pass a <code>why</code> and the seal becomes a real button with
		<code>aria-expanded</code>, opening the provenance one-liner. Click, Enter or Space toggle it;
		Escape closes it and returns focus to the seal; the panel carries a visible close. The button is
		named «why — {'{'}evidence{'}'}» for assistive tech. Disclosure state lives in component state,
		never in a DOM attribute.
	</p>

	<div style="display: flex; gap: var(--space-2xl); flex-wrap: wrap; align-items: baseline;">
		<SealChip
			value="−18 cm"
			evidence="projected"
			why="derived from the 14:00–16:00 tide model run"
		/>
		<SealChip
			value="1,9 MW"
			evidence="projected"
			stale
			why="the 16:00 window has already passed"
		/>
	</div>
</section>

<!-- KpiRegister -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">KpiRegister</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		The two-register composition — measured above, projected beneath — that enforces «measured
		out-ranks projected» in type size, in position, and in reading order. Handing it a
		<code>projectedValue</code> without a <code>projectedSeal</code> throws: an unsealed projection may
		not cross this boundary onto a rendering surface.
	</p>

	<div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
		<KpiRegister label="WATER LEVEL" measuredValue="+14 cm/h" />
		<KpiRegister
			label="WATER LEVEL"
			measuredValue="+14 cm/h"
			projectedValue="−18 cm"
			projectedSeal={{ evidence: 'projected', stale: false }}
			projectedWhy="derived from the 14:00–16:00 tide model run"
		/>
	</div>
</section>

<!-- CaminhoStateChip -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">CaminhoStateChip</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		The four verification states, rendered as words rather than icons or colour alone — a screen
		reader announces the full state, and the meaning survives greyscale.
	</p>

	<div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
		<CaminhoStateChip state="to-verify" />
		<CaminhoStateChip state="verified" />
		<CaminhoStateChip state="not-verified" />
		<CaminhoStateChip state="not-done" />
	</div>
</section>

<!-- Assigning a seal -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Assigning a seal</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		Components never construct a seal. <code>assignSeal</code> from
		<code>@aiaiai-pt/widget-system/core</code> is the only seal source: it reads the value's validity
		window and model provenance against an injected <code>now</code>, so the clock is testable and no
		component reads a wall clock directly.
	</p>

	<pre class="type-body-sm" style="padding: var(--space-md); border: var(--elevation-border); border-radius: var(--radius-md); background: var(--color-surface-secondary); overflow-x: auto;"><code
			>{`import { assignSeal } from '@aiaiai-pt/widget-system/core';
import { SealChip } from '@aiaiai-pt/design-system';

const seal = assignSeal(
  { window_start, window_end, model_derived },
  now,
);

<SealChip value={formatted} {...seal} why={provenanceLine} />`}</code
		></pre>
</section>

<!-- Tokens -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Tokens</h2>
	<TokenRef
		component="SealChip, KpiRegister and CaminhoStateChip"
		file="tokens/components.css"
		tokens={sealTokens}
	/>
</section>
