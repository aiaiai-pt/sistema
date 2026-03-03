<!--
  @component OptionGrid

  Exclusive selection grid using Card (interactive + selected).
  Implements radiogroup semantics with keyboard navigation.

  @example
  <script>
    import { Database, Code } from 'phosphor-svelte';
    let type = $state(null);
    const options = [
      { value: 'sql', label: 'SQL', description: 'SQL transform', icon: Database },
      { value: 'python', label: 'Python', description: 'Python code', icon: Code },
    ];
  </script>

  <OptionGrid {options} bind:value={type} columns={2} />

  @example Compact mode (no descriptions)
  <OptionGrid {options} bind:value={type} columns={3} compact />
-->
<script>
  import Card from './Card.svelte';

  /**
   * @typedef {{ value: string, label: string, description?: string, icon?: any }} GridOption
   */

  let {
    /** @type {GridOption[]} */
    options = [],
    /** @type {string | null} */
    value = $bindable(null),
    /** @type {number} */
    columns = 2,
    /** @type {boolean} */
    compact = false,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /** @type {HTMLElement[]} */
  let buttonRefs = [];

  /**
   * Handle keyboard navigation within the radiogroup.
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    let next = -1;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const idx = options.findIndex((o) => o.value === value);
        next = idx < options.length - 1 ? idx + 1 : 0;
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const idx = options.findIndex((o) => o.value === value);
        next = idx > 0 ? idx - 1 : options.length - 1;
        break;
      }
      default:
        return;
    }

    if (next >= 0) {
      value = options[next].value;
      buttonRefs[next]?.focus();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div
  class="option-grid {className}"
  class:option-grid--compact={compact}
  style:--cols={columns}
  role="radiogroup"
  onkeydown={handleKeydown}
  {...rest}
>
  {#each options as option, i (option.value)}
    {@const selected = value === option.value}
    <Card {selected} class="option-card">
      {#snippet children()}
        <button
          type="button"
          class="option-button"
          class:option-button--compact={compact}
          role="radio"
          aria-checked={selected}
          tabindex={selected || (!value && options[0]?.value === option.value) ? 0 : -1}
          onclick={() => value = option.value}
          bind:this={buttonRefs[i]}
        >
          {#if option.icon}
            <span class="option-icon" class:option-icon--compact={compact}>
              <option.icon size={compact ? 20 : 24} weight="regular" />
            </span>
          {/if}
          <span class="option-text">
            <span class="option-label">{option.label}</span>
            {#if !compact && option.description}
              <span class="option-description">{option.description}</span>
            {/if}
          </span>
        </button>
      {/snippet}
    </Card>
  {/each}
</div>

<style>
  .option-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 2), 1fr);
    gap: var(--space-sm);
  }

  /* Remove Card's internal padding — button handles layout */
  .option-grid :global(.option-card) {
    padding: 0;
  }

  .option-button {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-md);
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    color: inherit;
    font: inherit;
  }

  .option-button--compact {
    align-items: center;
    padding: var(--space-sm) var(--space-md);
  }

  .option-button:focus-visible {
    outline: none;
  }

  .option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--space-xl);
    height: var(--space-xl);
    background: var(--color-surface-secondary);
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .option-icon--compact {
    width: auto;
    height: auto;
    background: none;
    border-radius: 0;
  }

  .option-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    min-width: 0;
  }

  .option-label {
    font-family: var(--type-data-font);
    font-size: var(--type-data-size);
    font-weight: 500;
    line-height: var(--type-data-leading);
    color: var(--color-text);
  }

  .option-description {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    line-height: var(--type-body-sm-leading);
    color: var(--color-text-secondary);
  }
</style>
