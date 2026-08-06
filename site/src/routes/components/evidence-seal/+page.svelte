<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import SealChip from '$ui/SealChip.svelte';
	import KpiRegister from '$ui/KpiRegister.svelte';
	import CaminhoStateChip from '$ui/CaminhoStateChip.svelte';

	const sealTokens = [
		'--seal-positive-text / --seal-positive-bg',
		'--seal-info-text / --seal-info-bg',
		'--seal-caution-text / --seal-caution-bg',
		'--seal-stale-text / --seal-stale-bg',
		'--badge-neutral-bg / --badge-neutral-text (neutral tone)',
		'--color-surface-secondary + --elevation-border (why panel)',
		'--type-caption-* (why panel text)'
	];

	// Terms are DECLARED DATA. These are three of the enumerations the corpus
	// carries; none is canonical. The component renders all of them unchanged.
	const brief = {
		reading: { value: 'measured', label: 'measured', tone: 'positive' },
		model: { value: 'inferred', label: 'inferred', tone: 'info' },
		forecast: { value: 'projected', label: 'projected', tone: 'caution' }
	} as const;

	const cycle4 = {
		reading: { value: 'confirmed', label: 'confirmado', tone: 'positive' },
		model: { value: 'inferred', label: 'inferido', tone: 'info' },
		forecast: { value: 'modelled', label: 'modelado', tone: 'caution' },
		nearCertain: { value: 'near_certain', label: 'quase certo' },
		uncertain: { value: 'uncertain', label: 'incerto' }
	} as const;

	const cycle6 = {
		reading: { value: 'measured', label: 'medido', tone: 'positive' },
		model: { value: 'inferred', label: 'inferido', tone: 'info' },
		uncertain: { value: 'uncertain', label: 'incerto' }
	} as const;
</script>

<svelte:head>
	<title>Evidence Seal — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Evidence Seal"
	description="Provenance as a property of the datum, not as chart styling. Every value that is not a direct current reading carries a seal: two orthogonal axes that never merge, a why one tap away, and screen-reader text that survives copy, quotation and export."
/>

<!-- The one thing to know first -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">
		The design system owns the laws, not the words
	</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		These components enumerate no seal vocabulary. Terms arrive as declared data —
		<code>{'{ value, label, tone }'}</code> resolved from ontology vocabulary rows at read time,
		the same enum-choice mechanism every other declared vocabulary in the estate uses. Widening an
		axis, re-wording a term, or switching a three-term evidence axis for a two-term one is a
		declaration change: zero component code, no package release.
	</p>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		<code>value</code> is the English code and stays on the datum; <code>label</code> is the
		localized text a reader and a screen reader receive; <code>tone</code> selects from the design
		system's own presentation scale — <code>positive · info · caution · neutral</code> — which is
		the part the design system legitimately owns.
	</p>
</section>

<!-- The laws -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">The laws</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		Enforced by the components, not left to the caller. SealChip and KpiRegister are boundary
		elements: they throw rather than render a value whose provenance has gone missing. Every law
		below holds whatever vocabulary you declare.
	</p>
	<ul class="type-body-sm" style="margin-bottom: var(--space-md); padding-left: var(--space-lg);">
		<li>
			<strong>Two orthogonal axes</strong> — evidence and probability render as two adjacent chips
			and never collapse into one phrase, one score, or one label.
		</li>
		<li><strong>Never label-alone</strong> — a seal never appears without its evidence chip.</li>
		<li>
			<strong>Evidence alone is valid; probability alone is not.</strong> A probability with no
			evidence throws.
		</li>
		<li>
			<strong>A value that needs a seal never renders without one</strong> — its window is later
			than now, or its provenance includes a model.
		</li>
		<li>
			<strong>The more authoritative value out-ranks</strong> — in type size, in position, and in
			screen-reader reading order. Enforced by evidence class, not by word.
		</li>
		<li><strong>A why is always reachable</strong> from the seal, one tap away, by keyboard.</li>
		<li>
			<strong>The seal rides the datum</strong> — adjacent DOM text, so it survives re-render, copy,
			quotation, export and screen readers. A dashed line does none of that.
		</li>
	</ul>
