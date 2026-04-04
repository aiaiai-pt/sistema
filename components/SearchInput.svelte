<!--
  @component SearchInput

  Text input optimized for search with built-in icon, clear button,
  debounced callback, optional keyboard shortcut hint, and loading state.
  Extends the Input token system (--input-*) with search-specific tokens (--search-*).

  @example Basic
  <SearchInput placeholder="Search transforms..." onsearch={handleSearch} />

  @example With shortcut hint
  <SearchInput placeholder="Search..." shortcutHint="⌘K" onsearch={handleSearch} />

  @example Loading state
  <SearchInput placeholder="Search..." loading={true} onsearch={handleSearch} />

  @example Collapsible (for toolbars / mobile)
  <SearchInput collapsible placeholder="Search..." onsearch={handleSearch} />

  @example Inside a modal (preserve value on Escape)
  <SearchInput holdValueOnEscape placeholder="Search..." onsearch={handleSearch} />

  @example No debounce (instant)
  <SearchInput debounce={0} onsearch={handleSearch} />
-->
<script module>
  let _searchUid = 0;
</script>

<script>
  /**
   * @typedef {'sm' | 'md' | 'lg'} Size
   */

  let {
    /** @type {string} */
    value = $bindable(''),
    /** @type {string} */
    placeholder = 'Search...',
    /** @type {Size} */
    size = 'md',
    /** @type {number} Debounce delay in ms. 0 = disabled. */
    debounce = 300,
    /** @type {boolean} Show spinner instead of search icon */
    loading = false,
    /** @type {boolean} Collapse to icon-only when empty and blurred */
    collapsible = false,
    /** @type {string | null} Keyboard shortcut hint badge (e.g., "⌘K", "/") */
    shortcutHint = null,
    /** @type {boolean} Preserve value when Escape is pressed (for use inside modals) */
    holdValueOnEscape = false,
    /** @type {boolean} */
    disabled = false,
    /** @type {string} Accessible label (sr-only) */
    label = 'Search',
    /** @type {string | undefined} */
    id = undefined,
    /** @type {string} */
    class: className = '',
    /** @type {((value: string) => void) | undefined} Fires on every keystroke */
    oninput = undefined,
    /** @type {((value: string) => void) | undefined} Fires after debounce delay */
    onsearch = undefined,
    /** @type {(() => void) | undefined} Fires when cleared (X click or Escape) */
    onclear = undefined,
    ...rest
  } = $props();

  const fallbackId = `search-${_searchUid++}`;
  const inputId = $derived(id ?? fallbackId);

  /** @type {HTMLInputElement | undefined} */
  let inputEl = $state();
  let collapsed = $state(collapsible);
  let focused = $state(false);

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounceTimer;

  const hasValue = $derived(value.length > 0);

  // React to collapsible prop changes
  $effect(() => {
    if (collapsible && !hasValue) collapsed = true;
    if (!collapsible) collapsed = false;
  });
  const showShortcut = $derived(shortcutHint && !focused && !hasValue);

  function handleInput() {
    oninput?.(value);

    if (debounce <= 0) {
      onsearch?.(value);
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onsearch?.(value);
    }, debounce);
  }

  function handleClear() {
    value = '';
    clearTimeout(debounceTimer);
    onsearch?.('');
    onclear?.();
    inputEl?.focus();
  }

  /** @param {KeyboardEvent} e */
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (holdValueOnEscape) {
        // Let the event propagate (parent modal handles Escape)
        return;
      }
      if (hasValue) {
        e.preventDefault();
        e.stopPropagation();
        handleClear();
      } else if (collapsible) {
        collapsed = true;
        inputEl?.blur();
      }
    }
  }

  function handleFocus() {
    focused = true;
    if (collapsible && collapsed) {
      collapsed = false;
    }
  }

  function handleBlur() {
    focused = false;
    if (collapsible && !hasValue) {
      collapsed = true;
    }
  }

  function handleExpandClick() {
    collapsed = false;
    // Focus after the transition
    requestAnimationFrame(() => {
      inputEl?.focus();
    });
  }

  // Cleanup on destroy
  $effect(() => {
    return () => clearTimeout(debounceTimer);
  });
