<!--
  @component LogViewer

  Structured log display for viewing timestamped, level-coded entries.
  Optimized for scanning many entries at compact density.
  Composes Badge, Input, Checkbox, Toggle, Alert, EmptyState, and Skeleton.
  Consumes --log-viewer-* tokens from components.css.

  @example Basic
  <LogViewer entries={logEntries} />

  @example With all states
  <LogViewer
    entries={logEntries}
    available={true}
    truncated={false}
    fallbackUrl="https://temporal.example.com/..."
    loading={false}
  />

  @example Unavailable (show fallback)
  <LogViewer available={false} fallbackUrl="https://temporal.example.com/..." />
-->
<script>
  import Badge from './Badge.svelte';
  import Input from './Input.svelte';
  import Checkbox from './Checkbox.svelte';
  import Toggle from './Toggle.svelte';
  import Alert from './Alert.svelte';
  import EmptyState from './EmptyState.svelte';
  import Skeleton from './Skeleton.svelte';

  /**
   * @typedef {{ timestamp: string, level: string, message: string, context?: Record<string, unknown> }} LogEntry
   */

  let {
    /** @type {LogEntry[]} */
    entries = [],
    /** @type {boolean} */
    available = true,
    /** @type {boolean} */
    truncated = false,
    /** @type {string | undefined} */
    fallbackUrl = undefined,
    /** @type {boolean} */
    loading = false,
    /** @type {string} */
    emptyHeading = 'No log entries',
    /** @type {string} */
    emptyBody = 'Logs will appear here once the run produces output.',
    /** @type {string} */
    unavailableHeading = 'Logs unavailable',
    /** @type {string} */
    unavailableBody = 'The orchestrator is unreachable. View logs in the external UI.',
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    emptyIcon = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    unavailableIcon = undefined,
    ...rest
  } = $props();

  /* ─── Local state ─── */
  let search = $state('');
  let showInfo = $state(true);
  let showWarning = $state(true);
  let showError = $state(true);
  let relativeTime = $state(true);

  /* ─── Level normalization ─── */
  /** @param {string} level */
  function normalizeLevel(level) {
    const upper = level.toUpperCase();
    if (upper === 'WARN' || upper === 'WARNING') return 'WARNING';
    if (upper === 'ERR' || upper === 'ERROR') return 'ERROR';
    return 'INFO';
  }

  /* ─── Derived data ─── */
  const normalizedEntries = $derived(
    entries.map((e) => ({ ...e, _level: normalizeLevel(e.level) }))
  );

  const counts = $derived({
    INFO: normalizedEntries.filter((e) => e._level === 'INFO').length,
    WARNING: normalizedEntries.filter((e) => e._level === 'WARNING').length,
    ERROR: normalizedEntries.filter((e) => e._level === 'ERROR').length,
  });

  const searchLower = $derived(search.toLowerCase());

  const filteredEntries = $derived(
    normalizedEntries.filter((e) => {
      // Level filter
      if (e._level === 'INFO' && !showInfo) return false;
      if (e._level === 'WARNING' && !showWarning) return false;
      if (e._level === 'ERROR' && !showError) return false;
      // Search filter
      if (searchLower && !e.message.toLowerCase().includes(searchLower)) return false;
      return true;
    })
  );

  const hasActiveFilters = $derived(
    !showInfo || !showWarning || !showError || search.length > 0
  );

  /* ─── Level → Badge variant mapping ─── */
  /** @type {Record<string, 'neutral' | 'warning' | 'error'>} */
  const levelVariant = {
    INFO: 'neutral',
    WARNING: 'warning',
    ERROR: 'error',
  };

  /* ─── Timestamp formatting ─── */
  /** @param {string} timestamp */
  function formatTimestamp(timestamp) {
    if (relativeTime) return formatRelative(timestamp);
    return formatAbsolute(timestamp);
  }

  /** @param {string} timestamp */
  function formatAbsolute(timestamp) {
    try {
      const d = new Date(timestamp);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      const ms = String(d.getMilliseconds()).padStart(3, '0');
      return `${h}:${m}:${s}.${ms}`;
    } catch {
      return timestamp;
    }
  }

  /** @param {string} timestamp */
  function formatRelative(timestamp) {
    try {
      const now = Date.now();
      const then = new Date(timestamp).getTime();
      const diff = now - then;
      if (diff < 1000) return 'just now';
      if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
      if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
      if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
      return `${Math.floor(diff / 86_400_000)}d ago`;
    } catch {
      return timestamp;
    }
  }


</script>

<div
  class="log-viewer {className}"
  class:log-viewer--loading={loading}
  {...rest}
