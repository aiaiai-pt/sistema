<!--
  @component FileUpload

  Drag-and-drop file upload zone. Does NOT handle uploads — emits
  validated File[] to parent via callback. Parent owns upload logic.

  Consumes --fileupload-* tokens from components.css.

  @example
  <FileUpload accept=".pdf,.docx" maxSize={52_428_800} onfiles={(files) => handleFiles(files)}>
    {#snippet icon()}<PhCloudArrowUp size={32} />{/snippet}
  </FileUpload>

  @example Custom content
  <FileUpload onfiles={handleFiles}>
    {#snippet children()}
      <p>Custom drop zone content</p>
    {/snippet}
  </FileUpload>
-->
<script>
  let {
    /** @type {string} Comma-separated MIME types or extensions */
    accept = '',
    /** @type {number} Max bytes per file. 0 = no limit */
    maxSize = 0,
    /** @type {boolean} */
    multiple = true,
    /** @type {boolean} */
    disabled = false,
    /** @type {((files: File[]) => void) | undefined} */
    onfiles = undefined,
    /** @type {((files: File[]) => void) | undefined} Called with files that failed validation */
    onreject = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    icon = undefined,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  let dragging = $state(false);
  /** @type {HTMLInputElement | undefined} */
  let inputEl;

  /**
   * Format bytes to human-readable size.
   * @param {number} bytes
   * @returns {string}
   */
  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const size = bytes / Math.pow(1024, i);
    return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
  }

  /**
   * Parse accept string into a set of lowercase extensions and MIME types.
   * @param {string} acceptStr
   * @returns {{ extensions: Set<string>, mimeTypes: Set<string> }}
   */
  function parseAccept(acceptStr) {
    const extensions = new Set();
    const mimeTypes = new Set();
    if (!acceptStr) return { extensions, mimeTypes };
    for (const part of acceptStr.split(',')) {
      const trimmed = part.trim().toLowerCase();
      if (trimmed.startsWith('.')) {
        extensions.add(trimmed);
      } else if (trimmed.includes('/')) {
        mimeTypes.add(trimmed);
      }
    }
    return { extensions, mimeTypes };
  }

  /**
   * Check if a file matches the accept constraint.
   * @param {File} file
   * @param {{ extensions: Set<string>, mimeTypes: Set<string> }} parsed
   * @returns {boolean}
   */
  function matchesAccept(file, parsed) {
    if (parsed.extensions.size === 0 && parsed.mimeTypes.size === 0) return true;
    const name = file.name.toLowerCase();
    for (const ext of parsed.extensions) {
      if (name.endsWith(ext)) return true;
    }
    const type = file.type.toLowerCase();
    for (const mime of parsed.mimeTypes) {
      if (mime.endsWith('/*')) {
        if (type.startsWith(mime.slice(0, -1))) return true;
      } else if (type === mime) {
        return true;
      }
    }
    return false;
  }

  /**
   * Filter files by accept + maxSize + non-empty.
   * @param {FileList | File[]} fileList
   * @returns {{ valid: File[], rejected: File[] }}
   */
  function validateFiles(fileList) {
    const parsed = parseAccept(accept);
    const valid = [];
    const rejected = [];
    for (const file of fileList) {
      if (file.size === 0 || !matchesAccept(file, parsed) || (maxSize > 0 && file.size > maxSize)) {
        rejected.push(file);
      } else {
        valid.push(file);
      }
    }
    if (!multiple && valid.length > 1) {
      rejected.push(...valid.slice(1));
      return { valid: [valid[0]], rejected };
    }
    return { valid, rejected };
  }

  /** @param {DragEvent} e */
  function handleDrop(e) {
    e.preventDefault();
    dragging = false;
    if (disabled) return;
    const { valid, rejected } = validateFiles(e.dataTransfer?.files ?? []);
    if (valid.length > 0) onfiles?.(valid);
    if (rejected.length > 0) onreject?.(rejected);
  }

  /** @param {DragEvent} e */
  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) dragging = true;
  }

  function handleDragLeave() {
    dragging = false;
  }

  function handleClick() {
    if (!disabled) inputEl?.click();
  }

  /** @param {Event} e */
  function handleInputChange(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    const { valid, rejected } = validateFiles(target.files ?? []);
    if (valid.length > 0) onfiles?.(valid);
    if (rejected.length > 0) onreject?.(rejected);
    target.value = '';
  }
</script>

<button
  type="button"
  class="fileupload {className}"
  class:fileupload-dragging={dragging}
  class:fileupload-disabled={disabled}
  {disabled}
  aria-label="Upload files"
  ondrop={handleDrop}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  {...rest}
  onclick={handleClick}
>
  <input
    bind:this={inputEl}
    type="file"
    {accept}
    {multiple}
    class="fileupload-input"
    onchange={handleInputChange}
    tabindex={-1}
    aria-hidden="true"
  />
  {#if children}
    {@render children()}
  {:else}
    <div class="fileupload-content">
      {#if icon}
        <span class="fileupload-icon">{@render icon()}</span>
      {/if}
      <span class="fileupload-text">Drop files here or click to browse</span>
      {#if accept || maxSize}
        <span class="fileupload-hint">
          {#if accept}{accept}{/if}
          {#if accept && maxSize} &middot; {/if}
          {#if maxSize}Max {formatSize(maxSize)}{/if}
        </span>
      {/if}
    </div>
  {/if}
</button>

<style>
  .fileupload {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: var(--fileupload-padding);
    border: var(--fileupload-border);
    border-radius: var(--fileupload-radius);
    background: var(--fileupload-bg);
    cursor: pointer;
    transition: border var(--fileupload-transition), background var(--fileupload-transition);
    font: inherit;
    color: inherit;
    text-align: center;
    position: relative;
  }

  .fileupload:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .fileupload-dragging {
    border: var(--fileupload-border-dragging);
    background: var(--fileupload-bg-dragging);
  }

  .fileupload-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fileupload-input {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .fileupload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .fileupload-icon {
    display: flex;
    width: var(--fileupload-icon-size);
    height: var(--fileupload-icon-size);
    color: var(--fileupload-icon-color);
    transition: color var(--fileupload-transition);
  }

  .fileupload-dragging .fileupload-icon {
    color: var(--fileupload-icon-color-dragging);
  }

  .fileupload-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .fileupload-text {
    font-family: var(--fileupload-text-font);
    font-size: var(--fileupload-text-size);
    color: var(--fileupload-text-color);
  }

  .fileupload-hint {
    font-family: var(--fileupload-hint-font);
    font-size: var(--fileupload-hint-size);
    color: var(--fileupload-hint-color);
  }
</style>
