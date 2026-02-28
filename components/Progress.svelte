<!--
  @component Progress

  Determinate or indeterminate progress bar.
  Consumes --progress-* tokens from components.css.

  @example Determinate
  <Progress value={65} />

  @example Indeterminate
  <Progress indeterminate />
-->
<script>
  let {
    /** @type {number} */
    value = 0,
    /** @type {number} */
    max = 100,
    /** @type {boolean} */
    indeterminate = false,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const percentage = $derived(Math.min(Math.max((value / max) * 100, 0), 100));
</script>

<div
  class="progress {className}"
  class:progress-indeterminate={indeterminate}
  role="progressbar"
  aria-valuenow={indeterminate ? undefined : value}
  aria-valuemin={0}
  aria-valuemax={indeterminate ? undefined : max}
  {...rest}
>
  {#if indeterminate}
    <div class="progress-fill progress-fill-indeterminate"></div>
  {:else}
    <div class="progress-fill" style:width="{percentage}%"></div>
  {/if}
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

  .progress-fill-indeterminate {
    width: 40%;
    animation: progress-slide var(--progress-indeterminate-duration) var(--easing-linear) infinite;
  }

  @keyframes progress-slide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-fill-indeterminate {
      animation: none;
      width: 100%;
      opacity: 0.5;
    }
  }
</style>