</section>

<!-- One component, three enumerations -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">
		One component, three different vocabularies
	</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		The same <code>SealChip</code>, rendering three of the enumerations the corpus carries. Nothing
		but the data differs between these rows — which is the whole point: reconciling them is an open
		decision, and no component should quietly pre-empt it.
	</p>

	<div style="display: flex; flex-direction: column; gap: var(--space-md);">
		<div style="display: flex; gap: var(--space-lg); flex-wrap: wrap; align-items: baseline;">
			<SealChip value="+14 cm/h" evidence={brief.reading} />
			<SealChip value="2,1 m" evidence={brief.model} />
			<SealChip value="−18 cm" evidence={brief.forecast} />
		</div>
		<div style="display: flex; gap: var(--space-lg); flex-wrap: wrap; align-items: baseline;">
			<SealChip value="+14 cm/h" evidence={cycle4.reading} />
			<SealChip value="2,1 m" evidence={cycle4.model} probability={cycle4.uncertain} />
			<SealChip value="−18 cm" evidence={cycle4.forecast} probability={cycle4.nearCertain} />
		</div>
		<div style="display: flex; gap: var(--space-lg); flex-wrap: wrap; align-items: baseline;">
			<SealChip value="+14 cm/h" evidence={cycle6.reading} />
			<SealChip value="2,1 m" evidence={cycle6.model} probability={cycle6.uncertain} />
		</div>
	</div>
</section>

<!-- Staleness -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Staleness</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		When the validity window closes, the seal goes stale. Staleness is a separate orthogonal state,
		never a member of either vocabulary — it mutes whatever tone the term carries and leaves the
		term itself untouched. The word carries the meaning; the wash is redundant emphasis, so it
		survives greyscale and high contrast.
	</p>

	<div style="display: flex; gap: var(--space-lg); flex-wrap: wrap; align-items: baseline;">
		<SealChip value="1,9 MW" evidence={brief.forecast} stale />
		<SealChip value="2,1 m" evidence={cycle6.model} stale staleLabel="obsoleto" />
	</div>
</section>

<!-- The why -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">The why disclosure</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		Pass a <code>why</code> and the seal becomes a real button with <code>aria-expanded</code>,
		opening the provenance one-liner. Click, Enter or Space toggle it; Escape closes it and returns
		focus to the seal; the panel carries a visible close. The trigger's accessible name comes from
		the caller's <code>whyLabel</code> pattern, since this package owns no product copy. Disclosure
		state lives in component state, never in a DOM attribute.
	</p>

	<div style="display: flex; gap: var(--space-2xl); flex-wrap: wrap; align-items: baseline;">
		<SealChip
			value="−18 cm"
			evidence={brief.forecast}
			why="derived from the 14:00–16:00 tide model run"
		/>
		<SealChip
			value="1,9 MW"
			evidence={cycle4.forecast}
			whyLabel={'porquê — {term}'}
			closeLabel="Fechar"
			staleLabel="obsoleto"
			stale
			why="a janela das 16:00 já passou"
		/>
	</div>
</section>

<!-- KpiRegister -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">KpiRegister</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		The two-register composition: the more authoritative value above, the less authoritative
		beneath. This is where "the reading out-ranks the forecast" becomes concrete in all three
		senses — size, position, and reading order. The ranking is enforced by evidence class, so it
		holds under any vocabulary; seating a more authoritative value in the lower register throws, as
		does handing over a secondary value with no seal.
	</p>

	<div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
		<KpiRegister label="WATER LEVEL" primaryValue="+14 cm/h" />
		<KpiRegister
			label="WATER LEVEL"
			primaryValue="+14 cm/h"
			primarySeal={{ evidence: brief.reading, evidenceClass: 'direct_reading', stale: false }}
			secondaryValue="−18 cm"
			secondarySeal={{ evidence: brief.forecast, evidenceClass: 'future_window', stale: false }}
			secondaryWhy="derived from the 14:00–16:00 tide model run"
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

