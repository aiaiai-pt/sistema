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
    label = undefined,
    /** @type {string | undefined} */
    id = undefined,
    /** @type {((checked: boolean) => void) | undefined} */
    onchange = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  // No auto-generated id: the switch self-names via aria-label, so it needs no
  // id/labelledby plumbing. A module-counter fallback id (`toggle-N`) diverged
  // between SSR and client (server counter ≠ fresh client counter), an id that
  // could surface as a duplicate/parse error; an id is now emitted ONLY when a
  // consumer passes one.
  function handleClick() {
    if (!disabled) {
      checked = !checked;
      onchange?.(checked);
    }
  }
</script>

<div class="toggle-group {className}">
  <!--
    type="button" is critical: a default <button> inside a <form> is
    type="submit", so every Toggle click inside a form was silently
    submitting it. Declared BEFORE {...rest} so the consumer can still
    override (e.g. type="submit" if they really want submit semantics).
  -->
  <button
    {id}
    class="toggle"
    class:toggle-on={checked}
    class:toggle-disabled={disabled}
    {disabled}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    {...rest}
    onclick={handleClick}
  >
    <span class="toggle-knob"></span>
  </button>
  {#if label}
    <!--
      The switch now names itself directly via aria-label (was aria-labelledby →
      this span). Stricter ACT accessible-name engines (QualWeb/AccessMonitor)
      did not credit a name referenced through a role="none" target and read the
      switch as nameless; a direct aria-label is unambiguous. This span is the
      VISIBLE label only — role="none" keeps it out of the a11y tree so the name
      isn't announced twice. Click still toggles (sighted affordance); the button
      stays the keyboard/AT target.
    -->
    <span
      class="toggle-label"
      class:toggle-label-disabled={disabled}
      onclick={handleClick}
      role="none"
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
    cursor: pointer;
  }

  .toggle-label-disabled {
    color: var(--color-text-muted);
  }
</style>
