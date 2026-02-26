<!--
  @component Progress

  Determinate progress bar.
  Consumes --progress-* tokens from components.css.

  @example
  <Progress value={65} />

  @example With custom max
  <Progress value={3} max={10} />
-->
<script>
  let {
    /** @type {number} */
    value = 0,
    /** @type {number} */
    max = 100,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const percentage = $derived(Math.min(Math.max((value / max) * 100, 0), 100));
</script>

<div
  class="progress {className}"
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  {...rest}
>
  <div class="progress-fill" style:width="{percentage}%"></div>
</div>

<style>
  .progress {
    height: var(--progress-height);
    background: var(--progress-bg);
    border-radius: var(--progress-radius);
    overflow: hidden;
    width: 100%;
  }

  .progress-fill {
    height: 100%;
    background: var(--progress-fill);
    border-radius: var(--progress-radius);
    transition: width var(--progress-transition);
  }
</style>