<!-- The mechanism, end to end -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">
		Assigning a seal, end to end
	</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		Components never construct a seal, and the model never assigns its own. Assignment is
		deterministic product code reading the datum's own provenance against an injected
		<code>now</code>, so the clock is testable and nothing reads a wall clock directly.
		<code>assignSeal</code> returns no words at all — only what the provenance makes the datum.
		<code>resolveSeal</code> then applies the declared vocabulary.
	</p>

	<pre
		class="type-body-sm"
		style="padding: var(--space-md); border: var(--elevation-border); border-radius: var(--radius-md); background: var(--color-surface-secondary); overflow-x: auto;"><code
			>{`import { assignSeal, resolveSeal } from '@aiaiai-pt/widget-system/core';
import { SealChip } from '@aiaiai-pt/design-system';

// 1. Structural, wordless: what the datum's provenance makes it.
const assignment = assignSeal(
  { window_start, window_end, model_derived },
  now,
);
// → { evidenceClass: 'future_window', stale: false, sealRequired: true }

// 2. The declared vocabulary, resolved at read time from the ontology.
const vocabulary = await loadSealVocabulary(tenant, locale);

// 3. Words applied.
const seal = resolveSeal(assignment, vocabulary, datum.probability_code);

<SealChip value={formatted} {...seal} why={provenanceLine} />`}</code
		></pre>
</section>

<!-- Changing the vocabulary -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">
		Changing the vocabulary without a release
	</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		The terms are rows of a declared vocabulary entity on the ontology sheet — the platform's
		established pattern for a vocabulary that carries metadata, the same shape
		<code>occurrence_state</code> uses to carry a code, a display name, a grouping and a colour. To
		re-word a term, widen an axis, or collapse a three-term axis into two, edit the rows and
		re-provision. No component changes, no package publishes, no host deploy.
	</p>

	<pre
		class="type-body-sm"
		style="padding: var(--space-md); border: var(--elevation-border); border-radius: var(--radius-md); background: var(--color-surface-secondary); overflow-x: auto;"><code
			>{`# The vocabulary is an entity type, not an enum on a field.
- entity_type: seal_term
  schema:
    display_name: Termo de Selo
    tenant_scoped: true
    fields:
    - { field_key: code,           field_type: { type: string }, required: true }
    - { field_key: label,          field_type: { type: string }, required: true }
    - { field_key: axis,           field_type: { type: string }, required: true }
    - { field_key: evidence_class, field_type: { type: string }, required: false }
    - { field_key: tone,           field_type: { type: string }, required: false }
    - { field_key: order,          field_type: { type: integer }, required: false }`}</code
		></pre>

	<p class="type-body-sm" style="margin: var(--space-md) 0;">
		The rows are the vocabulary. These are cycle-6's narrower pair; swapping in cycle-4's
		three-term axis and four-term ladder is a change to these rows and nothing else:
	</p>

	<pre
		class="type-body-sm"
		style="padding: var(--space-md); border: var(--elevation-border); border-radius: var(--radius-md); background: var(--color-surface-secondary); overflow-x: auto;"><code
			>{`code          label       axis          evidence_class    tone
────────────  ──────────  ────────────  ────────────────  ────────
measured      medido      evidence      direct_reading    positive
inferred      inferido    evidence      model_derived     info
inferred      inferido    evidence      future_window     info      ← two classes, one term
probable      provável    probability   —                 neutral
uncertain     incerto     probability   —                 neutral`}</code
		></pre>

	<p class="type-body-sm" style="margin-top: var(--space-md);">
		Because <code>evidence_class</code> is a column rather than something inferred from the word, a
		deployment that wants a two-term evidence axis just points <code>future_window</code> and
		<code>model_derived</code> at the same term — the row above. The «previsto» wording question
		stays where the operator can settle it, in the data, instead of frozen into anyone's component.
	</p>
</section>

<!-- Tokens -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Tokens</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">
		The tokens are named for tones, never for seal words — which word wears which tone is declared
		beside the word.
	</p>
	<TokenRef
		component="SealChip, KpiRegister and CaminhoStateChip"
		file="tokens/components.css"
		tokens={sealTokens}
	/>
</section>