>
  {#if loading}
    <!-- Loading state -->
    <div class="log-viewer-loading">
      <Skeleton width="100%" height="32px" />
      <Skeleton width="100%" height="14px" />
      <Skeleton width="90%" height="14px" />
      <Skeleton width="95%" height="14px" />
      <Skeleton width="85%" height="14px" />
      <Skeleton width="92%" height="14px" />
    </div>

  {:else if !available}
    <!-- Unavailable state -->
    <EmptyState
      heading={unavailableHeading}
      body={unavailableBody}
      actionLabel={fallbackUrl ? 'OPEN EXTERNAL LOGS' : undefined}
      actionVariant="secondary"
      onaction={fallbackUrl ? () => window.open(fallbackUrl, '_blank') : undefined}
      icon={unavailableIcon}
    />

  {:else if entries.length === 0}
    <!-- Empty state -->
    <EmptyState
      heading={emptyHeading}
      body={emptyBody}
      icon={emptyIcon}
    />

  {:else}
    <!-- Toolbar -->
    <div class="log-viewer-toolbar">
      <div class="log-viewer-toolbar-row">
        <div class="log-viewer-search">
          <Input
            size="sm"
            placeholder="Filter logs..."
            bind:value={search}
          >
            {#snippet leadingIcon()}
              <svg viewBox="0 0 256 256" fill="none">
                <path d="M229.66 218.34l-50.07-50.07a88.11 88.11 0 1 0-11.31 11.31l50.07 50.07a8 8 0 0 0 11.32-11.31ZM40 112a72 72 0 1 1 72 72 72.08 72.08 0 0 1-72-72Z" fill="currentColor"/>
              </svg>
            {/snippet}
          </Input>
        </div>

        <span class="log-viewer-toolbar-separator" aria-hidden="true"></span>

        <div class="log-viewer-filters">
          <Checkbox label="Info ({counts.INFO})" bind:checked={showInfo} />
          <Checkbox label="Warn ({counts.WARNING})" bind:checked={showWarning} />
          <Checkbox label="Error ({counts.ERROR})" bind:checked={showError} />
        </div>

        <span class="log-viewer-toolbar-separator" aria-hidden="true"></span>

        <div class="log-viewer-toggle">
          <Toggle label="Relative" bind:checked={relativeTime} />
        </div>
      </div>
    </div>

    <!-- Truncation warning -->
    {#if truncated}
      <div class="log-viewer-alert">
        <Alert variant="warning">
          Log output was truncated. Some entries may be missing.
        </Alert>
      </div>
    {/if}

    <!-- Log entries -->
    <div
      class="log-viewer-entries"
      role="log"
      aria-live="polite"
      aria-label="Log entries"
    >
      {#if filteredEntries.length === 0}
        <div class="log-viewer-no-match">
          No entries match the current filters.
        </div>
      {:else}
        {#each filteredEntries as entry, i (entry.timestamp + i)}
          <div class="log-viewer-entry log-viewer-entry--{entry._level.toLowerCase()}">
            <span class="log-viewer-timestamp" title={entry.timestamp}>
              {formatTimestamp(entry.timestamp)}
            </span>
            <Badge variant={levelVariant[entry._level]}>{entry._level}</Badge>
            <span class="log-viewer-message">{entry.message}</span>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Status bar -->
    <div class="log-viewer-status">
      <span class="log-viewer-status-text">
        {filteredEntries.length}{hasActiveFilters ? ` of ${entries.length}` : ''} entries
      </span>
    </div>
  {/if}
</div>

<style>
  .log-viewer {
    display: flex;
    flex-direction: column;
    background: var(--log-viewer-bg);
    border: var(--log-viewer-border);
    border-radius: var(--log-viewer-radius);
    overflow: hidden;
  }

  /* ─── Loading ─── */
  .log-viewer-loading {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-md);
  }

  /* ─── Toolbar ─── */
  .log-viewer-toolbar {
    padding: var(--log-viewer-toolbar-padding);
    border-bottom: var(--log-viewer-toolbar-border);
    background: var(--color-surface);
  }

  .log-viewer-toolbar-row {
    display: flex;
    align-items: center;
    gap: var(--log-viewer-toolbar-gap);
    flex-wrap: wrap;
  }

  .log-viewer-search {
    flex: 1;
    min-width: 160px;
  }

  .log-viewer-filters {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-shrink: 0;
  }

  .log-viewer-toggle {
    flex-shrink: 0;
  }

  .log-viewer-toolbar-separator {
    width: var(--border-width-default);
    height: 20px;
    background: var(--color-border);
    flex-shrink: 0;
  }

  /* ─── Truncation alert ─── */
  .log-viewer-alert {
    padding: 0 var(--space-md) var(--space-sm);
  }

  /* ─── Entries ─── */
  .log-viewer-entries {
    overflow-y: auto;
    max-height: var(--log-viewer-max-height);
    scroll-behavior: smooth;
  }

  .log-viewer-entry {
    display: flex;
    align-items: baseline;
    gap: var(--space-md);
    padding: var(--log-viewer-entry-padding-y) var(--log-viewer-entry-padding-x);
    border-bottom: var(--log-viewer-entry-border);
    font-family: var(--log-viewer-entry-font);
    font-size: var(--log-viewer-entry-size);
    line-height: var(--log-viewer-entry-leading);
    transition: background var(--duration-instant) var(--easing-default);
  }

  .log-viewer-entry:last-child {
    border-bottom: none;
  }

  .log-viewer-entry:hover {
    background: var(--log-viewer-entry-hover-bg);
  }

  /* Level accent — left border stripe */
  .log-viewer-entry--error {
    border-left: var(--accent-stripe-width) solid var(--log-viewer-level-error-color);
  }

  .log-viewer-entry--warning {
    border-left: var(--accent-stripe-width) solid var(--log-viewer-level-warning-color);
  }

  .log-viewer-entry--info {
    border-left: var(--accent-stripe-width) solid transparent;
  }

  .log-viewer-timestamp {
    flex-shrink: 0;
    width: var(--log-viewer-timestamp-width);
    color: var(--log-viewer-timestamp-color);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .log-viewer-message {
    flex: 1;
    min-width: 0;
    color: var(--log-viewer-entry-color);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .log-viewer-no-match {
    padding: var(--space-lg);
    text-align: center;
    font-family: var(--log-viewer-status-font);
    font-size: var(--log-viewer-status-size);
    color: var(--log-viewer-status-color);
  }

  /* ─── Status bar ─── */
  .log-viewer-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--log-viewer-status-padding);
    border-top: var(--log-viewer-toolbar-border);
    background: var(--color-surface);
  }

  .log-viewer-status-text {
    font-family: var(--log-viewer-status-font);
    font-size: var(--log-viewer-status-size);
    color: var(--log-viewer-status-color);
  }
</style>
