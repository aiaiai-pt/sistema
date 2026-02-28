<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import DemoGrid from '$lib/components/DemoGrid.svelte';
	import StateCard from '$lib/components/StateCard.svelte';
	import Input from '$ui/Input.svelte';
	import Select from '$ui/Select.svelte';
	import Toggle from '$ui/Toggle.svelte';
	import Checkbox from '$ui/Checkbox.svelte';
	import Label from '$ui/Label.svelte';
	import Textarea from '$ui/Textarea.svelte';
	import FileUpload from '$ui/FileUpload.svelte';
	import FileUploadItem from '$ui/FileUploadItem.svelte';

	let toggleOn = $state(false);
	let checked = $state(false);
	let selectValue = $state('');

	const countries = [
		{ value: 'pt', label: 'Portugal' },
		{ value: 'br', label: 'Brazil' },
		{ value: 'us', label: 'United States' },
		{ value: 'uk', label: 'United Kingdom' },
	];

	const inputTokens = [
		'--input-font: var(--type-data-font) (Berkeley Mono)',
		'--input-radius: var(--radius-sm) (2px)',
		'--input-border: var(--elevation-border)',
		'--input-label-font: var(--type-label-font)',
		'--toggle-bg-on: var(--color-accent)',
		'--checkbox-bg-checked: var(--color-accent)',
		'--textarea-min-height: 80px',
		'--textarea-padding: var(--space-sm)',
		'--fileupload-border: dashed var(--color-border)',
		'--fileupload-border-dragging: solid var(--color-accent)',
		'--fileupload-bg-dragging: var(--color-accent-subtle)',
		'--fileupload-item-border: var(--elevation-border)',
		'--fileupload-item-error-color: var(--color-destructive)',
		'--fileupload-item-complete-color: var(--color-success)'
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
			<Input label="EMAIL" placeholder="you@example.com" />
		</StateCard>

		<StateCard label="FILLED">
			<Input label="EMAIL" value="hello@aiaiai.pt" />
		</StateCard>

		<StateCard label="WITH HELP TEXT">
			<Input label="USERNAME" placeholder="Enter username" help="Must be 3-20 characters, letters and numbers only." />
		</StateCard>

		<StateCard label="FOCUSED">
			<Input label="NAME" placeholder="Click to focus" />
			<span class="type-caption">Click the input to see focus state</span>
		</StateCard>

		<StateCard label="ERROR">
			<Input label="EMAIL" value="not-an-email" error="Please enter a valid email address." />
		</StateCard>

		<StateCard label="DISABLED">
			<Input label="EMAIL" value="disabled@example.com" disabled />
		</StateCard>

		<StateCard label="READ-ONLY">
			<Input label="API KEY" value="sk-xxxxx-readonly" readonly />
		</StateCard>

		<StateCard label="WITH ICON">
			<Input label="SEARCH" placeholder="Search projects...">
				{#snippet leadingIcon()}
					<svg viewBox="0 0 16 16" fill="none">
						<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>
						<path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
				{/snippet}
			</Input>
		</StateCard>
	</DemoGrid>
</section>

<!-- Select -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Select</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="DEFAULT">
			<Select label="COUNTRY" placeholder="Select a country" options={countries} bind:value={selectValue} />
		</StateCard>

		<StateCard label="DISABLED">
			<Select label="COUNTRY" options={[{ value: 'pt', label: 'Portugal' }]} value="pt" disabled />
		</StateCard>

		<StateCard label="ERROR">
			<Select label="COUNTRY" placeholder="Required" options={[]} error="Please select a country." />
		</StateCard>

		<StateCard label="WITH VALUE">
			<Select label="COUNTRY" options={countries} value="pt" />
		</StateCard>
	</DemoGrid>
</section>

<!-- Toggle -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Toggle</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="INTERACTIVE">
			<Toggle bind:checked={toggleOn} label={toggleOn ? 'On' : 'Off'} />
		</StateCard>

		<StateCard label="OFF">
			<Toggle label="Notifications" />
		</StateCard>

		<StateCard label="ON">
			<Toggle checked label="Dark mode" />
		</StateCard>

		<StateCard label="DISABLED OFF">
			<Toggle label="Disabled" disabled />
		</StateCard>

		<StateCard label="DISABLED ON">
			<Toggle checked disabled label="Disabled" />
		</StateCard>
	</DemoGrid>
</section>

<!-- Checkbox -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Checkbox</h2>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="INTERACTIVE">
			<Checkbox label="Accept terms and conditions" bind:checked />
		</StateCard>

		<StateCard label="UNCHECKED">
			<Checkbox label="Remember me" />
		</StateCard>

		<StateCard label="CHECKED">
			<Checkbox label="Email notifications" checked />
		</StateCard>

		<StateCard label="DISABLED">
			<Checkbox label="Disabled option" disabled />
		</StateCard>

		<StateCard label="DISABLED CHECKED">
			<Checkbox label="Disabled checked" checked disabled />
		</StateCard>

		<StateCard label="INDETERMINATE">
			<Checkbox label="Select all" indeterminate />
		</StateCard>
	</DemoGrid>
</section>

<!-- Label -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Label</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Standalone form label for complex layouts where the label is not built into a form component. Uses mono label font.</p>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="DEFAULT">
			<Label>EMAIL ADDRESS</Label>
		</StateCard>

		<StateCard label="WITH FOR">
			<Label for="demo-input">LINKED LABEL</Label>
			<span class="type-caption">Click label to focus linked input</span>
		</StateCard>

		<StateCard label="DISABLED">
			<Label disabled>LOCKED FIELD</Label>
		</StateCard>
	</DemoGrid>
</section>

<!-- Textarea -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Textarea</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Multi-line text input. Values displayed in Berkeley Mono (data font). Resizable vertically.</p>
	<DemoGrid columns="repeat(auto-fill, minmax(240px, 1fr))">
		<StateCard label="PLACEHOLDER">
			<Textarea label="DESCRIPTION" placeholder="Enter a detailed description..." rows={3} />
		</StateCard>

		<StateCard label="FILLED">
			<Textarea label="SQL QUERY" value={"SELECT id, name, email\nFROM users\nWHERE active = true\nORDER BY created_at DESC;"} rows={4} />
		</StateCard>

		<StateCard label="WITH HELP TEXT">
			<Textarea label="NOTES" placeholder="Add notes..." help="Markdown formatting is supported." rows={3} />
		</StateCard>

		<StateCard label="ERROR">
			<Textarea label="SQL QUERY" value="SELCT * FROM" error="Syntax error near SELCT on line 1." rows={2} />
		</StateCard>

		<StateCard label="DISABLED">
			<Textarea label="TEMPLATE" value="This template cannot be modified." disabled rows={2} />
		</StateCard>

		<StateCard label="READ-ONLY">
			<Textarea label="AUDIT LOG" value={"2026-02-28 12:00:00 — Pipeline started\n2026-02-28 12:01:23 — Step 1 complete"} readonly rows={3} />
		</StateCard>
	</DemoGrid>
</section>

<!-- File Upload -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">File Upload</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Drag-and-drop zone for file selection. Validates accept types and max size, then emits valid files via callback. Does not handle uploads — parent owns that logic.</p>
	<DemoGrid columns="repeat(auto-fill, minmax(280px, 1fr))">
		<StateCard label="DEFAULT">
			<FileUpload
				accept=".pdf,.docx,.txt,.csv"
				maxSize={52_428_800}
				onfiles={(files: File[]) => console.log('Files:', files)}
			>
				{#snippet icon()}
					<svg viewBox="0 0 32 32" fill="none">
						<path d="M16 20V6M16 6l-5 5M16 6l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M6 22v4a2 2 0 002 2h16a2 2 0 002-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/snippet}
			</FileUpload>
		</StateCard>

		<StateCard label="NO CONSTRAINTS">
			<FileUpload onfiles={(files: File[]) => console.log('Files:', files)}>
				{#snippet icon()}
					<svg viewBox="0 0 32 32" fill="none">
						<path d="M16 20V6M16 6l-5 5M16 6l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M6 22v4a2 2 0 002 2h16a2 2 0 002-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/snippet}
			</FileUpload>
		</StateCard>

		<StateCard label="DISABLED">
			<FileUpload accept=".pdf" disabled>
				{#snippet icon()}
					<svg viewBox="0 0 32 32" fill="none">
						<path d="M16 20V6M16 6l-5 5M16 6l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M6 22v4a2 2 0 002 2h16a2 2 0 002-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/snippet}
			</FileUpload>
		</StateCard>

		<StateCard label="CUSTOM CONTENT">
			<FileUpload onfiles={(files: File[]) => console.log('Files:', files)}>
				{#snippet children()}
					<div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);">
						<span class="type-label">DRAG YOUR SPEC FILE</span>
						<span class="type-caption" style="color: var(--color-text-muted);">Only .yaml and .json accepted</span>
					</div>
				{/snippet}
			</FileUpload>
		</StateCard>
	</DemoGrid>
</section>

<!-- File Upload Item -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">File Upload Item</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Per-file progress row. Parent controls all state — this is a pure display component. Use in a list below a FileUpload zone.</p>
	<div class="fileupload-item-demos">
		<FileUploadItem
			name="quarterly-report.pdf"
			size={2_400_000}
			status="pending"
			onremove={() => {}}
		/>
		<FileUploadItem
			name="customer-data-export-2026.csv"
			size={8_500_000}
			status="uploading"
			progress={65}
			onremove={() => {}}
		/>
		<FileUploadItem
			name="meeting-notes.txt"
			size={1_200}
			status="complete"
		/>
		<FileUploadItem
			name="oversized-backup.zip"
			status="error"
			error="File exceeds 50 MB limit"
			onremove={() => {}}
		/>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Inputs" file="components.css" tokens={inputTokens} />

<style>
	.fileupload-item-demos {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		max-width: 480px;
	}
</style>
