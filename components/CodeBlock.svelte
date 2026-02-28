<!--
  @component CodeBlock

  Formatted code display with optional line numbers.
  Consumes --code-* tokens from components.css.

  Syntax highlighting is the consumer's responsibility (Prism, Shiki, etc).
  This component handles layout, line numbers, and copy.

  @example
  <CodeBlock code="SELECT * FROM users WHERE active = true;" language="sql" />

  @example Without line numbers
  <CodeBlock code="pip install pandas" lineNumbers={false} />

  @example With highlighted HTML (pre-highlighted by consumer)
  <CodeBlock language="python" lineNumbers>
    {#snippet content()}
      <span class="token keyword">def</span> <span class="token function">main</span>():
    {/snippet}
  </CodeBlock>
-->
<script>
  let {
    /** @type {string | undefined} */
    code = undefined,
    /** @type {string | undefined} */
    language = undefined,
    /** @type {boolean} */
    lineNumbers = true,
    /** @type {boolean} */
    copyable = true,
    /** @type {string} */
    class: className = '',
    /** @type {import('svelte').Snippet | undefined} */
    content = undefined,
    ...rest
  } = $props();

  let copied = $state(false);

  const lines = $derived(code?.split('\n') ?? []);

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    } catch {
      // Clipboard API not available
    }
  }
</script>

<div
  class="code-block {className}"
  data-language={language}
  {...rest}
>
  {#if copyable && code}
    <button
      class="code-copy"
      onclick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      <span class="code-copy-label">
        {copied ? 'COPIED' : 'COPY'}
      </span>
    </button>
  {/if}

  <div class="code-scroll">
    {#if content}
      <!-- Pre-highlighted content via snippet -->
      <pre class="code-pre"><code>{@render content()}</code></pre>
    {:else if code}
      <!-- Plain text with optional line numbers -->
      <table class="code-table" role="presentation">
        <tbody>
          {#each lines as line, i}
            <tr class="code-line">
              {#if lineNumbers}
                <td class="code-line-number" aria-hidden="true">{i + 1}</td>
              {/if}
              <td class="code-line-content">{line || '\u00A0'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .code-block {
    position: relative;
    background: var(--code-bg);
    border: var(--code-border);
    border-radius: var(--code-radius);
    overflow: hidden;
  }

  .code-scroll {
    overflow-x: auto;
  }

  .code-pre {
    margin: 0;
    padding: var(--code-padding);
    font-family: var(--code-font);
    font-size: var(--code-font-size);
    line-height: var(--code-line-height);
    color: var(--code-text);
  }

  .code-table {
    border-collapse: collapse;
    width: 100%;
    font-family: var(--code-font);
    font-size: var(--code-font-size);
    line-height: var(--code-line-height);
    color: var(--code-text);
  }

  .code-line {
    /* Hover for line selection */
  }

  .code-line-number {
    width: var(--code-line-number-width);
    padding: 0 var(--space-sm);
    text-align: right;
    color: var(--code-line-number-color);
    background: var(--code-gutter-bg);
    border-right: var(--code-gutter-border);
    user-select: none;
    vertical-align: top;
  }

  .code-line-content {
    padding: 0 var(--code-padding);
    white-space: pre;
  }

  /* First and last rows get vertical padding */
  .code-table tbody tr:first-child .code-line-number,
  .code-table tbody tr:first-child .code-line-content {
    padding-top: var(--code-padding);
  }

  .code-table tbody tr:last-child .code-line-number,
  .code-table tbody tr:last-child .code-line-content {
    padding-bottom: var(--code-padding);
  }

  /* ─── Copy button ─── */
  .code-copy {
    all: unset;
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    cursor: pointer;
    z-index: 1;
    padding: var(--space-2xs) var(--space-sm);
    border-radius: var(--radius-sm);
    background: var(--code-bg);
    border: var(--code-border);
    transition: all var(--duration-instant) var(--easing-default);
  }

  .code-copy:hover {
    background: var(--color-surface-tertiary);
  }

  .code-copy:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .code-copy-label {
    font-family: var(--type-label-font);
    font-size: var(--type-caption-size);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-text-secondary);
  }
</style>