</script>

{#if collapsed}
  <button
    class="search-collapsed search-collapsed-{size} {className}"
    onclick={handleExpandClick}
    aria-label={label}
    {disabled}
    {...rest}
  >
    <svg class="search-icon search-icon-{size}" viewBox="0 0 256 256" fill="none" aria-hidden="true">
      <circle cx="115.5" cy="115.5" r="67.5" stroke="currentColor" stroke-width="16" fill="none"/>
      <line x1="164.2" y1="164.2" x2="224" y2="224" stroke="currentColor" stroke-width="16" stroke-linecap="round"/>
    </svg>
  </button>
{:else}
  <div
    class="search-group {className}"
    class:search-group-focused={focused}
    role="search"
    aria-label={label}
    {...rest}
  >
    <label class="sr-only" for={inputId}>{label}</label>

    <span class="search-leading search-leading-{size}" aria-hidden="true">
      {#if loading}
        <span class="search-spinner search-spinner-{size}"></span>
      {:else}
        <svg class="search-icon search-icon-{size}" viewBox="0 0 256 256" fill="none">
          <circle cx="115.5" cy="115.5" r="67.5" stroke="currentColor" stroke-width="16" fill="none"/>
          <line x1="164.2" y1="164.2" x2="224" y2="224" stroke="currentColor" stroke-width="16" stroke-linecap="round"/>
        </svg>
      {/if}
    </span>

    <input
      bind:this={inputEl}
      id={inputId}
      type="search"
      class="search-input search-input-{size}"
      {placeholder}
      {disabled}
      bind:value
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={handleFocus}
      onblur={handleBlur}
      autocomplete="off"
      spellcheck="false"
      aria-label={label}
    />

    {#if hasValue}
      <button
        class="search-clear search-clear-{size}"
        onclick={handleClear}
        aria-label="Clear search"
        tabindex="-1"
        type="button"
      >
        <svg viewBox="0 0 256 256" fill="none" aria-hidden="true">
          <line x1="80" y1="80" x2="176" y2="176" stroke="currentColor" stroke-width="16" stroke-linecap="round"/>
          <line x1="176" y1="80" x2="80" y2="176" stroke="currentColor" stroke-width="16" stroke-linecap="round"/>
        </svg>
      </button>
    {:else if showShortcut}
      <kbd class="search-shortcut search-shortcut-{size}">{shortcutHint}</kbd>
    {/if}
  </div>
{/if}

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* ─── Container ─── */
  .search-group {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  /* ─── Input ─── */
  .search-input {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    color: var(--input-text);
    transition: border var(--input-transition);
    width: 100%;
    /* Remove native search decorations */
    -webkit-appearance: none;
    appearance: none;
  }

  .search-input::-webkit-search-cancel-button,
  .search-input::-webkit-search-decoration {
    display: none;
  }

  .search-input::placeholder {
    color: var(--input-placeholder);
  }

  .search-input:focus {
    outline: none;
    border: var(--input-border-focus);
  }

  .search-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Size variants — padding accounts for icon + clear/shortcut */
  .search-input-sm {
    height: var(--input-sm-height);
    padding: 0 var(--input-sm-padding-x);
    padding-left: calc(var(--input-sm-padding-x) + var(--search-icon-size-sm) + var(--space-xs));
    padding-right: calc(var(--input-sm-padding-x) + var(--search-icon-size-sm) + var(--space-xs));
  }

  .search-input-md {
    height: var(--input-md-height);
    padding: 0 var(--input-md-padding-x);
    padding-left: calc(var(--input-md-padding-x) + var(--search-icon-size-md) + var(--space-xs));
    padding-right: calc(var(--input-md-padding-x) + var(--search-icon-size-md) + var(--space-xs));
  }

  .search-input-lg {
    height: var(--input-lg-height);
    padding: 0 var(--input-lg-padding-x);
    padding-left: calc(var(--input-lg-padding-x) + var(--search-icon-size-lg) + var(--space-xs));
    padding-right: calc(var(--input-lg-padding-x) + var(--search-icon-size-lg) + var(--space-xs));
  }

  /* ─── Leading icon / spinner ─── */
  .search-leading {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--search-icon-color);
    pointer-events: none;
    transition: color var(--input-transition);
  }

  .search-group-focused .search-leading {
    color: var(--search-icon-color-focus);
  }

  .search-leading-sm { left: var(--input-sm-padding-x); }
  .search-leading-md { left: var(--input-md-padding-x); }
  .search-leading-lg { left: var(--input-lg-padding-x); }

  .search-icon {
    display: block;
  }

  .search-icon-sm { width: var(--search-icon-size-sm); height: var(--search-icon-size-sm); }
  .search-icon-md { width: var(--search-icon-size-md); height: var(--search-icon-size-md); }
  .search-icon-lg { width: var(--search-icon-size-lg); height: var(--search-icon-size-lg); }

  /* ─── Spinner ─── */
  .search-spinner {
    border: var(--border-width-thick) solid var(--color-border);
    border-top-color: var(--search-spinner-color);
    border-radius: var(--radius-circle);
    animation: search-spin 0.6s linear infinite;
  }

  .search-spinner-sm { width: var(--search-icon-size-sm); height: var(--search-icon-size-sm); }
  .search-spinner-md { width: var(--search-icon-size-md); height: var(--search-icon-size-md); }
  .search-spinner-lg { width: var(--search-icon-size-lg); height: var(--search-icon-size-lg); }

  @keyframes search-spin {
    to { transform: rotate(360deg); }
  }

  /* ─── Clear button ─── */
  .search-clear {
    all: unset;
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--search-clear-color);
    border-radius: var(--radius-sm);
    transition: color var(--input-transition);
  }

  .search-clear:hover {
    color: var(--search-clear-color-hover);
  }

  .search-clear:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .search-clear svg {
    width: 100%;
    height: 100%;
  }

  .search-clear-sm {
    right: var(--input-sm-padding-x);
    width: var(--search-icon-size-sm);
    height: var(--search-icon-size-sm);
  }

  .search-clear-md {
    right: var(--input-md-padding-x);
    width: var(--search-icon-size-md);
    height: var(--search-icon-size-md);
  }

  .search-clear-lg {
    right: var(--input-lg-padding-x);
    width: var(--search-icon-size-lg);
    height: var(--search-icon-size-lg);
  }

  /* ─── Shortcut badge ─── */
  .search-shortcut {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--search-shortcut-font);
    font-size: var(--search-shortcut-size);
    color: var(--search-shortcut-color);
    background: var(--search-shortcut-bg);
    border-radius: var(--search-shortcut-radius);
    padding: var(--search-shortcut-padding);
    pointer-events: none;
    line-height: 1;
    border: var(--elevation-border);
  }

  .search-shortcut-sm { right: var(--input-sm-padding-x); }
  .search-shortcut-md { right: var(--input-md-padding-x); }
  .search-shortcut-lg { right: var(--input-lg-padding-x); }

  /* ─── Collapsed (icon-only) ─── */
  .search-collapsed {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--input-border);
    border-radius: var(--input-radius);
    background: var(--input-bg);
    color: var(--search-icon-color);
    transition: all var(--search-collapse-transition);
  }

  .search-collapsed:hover {
    color: var(--search-icon-color-focus);
    border: var(--input-border-focus);
  }

  .search-collapsed:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .search-collapsed:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .search-collapsed-sm {
    width: var(--input-sm-height);
    height: var(--input-sm-height);
  }

  .search-collapsed-md {
    width: var(--input-md-height);
    height: var(--input-md-height);
  }

  .search-collapsed-lg {
    width: var(--input-lg-height);
    height: var(--input-lg-height);
  }

  @media (prefers-reduced-motion: reduce) {
    .search-input,
    .search-leading,
    .search-clear,
    .search-collapsed {
      transition: none;
    }
    .search-spinner {
      animation: none;
    }
  }
</style>
