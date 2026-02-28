<!--
  @component Separator

  Visual divider between content sections.
  Consumes --separator-* tokens from components.css.

  @example Horizontal
  <Separator />

  @example Vertical (inside a flex row)
  <Separator orientation="vertical" />
-->
<script>
  let {
    /** @type {'horizontal' | 'vertical'} */
    orientation = 'horizontal',
    /** @type {boolean} */
    decorative = true,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();
</script>

<div
  role={decorative ? 'none' : 'separator'}
  aria-orientation={!decorative ? /** @type {'horizontal' | 'vertical'} */ (orientation) : undefined}
  class="separator separator-{orientation} {className}"
  {...rest}
></div>

<style>
  .separator {
    flex-shrink: 0;
    background: var(--separator-color);
  }

  .separator-horizontal {
    height: var(--separator-thickness);
    width: 100%;
  }

  .separator-vertical {
    width: var(--separator-thickness);
    height: 100%;
  }
</style>
