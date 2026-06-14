<!--
  @component NotificationPrefs

  The citizen account area's notification-preferences panel — a toggle list over
  a citizen's subscriptions. Vertical-agnostic: `items` is already shaped to
  `{ id, label, description?, active }`; the consumer (a portal widget over the
  account subscription lane) maps the backend rows and owns the persistence.
  Toggling a row calls `onToggle(id, next)` — the consumer performs the write
  and re-feeds `items` (or sets `busyId` while it's in flight).

  Accessibility-first: a bordered semantic list inside a `<section>` region
  named by `label` (the visible page heading is the consumer's job — same split
  as RankingBoard, so one widget can own the page `<h1>`). Each row pairs a real
  text label (and optional description) with a `Toggle` (`role="switch"`,
  `aria-checked`); the switch carries its own accessible name via `aria-label`.
  A row that's saving is `disabled` (no double-submit). Consumes semantic tokens
  so dark / high-contrast schemes (#244) ride through. Soft-empty: no items →
  renders the `emptyText` note (never an empty shell).

  @example
  <NotificationPrefs
    label="Notifications"
    items={[
      { id: "all", label: "All updates", description: "Every proposal and phase change", active: true },
      { id: "sub-2", label: "Cycling lane", active: false },
    ]}
    onToggle={(id, next) => save(id, next)}
    busyId={savingId}
  />
-->
<script module>
  /**
   * @typedef {{ id: string, label: string, description?: string, active: boolean }} PrefItem
   */
</script>

<script>
  import List from "./List.svelte";
  import ListItem from "./ListItem.svelte";
  import Toggle from "./Toggle.svelte";

  let {
    /** @type {PrefItem[]} The subscription rows, already mapped to labels. */
    items = [],
    /** @type {string} Accessible name for the preferences region (localize it). */
    label = "Notification preferences",
    /** @type {string} Shown when there are no items (localize it). */
    emptyText = "You have no notification preferences yet.",
    /** @type {((id: string, active: boolean) => void) | undefined} Called on toggle. */
    onToggle = undefined,
    /** @type {string | null} The row currently saving — its toggle disables. */
    busyId = null,
    /** @type {string} */
    class: className = "",
    ...rest
  } = $props();
</script>

<section class="notification-prefs {className}" aria-label={label} {...rest}>
  {#if items.length > 0}
    <List variant="bordered">
      {#each items as item (item.id)}
        <ListItem>
          {#snippet leading()}
            <span class="notification-prefs-label">{item.label}</span>
            {#if item.description}
              <span class="notification-prefs-desc">{item.description}</span>
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
    <p class="notification-prefs-empty">{emptyText}</p>
  {/if}
</section>

<style>
  .notification-prefs {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .notification-prefs-label {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text);
  }

  .notification-prefs-desc {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
  }

  .notification-prefs-empty {
    font-family: var(--type-body-font);
    font-size: var(--type-body-size);
    color: var(--color-text-muted);
    margin: 0;
  }
</style>
