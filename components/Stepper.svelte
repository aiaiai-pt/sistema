<!--
  @component Stepper

  Horizontal step indicator for multi-step flows.
  Consumes --stepper-* tokens from components.css.

  @example
  <Stepper steps={[
    { label: 'Source', status: 'complete' },
    { label: 'Configure', status: 'active' },
    { label: 'Review', status: 'upcoming' },
  ]} />
-->
<script>
  /**
   * @typedef {'complete' | 'active' | 'upcoming'} StepStatus
   * @typedef {{ label: string, status: StepStatus }} Step
   */

  let {
    /** @type {Step[]} */
    steps = [],
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();
</script>

<nav class="stepper {className}" aria-label="Progress" {...rest}>
  {#each steps as step, i}
    {#if i > 0}
      <div
        class="stepper-line"
        class:stepper-line-complete={step.status === 'complete' || step.status === 'active'}
      ></div>
    {/if}

    <div class="stepper-step" aria-current={step.status === 'active' ? 'step' : undefined}>
      <div
        class="stepper-dot"
        class:stepper-dot-active={step.status === 'active'}
        class:stepper-dot-complete={step.status === 'complete'}
      >
        {#if step.status === 'complete'}
          <svg class="stepper-check" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else}
          <span class="stepper-number">{i + 1}</span>
        {/if}
      </div>

      <span
        class="stepper-label"
        class:stepper-label-active={step.status === 'active'}
        class:stepper-label-complete={step.status === 'complete'}
      >{step.label}</span>
    </div>
  {/each}
</nav>

<style>
  .stepper {
    display: flex;
    align-items: center;
    gap: var(--stepper-gap);
  }

  .stepper-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--stepper-gap);
    flex-shrink: 0;
  }

  .stepper-dot {
    width: var(--stepper-dot-size);
    height: var(--stepper-dot-size);
    border-radius: var(--radius-circle);
    background: var(--stepper-dot-bg);
    border: var(--stepper-dot-border);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--stepper-transition);
  }

  .stepper-dot-active {
    background: var(--stepper-active-bg);
    color: var(--stepper-active-color);
  }

  .stepper-dot-complete {
    background: var(--stepper-complete-bg);
    color: var(--stepper-complete-color);
  }

  .stepper-number {
    font-family: var(--stepper-dot-font);
    font-size: var(--stepper-dot-size-text);
    letter-spacing: var(--stepper-dot-tracking);
    color: var(--stepper-dot-color);
  }

  .stepper-dot-active .stepper-number {
    color: var(--stepper-active-color);
  }

  .stepper-check {
    width: var(--icon-size-xs);
    height: var(--icon-size-xs);
  }

  .stepper-label {
    font-family: var(--stepper-label-font);
    font-size: var(--stepper-label-size);
    letter-spacing: var(--stepper-label-tracking);
    color: var(--stepper-label-color);
    white-space: nowrap;
  }

  .stepper-label-active {
    color: var(--stepper-label-active-color);
  }

  .stepper-label-complete {
    color: var(--stepper-label-active-color);
  }

  .stepper-line {
    flex: 1;
    height: var(--stepper-line-width);
    background: var(--stepper-line-color);
    min-width: 24px;
    margin-bottom: calc(var(--stepper-label-size) + var(--stepper-gap));
  }

  .stepper-line-complete {
    background: var(--stepper-complete-bg);
  }
</style>
