<!--
  @component CommandPalette

  Modal search + command launcher triggered by keyboard shortcut.
  Supports built-in fuzzy scoring, grouped results, keyboard navigation,
  and both declarative (sections prop) and composable (children) APIs.
  Consumes --palette-* tokens from components.css.

  @example Declarative
  <CommandPalette
    bind:open={paletteOpen}
    trigger="mod+k"
    placeholder="Type a command or search..."
    sections={[
      { heading: 'Recent', items: [
        { value: 'pipeline-1', label: 'Customer ETL', onselect: () => goto('/pipelines/1') },
      ]},
      { heading: 'Actions', items: [
        { value: 'new-pipeline', label: 'Create pipeline', shortcut: '⌘N', onselect: createPipeline },
      ]},
    ]}
  />

  @example Composable
  <CommandPalette.Root bind:open={paletteOpen} trigger="mod+k">
    <CommandPalette.Input placeholder="Search..." />
    <CommandPalette.List>
      <CommandPalette.Group heading="Recent">
        <CommandPalette.Item value="pipeline-1" onselect={...}>Customer ETL</CommandPalette.Item>
      </CommandPalette.Group>
      <CommandPalette.Empty>No results found</CommandPalette.Empty>
    </CommandPalette.List>
  </CommandPalette.Root>
-->
<script module>
  let _paletteUid = 0;

  /**
   * Simple fuzzy score: returns 0-1 for how well query matches text.
   * 0 = no match, 1 = exact prefix match. Based on command-score heuristics.
   * @param {string} text
   * @param {string} query
   * @returns {number}
   */
  export function commandScore(text, query) {
    if (!query) return 1;
    const lower = text.toLowerCase();
    const q = query.toLowerCase();

    // Exact prefix
    if (lower.startsWith(q)) return 1;

    // Contains as substring
    const idx = lower.indexOf(q);
    if (idx >= 0) {
      // Prefer word boundary matches
      if (lower[idx - 1] === ' ' || lower[idx - 1] === '-' || lower[idx - 1] === '/') {
        return 0.8;
      }
      return 0.6;
    }

    // Character-by-character fuzzy match
    let qi = 0;
    let matched = 0;
    for (let i = 0; i < lower.length && qi < q.length; i++) {
      if (lower[i] === q[qi]) {
        matched++;
        qi++;
      }
    }

    if (qi < q.length) return 0; // Not all query chars found
    return (matched / text.length) * 0.4;
  }
</script>

