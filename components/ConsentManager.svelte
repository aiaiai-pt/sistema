<!--
  @component ConsentManager

  The citizen account area's RGPD panel — consent management + the two data
  rights (portability + erasure). Three parts, all vertical-agnostic:

    1. A toggle list of CONSENT PURPOSES (`items`, already mapped to
       `{ id, label, description?, active }`). `active` = "I hold a current
       consent for this purpose". Toggling calls `onToggle(id, next)`; the
       consumer grants (next=true) or revokes (next=false) and re-feeds `items`.
    2. EXPORT MY DATA — a button that triggers `onExport` (the consumer
       downloads the citizen's own data, RGPD portability / Anexo II 121).
    3. DELETE MY ACCOUNT — a DESTRUCTIVE, type-to-confirm flow (Anexo II 122):
       the citizen must type `confirmPhrase` before the irreversible
       `onErase` is reachable. No single-click deletion.

  Accessibility-first: a `<section>` region named by `label` (the visible page
  heading is the consumer's job — same split as NotificationPrefs/RankingBoard,
  so one widget can own the page `<h1>`). The data-rights block is a labelled
  `<h3>` sub-section (the widget heading sits at h2 above it). Toggles are
  `role="switch"` with their own accessible name; the confirm button stays
  `disabled` until the typed phrase matches. Semantic tokens only, so dark /
  high-contrast schemes (#244) ride through. Soft-empty: no purposes → the
  `emptyText` note (the data rights still render).

  @example
  <ConsentManager
    label="Privacy & consent"
    items={[
      { id: "campaign_outreach", label: "Campaign updates", description: "Email about participatory budgeting", active: true },
      { id: "analytics", label: "Usage analytics", active: false },
    ]}
    onToggle={(id, next) => save(id, next)}
    busyId={savingId}
    onExport={() => downloadMyData()}
    confirmPhrase="DELETE"
    onErase={() => eraseAccount()}
  />
-->
<script module>
  /**
   * @typedef {{ id: string, label: string, description?: string, active: boolean }} ConsentItem
   */
</script>

<script>
  import List from "./List.svelte";
  import ListItem from "./ListItem.svelte";
  import Toggle from "./Toggle.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";

  let {
    /** @type {ConsentItem[]} Consent purposes, already mapped to labels. */
    items = [],
    /** @type {string} Accessible name for the consent region (localize it). */
    label = "Consent preferences",
    /** @type {string} Shown when there are no purposes (localize it). */
    emptyText = "There are no consent purposes to manage yet.",
    /** @type {((id: string, active: boolean) => void) | undefined} Toggle a purpose on/off. */
    onToggle = undefined,
    /** @type {string | null} The purpose currently saving — its toggle disables. */
    busyId = null,

    /** @type {string} Heading for the data-rights sub-section (localize it). */
    dataRightsLabel = "Your data",
    /** @type {string} Label for the export button (localize it). */
    exportLabel = "Export my data",
    /** @type {string} Helper line under the export button (localize it). */
    exportHelp = "Download a copy of your personal data.",
    /** @type {(() => void) | undefined} Called when the citizen exports their data. */
    onExport = undefined,
    /** @type {boolean} The export is in flight. */
    exporting = false,

    /** @type {string} Label for the destructive trigger button (localize it). */
    eraseLabel = "Delete my account",
    /** @type {string} The irreversibility warning shown when confirming (localize it). */
    erasePrompt = "This permanently deletes your account and personal data and cannot be undone.",
    /** @type {string} The exact phrase the citizen must type to confirm. */
    confirmPhrase = "DELETE",
    /** @type {string} Label for the type-to-confirm input (localize it). */
    confirmInputLabel = "Type the word below to confirm",
    /** @type {string} Label for the final destructive button (localize it). */
    confirmButtonLabel = "Delete my account permanently",
    /** @type {string} Label for the cancel button (localize it). */
    cancelLabel = "Cancel",
    /** @type {(() => void) | undefined} Called once the typed phrase matches. */
    onErase = undefined,
    /** @type {boolean} The erasure request is in flight. */
    erasing = false,

    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();

  // Local confirm state — the destructive flow stays closed until the citizen
  // opts in, and the irreversible action stays unreachable until they type the
  // exact phrase. The consumer owns the network call (onErase).
  let confirming = $state(false);
  let typed = $state("");
  const canErase = $derived(typed.trim() === confirmPhrase);

  function startConfirm() {
    confirming = true;
    typed = "";
  }
  function cancelConfirm() {
    confirming = false;
    typed = "";
  }
</script>

<section class="consent-manager {className}" aria-label={label} {...rest}>
  {#if items.length > 0}
    <List variant="bordered">
      {#each items as item (item.id)}
        <ListItem>
          {#snippet leading()}
            <span class="consent-manager-label">{item.label}</span>
            {#if item.description}
              <span class="consent-manager-desc">{item.description}</span>
            {/if}
          {/snippet}
          {#snippet trailing()}
            <Toggle
              checked={item.active}
              disabled={busyId === item.id}
              aria-label={item.label}
              onchange={(next) => onToggle?.(item.id, next)}
            />
          {/snippet}
        </ListItem>
      {/each}
    </List>
  {:else}
    <p class="consent-manager-empty">{emptyText}</p>
  {/if}

  <div class="consent-manager-rights">
    <h3 class="consent-manager-rights-heading">{dataRightsLabel}</h3>

    <div class="consent-manager-action">
      <Button variant="secondary" loading={exporting} onclick={() => onExport?.()}>
        {exportLabel}
      </Button>
      <p class="consent-manager-help">{exportHelp}</p>
    </div>

    <div class="consent-manager-danger">
      {#if !confirming}
        <Button variant="destructive" onclick={startConfirm}>{eraseLabel}</Button>
      {:else}
        <p class="consent-manager-warning" role="alert">{erasePrompt}</p>
        <Input
          label={confirmInputLabel}
          placeholder={confirmPhrase}
          bind:value={typed}
          autocomplete="off"
        />
        <p class="consent-manager-help">{confirmPhrase}</p>
        <div class="consent-manager-confirm-row">
          <Button
            variant="destructive"
            disabled={!canErase || erasing}
            loading={erasing}
            onclick={() => onErase?.()}
          >
            {confirmButtonLabel}
          </Button>
          <Button variant="ghost" disabled={erasing} onclick={cancelConfirm}>
            {cancelLabel}
          </Button>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .consent-manager {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .consent-manager-label {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text);
  }

  .consent-manager-desc {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
  }

  .consent-manager-empty {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text-muted);
    margin: 0;
  }

  .consent-manager-rights {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
  }

  .consent-manager-rights-heading {
    font-family: var(--type-heading-sm-font);
    font-size: var(--type-heading-sm-size);
    color: var(--color-text);
    margin: 0;
  }

  .consent-manager-action,
  .consent-manager-danger {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    align-items: flex-start;
  }

  .consent-manager-help {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
    margin: 0;
  }

  .consent-manager-warning {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-destructive);
    margin: 0;
  }

  .consent-manager-confirm-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
</style>
