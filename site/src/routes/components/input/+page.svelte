<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';

	let toggleOn = $state(false);
	let checked = $state(false);
	let selectValue = $state('');
	let indeterminateEl: HTMLInputElement;

	$effect(() => {
		if (indeterminateEl) {
			indeterminateEl.indeterminate = true;
		}
	});

	const inputTokens = [
		'--input-font: var(--type-data-font) (Berkeley Mono)',
		'--input-radius: var(--radius-sm) (2px)',
		'--input-border: var(--elevation-border)',
		'--input-label-font: var(--type-label-font)',
		'--toggle-bg-on: var(--color-accent)',
		'--checkbox-bg-checked: var(--color-accent)'
	];
</script>

<svelte:head>
	<title>Input — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Input"
	description="Text input, select, toggle, and checkbox. Berkeley Mono for input values (data font). Labels always in mono. All states demonstrated live."
/>

<!-- Text Input -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Text Input</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="PLACEHOLDER">
			<div class="input-group">
				<label class="input-label" for="input-email-placeholder">EMAIL</label>
				<input id="input-email-placeholder" type="text" class="input" placeholder="you@example.com" />
			</div>
		</StateCard>

		<StateCard label="FILLED">
			<div class="input-group">
				<label class="input-label" for="input-email-filled">EMAIL</label>
				<input id="input-email-filled" type="text" class="input" value="hello@aiaiai.pt" />
			</div>
		</StateCard>

		<StateCard label="WITH HELP TEXT">
			<div class="input-group">
				<label class="input-label" for="input-username-help">USERNAME</label>
				<input id="input-username-help" type="text" class="input" placeholder="Enter username" />
				<span class="input-help">Must be 3-20 characters, letters and numbers only.</span>
			</div>
		</StateCard>

		<StateCard label="FOCUSED">
			<div class="input-group">
				<label class="input-label" for="input-name-focus">NAME</label>
				<input id="input-name-focus" type="text" class="input" placeholder="Click to focus" />
			</div>
			<span class="type-caption">Click the input to see focus state</span>
		</StateCard>

		<StateCard label="ERROR">
			<div class="input-group">
				<label class="input-label" for="input-email-error">EMAIL</label>
				<input id="input-email-error" type="text" class="input input-error" value="not-an-email" />
				<span class="input-error-text">Please enter a valid email address.</span>
			</div>
		</StateCard>

		<StateCard label="DISABLED">
			<div class="input-group">
				<label class="input-label" for="input-email-disabled">EMAIL</label>
				<input id="input-email-disabled" type="text" class="input" value="disabled@example.com" disabled />
			</div>
		</StateCard>

		<StateCard label="READ-ONLY">
			<div class="input-group">
				<label class="input-label" for="input-apikey-readonly">API KEY</label>
				<input id="input-apikey-readonly" type="text" class="input input-readonly" value="sk-xxxxx-readonly" readonly />
			</div>
		</StateCard>

		<StateCard label="WITH ICON">
			<div class="input-group">
				<label class="input-label" for="input-search-icon">SEARCH</label>
				<div class="input-icon-wrapper">
					<svg class="input-leading-icon" viewBox="0 0 16 16" fill="none">
						<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>
						<path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
					<input id="input-search-icon" type="text" class="input input-with-icon" placeholder="Search projects..." />
				</div>
			</div>
		</StateCard>
	</DemoGrid>
</section>