<script>
  /**
   * @typedef {{ value: string, label: string, description?: string, shortcut?: string, keywords?: string[], disabled?: boolean, onselect?: (value: string) => void }} PaletteItem
   * @typedef {{ heading: string, items: PaletteItem[] }} PaletteSection
   */

  let {
    /** @type {boolean} */
    open = $bindable(false),
    /** @type {string} Keyboard shortcut trigger. "mod" = ⌘ on Mac, Ctrl on Windows. */
    trigger = 'mod+k',
    /** @type {string} */
    placeholder = 'Type a command or search...',
    /** @type {PaletteSection[]} Declarative sections and items */
    sections = [],
    /** @type {boolean} Use built-in fuzzy scoring */
    shouldFilter = true,
    /** @type {boolean} Arrow keys wrap around the list */
    loop = true,
    /** @type {((open: boolean) => void) | undefined} */
    onopenchange = undefined,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    ...rest
  } = $props();

  const paletteId = `palette-${_paletteUid++}`;
  const inputId = `${paletteId}-input`;

  let query = $state('');
  let activeIndex = $state(0);
  /** @type {HTMLInputElement | undefined} */
  let inputEl = $state();
  /** @type {HTMLElement | undefined} */
  let listEl = $state();

  // Parse trigger shortcut
  const triggerParts = $derived(trigger.split('+'));
  const triggerKey = $derived(triggerParts[triggerParts.length - 1].toLowerCase());
  const triggerMod = $derived(triggerParts.includes('mod'));
  const triggerShift = $derived(triggerParts.includes('shift'));
  const triggerAlt = $derived(triggerParts.includes('alt'));

  // Filter items by query
  const filteredSections = $derived.by(() => {
    if (!shouldFilter || !query) return sections;

    return sections
      .map(section => {
        const scored = section.items
          .map(item => {
            const textScore = commandScore(item.label, query);
            const descScore = item.description ? commandScore(item.description, query) * 0.5 : 0;
            const kwScore = item.keywords
              ? Math.max(...item.keywords.map(kw => commandScore(kw, query))) * 0.7
              : 0;
            return { item, score: Math.max(textScore, descScore, kwScore) };
          })
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score);

        return { heading: section.heading, items: scored.map(s => s.item) };
      })
      .filter(section => section.items.length > 0);
  });

  // Flat list of all visible items for keyboard navigation
  const flatItems = $derived(filteredSections.flatMap(s => s.items));
  const totalItems = $derived(flatItems.length);
  const isEmpty = $derived(query.length > 0 && totalItems === 0);

  // Reset active index when results change
  $effect(() => {
    // Access flatItems to create dependency
    flatItems;
    activeIndex = 0;
  });

  function openPalette() {
    open = true;
    query = '';
    activeIndex = 0;
    onopenchange?.(true);
    requestAnimationFrame(() => inputEl?.focus());
  }

  function closePalette() {
    open = false;
    query = '';
    onopenchange?.(false);
  }

  function selectItem(/** @type {PaletteItem} */ item) {
    if (item.disabled) return;
    closePalette();
    item.onselect?.(item.value);
  }

  /** @param {KeyboardEvent} e */
  function handleInputKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (loop) {
          activeIndex = (activeIndex + 1) % Math.max(totalItems, 1);
        } else {
          activeIndex = Math.min(activeIndex + 1, totalItems - 1);
        }
        scrollActiveIntoView();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (loop) {
          activeIndex = activeIndex <= 0 ? Math.max(totalItems - 1, 0) : activeIndex - 1;
        } else {
          activeIndex = Math.max(activeIndex - 1, 0);
        }
        scrollActiveIntoView();
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < totalItems) {
          selectItem(flatItems[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closePalette();
        break;
    }
  }

  function scrollActiveIntoView() {
    requestAnimationFrame(() => {
      const el = listEl?.querySelector(`[data-palette-index="${activeIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    });
  }

  /**
   * Highlight matching text
   * @param {string} text
   * @param {string} q
   * @returns {{ before: string, match: string, after: string } | null}
   */
  function getHighlight(text, q) {
    if (!q) return null;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return null;
    return {
      before: text.slice(0, idx),
      match: text.slice(idx, idx + q.length),
      after: text.slice(idx + q.length),
    };
  }

  // Global keyboard shortcut listener
  $effect(() => {
    /** @param {KeyboardEvent} e */
    function handleGlobalKeydown(e) {
      const modMatch = triggerMod ? (e.metaKey || e.ctrlKey) : true;
      const shiftMatch = triggerShift ? e.shiftKey : !e.shiftKey;
      const altMatch = triggerAlt ? e.altKey : !e.altKey;

      if (modMatch && shiftMatch && altMatch && e.key.toLowerCase() === triggerKey) {
        e.preventDefault();
        if (open) {
          closePalette();
        } else {
          openPalette();
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  });

  // Precomputed index map: item → global index (M6 fix)
  const itemIndexMap = $derived(new Map(flatItems.map((item, i) => [item, i])));

  // Focus trap + scroll lock when open (C1 fix)
  /** @type {HTMLElement | undefined} */
  let paletteEl = $state();
  const FOCUSABLE = 'input, button, [tabindex]:not([tabindex="-1"])';

  $effect(() => {
    if (!open || !paletteEl) return;
    document.body.style.overflow = 'hidden';

    /** @param {KeyboardEvent} e */
    function handleTrapKeydown(e) {
      if (e.key !== 'Tab') return;
      const focusable = /** @type {NodeListOf<HTMLElement>} */ (paletteEl?.querySelectorAll(FOCUSABLE));
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleTrapKeydown);
    return () => {
      document.removeEventListener('keydown', handleTrapKeydown);
      document.body.style.overflow = '';
    };
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="palette-backdrop"
    onclick={closePalette}
    aria-hidden="true"
    role="presentation"
  ></div>

  <div class="palette-container">
    <div
      bind:this={paletteEl}
      class="palette {className}"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      {...rest}
    >
      {#if children}
        {@render children()}
      {:else}
        <!-- Declarative API -->
        <div class="palette-input-wrap">
          <span class="palette-input-icon" aria-hidden="true">
            <svg class="palette-icon" viewBox="0 0 256 256" fill="none">
              <circle cx="115.5" cy="115.5" r="67.5" stroke="currentColor" stroke-width="16" fill="none"/>
              <line x1="164.2" y1="164.2" x2="224" y2="224" stroke="currentColor" stroke-width="16" stroke-linecap="round"/>
            </svg>
          </span>
          <input
            bind:this={inputEl}
            id={inputId}
            type="text"
            class="palette-input"
            {placeholder}
            bind:value={query}
            onkeydown={handleInputKeydown}
            autocomplete="off"
            spellcheck="false"
            role="combobox"
            aria-expanded={totalItems > 0}
            aria-controls="{paletteId}-list"
            aria-activedescendant={totalItems > 0 ? `${paletteId}-item-${activeIndex}` : undefined}
          />
        </div>

        <div
          bind:this={listEl}
          id="{paletteId}-list"
          class="palette-list"
          role="listbox"
          aria-label="Command palette results"
        >
          {#if isEmpty}
            <div class="palette-empty" role="status">
              No results for "{query}"
            </div>
          {:else}
            {#each filteredSections as section}
              <div class="palette-group" role="group" aria-label={section.heading}>
                <div class="palette-group-heading">{section.heading}</div>
                {#each section.items as item}
                  {@const globalIndex = itemIndexMap.get(item) ?? -1}
                  {@const isActive = globalIndex === activeIndex}
                  {@const hl = getHighlight(item.label, query)}
                  <div
                    id="{paletteId}-item-{globalIndex}"
                    class="palette-item"
                    class:palette-item-active={isActive}
                    class:palette-item-disabled={item.disabled}
                    role="option"
                    aria-selected={isActive}
                    aria-disabled={item.disabled || undefined}
                    data-palette-index={globalIndex}
                    onmousedown={(e) => { if (!item.disabled) e.preventDefault(); selectItem(item); }}
                    onmouseenter={() => { activeIndex = globalIndex; }}
                  >
                    <div class="palette-item-content">
                      <span class="palette-item-label">
                        {#if hl}
                          {hl.before}<mark class="palette-highlight">{hl.match}</mark>{hl.after}
                        {:else}
                          {item.label}
                        {/if}
                      </span>
                      {#if item.description}
                        <span class="palette-item-description">{item.description}</span>
                      {/if}
                    </div>
                    {#if item.shortcut}
                      <kbd class="palette-shortcut">{item.shortcut}</kbd>
                    {/if}
                  </div>
                {/each}
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* ─── Backdrop ─── */
  .palette-backdrop {
    position: fixed;
    inset: 0;
    background: var(--palette-backdrop);
    z-index: 60;
    animation: palette-fade-in var(--palette-transition);
  }

  .palette-container {
    position: fixed;
    inset: 0;
    z-index: 61;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: var(--palette-top-offset);
    pointer-events: none;
  }

  /* ─── Dialog ─── */
  .palette {
    pointer-events: auto;
    width: var(--palette-width);
    max-width: calc(100vw - var(--space-xl));
    max-height: var(--palette-max-height);
    background: var(--palette-bg);
    border-radius: var(--palette-radius);
    box-shadow: var(--palette-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: palette-scale-in var(--palette-transition);
  }

  /* ─── Input ─── */
  .palette-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    border-bottom: var(--palette-input-border);
    flex-shrink: 0;
  }

  .palette-input-icon {
    position: absolute;
    left: var(--space-md);
    display: flex;
    color: var(--search-icon-color);
    pointer-events: none;
  }

  .palette-icon {
    width: var(--search-icon-size-md);
    height: var(--search-icon-size-md);
  }

  .palette-input {
    width: 100%;
    height: var(--palette-input-height);
    padding: var(--palette-input-padding);
    padding-left: calc(var(--space-md) + var(--search-icon-size-md) + var(--space-sm));
    font-family: var(--palette-input-font);
    font-size: var(--palette-input-size);
    color: var(--color-text);
    background: transparent;
    border: none;
    outline: none;
  }

  .palette-input::placeholder {
    color: var(--input-placeholder);
  }

  /* ─── List ─── */
  .palette-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--palette-list-padding);
    max-height: var(--palette-list-max-height);
  }

  /* ─── Group ─── */
  .palette-group-heading {
    font-family: var(--palette-group-font);
    font-size: var(--palette-group-size);
    letter-spacing: var(--palette-group-tracking);
    color: var(--palette-group-color);
    padding: var(--palette-group-padding);
    text-transform: uppercase;
  }

  /* ─── Item ─── */
  .palette-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: var(--palette-item-padding);
    border-radius: var(--palette-item-radius);
    cursor: pointer;
    transition: background var(--duration-instant) var(--easing-default);
  }

  .palette-item:hover,
  .palette-item-active {
    background: var(--palette-item-hover-bg);
  }

  .palette-item-active {
    background: var(--palette-item-active-bg);
  }

  .palette-item-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .palette-item-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    min-width: 0;
  }

  .palette-item-label {
    font-family: var(--input-font);
    font-size: var(--input-font-size);
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .palette-item-description {
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .palette-highlight {
    background: transparent;
    color: var(--palette-highlight-color);
    font-weight: var(--type-overline-weight);
  }

  /* ─── Shortcut badge ─── */
  .palette-shortcut {
    flex-shrink: 0;
    font-family: var(--palette-shortcut-font);
    font-size: var(--palette-shortcut-size);
    color: var(--palette-shortcut-color);
    background: var(--palette-shortcut-bg);
    border-radius: var(--palette-shortcut-radius);
    padding: var(--palette-shortcut-padding);
    border: var(--elevation-border);
    line-height: 1;
  }

  /* ─── Empty state ─── */
  .palette-empty {
    padding: var(--space-xl) var(--space-md);
    text-align: center;
    font-family: var(--palette-empty-font);
    font-size: var(--palette-empty-size);
    color: var(--palette-empty-color);
  }

  /* ─── Animations ─── */
  @keyframes palette-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes palette-scale-in {
    from { opacity: 0; transform: scale(0.96) translateY(-8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .palette,
    .palette-backdrop {
      animation: none;
    }
    .palette-item {
      transition: none;
    }
  }

  /* ─── Mobile ─── */
  @media (max-width: 640px) {
    .palette-container {
      padding-top: var(--space-sm);
      align-items: flex-start;
    }

    .palette {
      max-width: calc(100vw - var(--space-md));
      max-height: calc(100vh - var(--space-lg));
    }
  }
</style>
