<!--
  @component Skeleton

  Loading placeholder with shimmer animation.
  Consumes --skeleton-* tokens from components.css.

  @example Text line
  <Skeleton width="80%" height="16px" />

  @example Circle (avatar)
  <Skeleton width="40px" height="40px" circle />

  @example Card
  <Skeleton width="100%" height="120px" radius="var(--radius-md)" />
-->
<script>
  let {
    /** @type {string} */
    width = '100%',
    /** @type {string} */
    height = '16px',
    /** @type {boolean} */
    circle = false,
    /** @type {string | undefined} */
    radius,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  const borderRadius = $derived(circle
    ? 'var(--radius-circle)'
    : radius ?? 'var(--skeleton-radius)');
</script>

<div
  class="skeleton {className}"
  style:width={width}
  style:height={height}
  style:border-radius={borderRadius}
  aria-hidden="true"
  {...rest}
></div>

<style>
  .skeleton {
    background: var(--skeleton-bg);
    position: relative;
    overflow: hidden;
  }

  .skeleton::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      var(--skeleton-shine),
      transparent
    );
    animation: shimmer var(--skeleton-duration) infinite;
  }

  @keyframes shimmer {
    100% {
      left: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton::after {
      animation: none;
    }
  }
</style>
