<!--
  @component MapPopup

  Tooltip/popup anchored to a map coordinate via OL Overlay.
  Styled with DS card tokens. Used internally by map components
  but can be composed directly for custom popups.
  Consumes --map-popup-* tokens from components.css.

  @example Inside MapCluster
  <MapCluster {markers} let:popup>
    <MapPopup>{popup.label}</MapPopup>
  </MapCluster>
-->
<script>
  let {
    /** @type {boolean} */
    visible = false,
    /** @type {import('svelte').Snippet | undefined} */
    children = undefined,
    /** @type {(() => void) | undefined} */
    onclose = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();
</script>

{#if visible}
  <div class="map-popup {className}" {...rest}>
    <div class="map-popup-content">
      {#if children}{@render children()}{/if}
    </div>
    {#if onclose}
      <button class="map-popup-close" onclick={onclose} aria-label="Close">
        <svg viewBox="0 0 256 256" aria-hidden="true">
          <line x1="80" y1="80" x2="176" y2="176" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
          <line x1="176" y1="80" x2="80" y2="176" stroke="currentColor" stroke-width="16" stroke-linecap="round" />
        </svg>
      </button>
    {/if}
    <div class="map-popup-arrow" aria-hidden="true"></div>
  </div>
{/if}

<style>
  .map-popup {
    position: relative;
    background: var(--map-popup-bg);
    border: var(--map-popup-border);
    border-radius: var(--map-popup-radius);
    box-shadow: var(--map-popup-shadow);
    padding: var(--map-popup-padding);
    max-width: var(--map-popup-max-width);
    width: max-content;
  }

  .map-popup-content {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text);
    line-height: var(--type-body-sm-line-height);
  }

  .map-popup-close {
    position: absolute;
    top: var(--space-2xs);
    right: var(--space-2xs);
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
  }

  .map-popup-close:hover {
    background: var(--color-surface-secondary);
    color: var(--color-text);
  }

  .map-popup-close svg {
    width: var(--icon-size-xs);
    height: var(--icon-size-xs);
  }

  .map-popup-arrow {
    position: absolute;
    bottom: calc(-1 * var(--map-popup-arrow-size));
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: var(--map-popup-arrow-size) solid transparent;
    border-right: var(--map-popup-arrow-size) solid transparent;
    border-top: var(--map-popup-arrow-size) solid var(--map-popup-bg);
  }
</style>