<!-- Select -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Select</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="DEFAULT">
			<div class="input-group">
				<label class="input-label" for="select-country-default">COUNTRY</label>
				<select id="select-country-default" class="input select" bind:value={selectValue}>
					<option value="" disabled selected>Select a country</option>
					<option value="pt">Portugal</option>
					<option value="br">Brazil</option>
					<option value="us">United States</option>
					<option value="uk">United Kingdom</option>
				</select>
			</div>
		</StateCard>

		<StateCard label="DISABLED">
			<div class="input-group">
				<label class="input-label" for="select-country-disabled">COUNTRY</label>
				<select id="select-country-disabled" class="input select" disabled>
					<option>Portugal</option>
				</select>
			</div>
		</StateCard>

		<StateCard label="ERROR">
			<div class="input-group">
				<label class="input-label" for="select-country-error">COUNTRY</label>
				<select id="select-country-error" class="input select input-error">
					<option value="" disabled selected>Required</option>
				</select>
				<span class="input-error-text">Please select a country.</span>
			</div>
		</StateCard>

		<StateCard label="WITH VALUE">
			<div class="input-group">
				<label class="input-label" for="select-country-value">COUNTRY</label>
				<select id="select-country-value" class="input select" value="pt">
					<option value="" disabled>Select a country</option>
					<option value="pt" selected>Portugal</option>
					<option value="br">Brazil</option>
					<option value="us">United States</option>
					<option value="uk">United Kingdom</option>
				</select>
			</div>
		</StateCard>
	</DemoGrid>
</section>

<!-- Toggle -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Toggle</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="INTERACTIVE">
			<div class="toggle-group">
				<button
					class="toggle"
					class:toggle-on={toggleOn}
					onclick={() => toggleOn = !toggleOn}
					role="switch"
					aria-checked={toggleOn}
					aria-labelledby="toggle-interactive-label"
				>
					<span class="toggle-knob"></span>
				</button>
				<span id="toggle-interactive-label" class="type-body-sm">{toggleOn ? 'On' : 'Off'}</span>
			</div>
		</StateCard>

		<StateCard label="OFF">
			<div class="toggle-group">
				<div class="toggle" aria-labelledby="toggle-off-label">
					<span class="toggle-knob"></span>
				</div>
				<span id="toggle-off-label" class="type-body-sm">Notifications</span>
			</div>
		</StateCard>

		<StateCard label="ON">
			<div class="toggle-group">
				<div class="toggle toggle-on" aria-labelledby="toggle-on-label">
					<span class="toggle-knob"></span>
				</div>
				<span id="toggle-on-label" class="type-body-sm">Dark mode</span>
			</div>
		</StateCard>

		<StateCard label="DISABLED OFF">
			<div class="toggle-group">
				<div class="toggle toggle-disabled" aria-labelledby="toggle-disabled-off-label">
					<span class="toggle-knob"></span>
				</div>
				<span id="toggle-disabled-off-label" class="type-body-sm" style="color: var(--color-text-muted);">Disabled</span>
			</div>
		</StateCard>

		<StateCard label="DISABLED ON">
			<div class="toggle-group">
				<div class="toggle toggle-on toggle-disabled" aria-labelledby="toggle-disabled-on-label">
					<span class="toggle-knob"></span>
				</div>
				<span id="toggle-disabled-on-label" class="type-body-sm" style="color: var(--color-text-muted);">Disabled</span>
			</div>
		</StateCard>
	</DemoGrid>
</section>

