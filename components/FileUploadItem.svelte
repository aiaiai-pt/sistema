<!--
  @component FileUploadItem

  Per-file upload/processing status row. Parent controls all state —
  this is a pure display component. Uses DS Progress internally.

  Consumes --fileupload-item-* tokens from components.css.

  @example Uploading
  <FileUploadItem name="report.pdf" size={2_400_000} status="uploading" progress={65} />

  @example Error
  <FileUploadItem name="data.csv" status="error" error="File exceeds 50 MB limit" onremove={() => {}} />

  @example Complete
  <FileUploadItem name="notes.txt" size={1_200} status="complete" />
-->
<script>
  import Progress from './Progress.svelte';

  let {
    /** @type {string} */
    name = '',
    /** @type {number} File size in bytes */
    size = 0,
    /** @type {'pending' | 'uploading' | 'complete' | 'error'} */
    status = 'pending',
    /** @type {number} 0-100 */
    progress = 0,
    /** @type {string} */
    error = '',
    /** @type {(() => void) | undefined} */
    onremove = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /**
   * Format bytes to human-readable size.
   * @param {number} bytes
   * @returns {string}
   */
  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const val = bytes / Math.pow(1024, i);
    return `${val % 1 === 0 ? val : val.toFixed(1)} ${units[i]}`;
  }
</script>

<div class="fileupload-item fileupload-item-{status} {className}" {...rest}>
  <div class="fileupload-item-icon">
    {#if status === 'complete'}
      <!-- Checkmark -->
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
        <path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    {:else if status === 'error'}
      <!-- X circle -->
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
        <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    {:else if status === 'uploading'}
      <!-- Arrow up -->
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 15V5M10 5l-4 4M10 5l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    {:else}
      <!-- File -->
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M6 3h5l5 5v9a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M11 3v5h5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    {/if}
  </div>
  <div class="fileupload-item-content">
    <div class="fileupload-item-header">
      <span class="fileupload-item-name">{name}</span>
      {#if size && status !== 'error'}
        <span class="fileupload-item-size">{formatSize(size)}</span>
      {/if}
      {#if onremove}
        <button class="fileupload-item-remove" onclick={onremove} aria-label="Remove {name}">&times;</button>
      {/if}
    </div>
    {#if status === 'uploading'}
      <div class="fileupload-item-progress">
        <Progress value={progress} />
        <span class="fileupload-item-pct">{progress}%</span>
      </div>
    {/if}
    {#if status === 'error' && error}
      <span class="fileupload-item-error">{error}</span>
    {/if}
  </div>
</div>

<style>
  .fileupload-item {
    display: flex;
    align-items: flex-start;
    gap: var(--fileupload-item-gap);
    padding: var(--fileupload-item-padding);
    background: var(--fileupload-item-bg);
    border: var(--fileupload-item-border);
    border-radius: var(--fileupload-item-radius);
  }

  .fileupload-item-icon {
    flex-shrink: 0;
    width: var(--fileupload-item-icon-size);
    height: var(--fileupload-item-icon-size);
    color: var(--color-text-muted);
    display: flex;
  }

  .fileupload-item-icon svg {
    width: 100%;
    height: 100%;
  }

  .fileupload-item-uploading .fileupload-item-icon {
    color: var(--color-accent);
  }

  .fileupload-item-complete .fileupload-item-icon {
    color: var(--fileupload-item-complete-color);
  }

  .fileupload-item-error .fileupload-item-icon {
    color: var(--fileupload-item-error-color);
  }

  .fileupload-item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  .fileupload-item-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .fileupload-item-name {
    font-family: var(--fileupload-item-name-font);
    font-size: var(--fileupload-item-name-size);
    color: var(--fileupload-item-name-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .fileupload-item-complete .fileupload-item-name {
    color: var(--fileupload-item-complete-color);
  }

  .fileupload-item-size {
    font-family: var(--fileupload-item-size-font);
    font-size: var(--fileupload-item-size-size);
    color: var(--fileupload-item-size-color);
    flex-shrink: 0;
  }

  .fileupload-item-remove {
    all: unset;
    cursor: pointer;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    font-size: 16px;
    line-height: 1;
    border-radius: var(--radius-sm);
  }

  .fileupload-item-remove:hover {
    color: var(--color-text);
  }

  .fileupload-item-remove:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .fileupload-item-progress {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .fileupload-item-progress :global(.progress) {
    flex: 1;
  }

  .fileupload-item-pct {
    font-family: var(--fileupload-item-size-font);
    font-size: var(--fileupload-item-size-size);
    color: var(--fileupload-item-size-color);
    flex-shrink: 0;
    min-width: 3ch;
    text-align: right;
  }

  .fileupload-item-error {
    font-family: var(--fileupload-item-name-font);
    font-size: var(--fileupload-item-size-size);
    color: var(--fileupload-item-error-color);
  }
</style>
