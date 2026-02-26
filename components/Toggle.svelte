<!--
  @component Toggle

  On/off switch with label.
  Consumes --toggle-* tokens from components.css.

  @example
  <Toggle label="Dark mode" bind:checked />

  @example Disabled
  <Toggle label="Notifications" checked disabled />
-->
<script>
  let {
    /** @type {boolean} */
    checked = $bindable(false),
    /** @type {boolean} */
    disabled = false,
    /** @type {string | undefined} */
    label,
    /** @type {string | undefined} */
    id,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const fallbackId = `toggle-${Math.random().toString(36).slice(2, 8)}`;
  const toggleId = $derived(id ?? fallbackId);

  function handleClick() {
    if (!disabled) {
      checked = !checked;
    }
  }
</script>

<div class="toggle-group {className}">
  <button
    id={toggleId}
    class="toggle"
    class:toggle-on={checked}
    class:toggle-disabled={disabled}
    {disabled}
    role="switch"
    aria-checked={checked}
    aria-labelledby={label ? `${toggleId}-label` : undefined}
    onclick={handleClick}
    {...rest}
  >
    <span class="toggle-knob"></span>
  </button>
  {#if label}
    <span
      id="{toggleId}-label"
      class="toggle-label"
      class:toggle-label-disabled={disabled}
    >{label}</span>
  {/if}
</div>

<style>
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

  .toggle:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
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
    transform: translateX(
      calc(var(--toggle-width) - var(--toggle-knob-size) - calc(2 * var(--space-2xs)))
    );
  }

  .toggle-label {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text);
  }

  .toggle-label-disabled {
    color: var(--color-text-muted);
  }
</style>