<!-- Checkbox -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Checkbox</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="INTERACTIVE">
			<label class="checkbox-group" for="checkbox-accept-terms">
				<span class="checkbox" class:checkbox-checked={checked}>
					{#if checked}
						<svg class="checkbox-icon" viewBox="0 0 12 12" fill="none">
							<path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					{/if}
				</span>
				<input id="checkbox-accept-terms" type="checkbox" class="checkbox-input" bind:checked />
				<span class="type-body-sm">Accept terms and conditions</span>
			</label>
		</StateCard>

		<StateCard label="UNCHECKED">
			<label class="checkbox-group">
				<span class="checkbox"></span>
				<span class="type-body-sm">Remember me</span>
			</label>
		</StateCard>

		<StateCard label="CHECKED">
			<label class="checkbox-group">
				<span class="checkbox checkbox-checked">
					<svg class="checkbox-icon" viewBox="0 0 12 12" fill="none">
						<path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</span>
				<span class="type-body-sm">Email notifications</span>
			</label>
		</StateCard>

		<StateCard label="DISABLED">
			<label class="checkbox-group checkbox-disabled">
				<span class="checkbox"></span>
				<span class="type-body-sm" style="color: var(--color-text-muted);">Disabled option</span>
			</label>
		</StateCard>

		<StateCard label="DISABLED CHECKED">
			<label class="checkbox-group checkbox-disabled">
				<span class="checkbox checkbox-checked">
					<svg class="checkbox-icon" viewBox="0 0 12 12" fill="none">
						<path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</span>
				<span class="type-body-sm" style="color: var(--color-text-muted);">Disabled checked</span>
			</label>
		</StateCard>

		<StateCard label="INDETERMINATE">
			<label class="checkbox-group" for="checkbox-select-all">
				<span class="checkbox checkbox-checked">
					<svg class="checkbox-icon" viewBox="0 0 12 12" fill="none">
						<path d="M3 6h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				</span>
				<input id="checkbox-select-all" type="checkbox" class="checkbox-input" bind:this={indeterminateEl} />
				<span class="type-body-sm">Select all</span>
			</label>
		</StateCard>
	</DemoGrid>
</section>

<!-- Token reference -->
<TokenRef component="Inputs" file="components.css" tokens={inputTokens} />

<style>
	/* ─── Text input ─── */
	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--input-label-gap);
		width: 100%;
	}

	.input-label {
		font-family: var(--input-label-font);
		font-size: var(--input-label-size);
		letter-spacing: var(--input-label-tracking);
		color: var(--input-label-color);
	}

	.input {
		font-family: var(--input-font);
		font-size: var(--input-font-size);
		height: var(--input-md-height);
		padding: 0 var(--input-md-padding-x);
		border: var(--input-border);
		border-radius: var(--input-radius);
		background: var(--input-bg);
		color: var(--input-text);
		transition: border var(--input-transition);
		width: 100%;
	}

	.input::placeholder {
		color: var(--input-placeholder);
	}

	.input:focus {
		outline: none;
		border: var(--input-border-focus);
	}

	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.input-readonly {
		background: var(--color-surface-secondary);
		cursor: default;
	}

	.input-error {
		border-color: var(--input-error-border-color);
	}

	.input-error:focus {
		border-color: var(--input-error-border-color);
	}

	.input-help {
		font-family: var(--input-help-font);
		font-size: var(--input-help-size);
		color: var(--input-help-color);
	}

	.input-error-text {
		font-family: var(--input-help-font);
		font-size: var(--input-help-size);
		color: var(--input-error-text);
	}

	/* ─── Input with icon ─── */
	.input-icon-wrapper {
		position: relative;
		width: 100%;
	}

	.input-leading-icon {
		position: absolute;
		left: var(--input-md-padding-x);
		top: 50%;
		transform: translateY(-50%);
		width: 16px;
		height: 16px;
		color: var(--input-placeholder);
		pointer-events: none;
	}

	.input-with-icon {
		padding-left: calc(var(--input-md-padding-x) + 16px + var(--space-xs));
	}

	/* ─── Select ─── */
	.select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2378716c' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right var(--input-md-padding-x) center;
		padding-right: var(--space-xl);
	}

	/* ─── Toggle ─── */
	.toggle-group {
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

	.toggle-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-knob {
		position: absolute;
		top: var(--space-2xs);
		left: var(--space-2xs);
		width: var(--toggle-knob-size);
		height: var(--toggle-knob-size);
		border-radius: var(--radius-circle);
		background: var(--toggle-knob-color);
		transition: transform var(--duration-fast) var(--easing-default);
	}

	.toggle-on .toggle-knob {
		transform: translateX(calc(var(--toggle-width) - var(--toggle-knob-size) - calc(2 * var(--space-2xs))));
	}

	/* ─── Checkbox ─── */
	.checkbox-group {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		cursor: pointer;
	}

	.checkbox-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.checkbox {
		width: var(--checkbox-size);
		height: var(--checkbox-size);
		border-radius: var(--checkbox-radius);
		border: var(--checkbox-border);
		background: var(--color-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all var(--duration-fast) var(--easing-default);
	}

	.checkbox-checked {
		background: var(--checkbox-bg-checked);
		border-color: var(--checkbox-bg-checked);
	}

	.checkbox-icon {
		width: 12px;
		height: 12px;
		color: var(--checkbox-check-color);
	}

	.checkbox-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
