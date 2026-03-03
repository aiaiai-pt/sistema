<!--
  @component CodeEditor

  Editable code editor wrapping CodeMirror 6.
  Styled from --code-* tokens to match CodeBlock appearance.
  Requires @codemirror/* peer dependencies installed by the consumer.

  @example SQL editor
  <CodeEditor bind:value={sql} language="sql" />

  @example Readonly Python
  <CodeEditor value={code} readonly language="python" minLines={10} />

  @example Empty with placeholder
  <CodeEditor language="sql" placeholder="Enter your query..." />
-->
<script>
  import { onMount } from 'svelte';
  import { EditorView, keymap, placeholder as phExtension, lineNumbers as lnExtension } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
  import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
  import { sql as sqlLang } from '@codemirror/lang-sql';
  import { python as pythonLang } from '@codemirror/lang-python';
  import { json as jsonLang } from '@codemirror/lang-json';

  /** @type {{ value?: string, language?: string, readonly?: boolean, placeholder?: string, lineNumbers?: boolean, minLines?: number, maxLines?: number, class?: string }} */
  let {
    /** @type {string} */
    value = $bindable(''),
    /** @type {string} */
    language = 'sql',
    /** @type {boolean} */
    readonly = false,
    /** @type {string} */
    placeholder = '',
    /** @type {boolean} */
    lineNumbers = true,
    /** @type {number} */
    minLines = 5,
    /** @type {number} */
    maxLines = 20,
    /** @type {string} */
    class: className = '',
  } = $props();

  /** @type {HTMLDivElement} */
  let container;
  /** @type {EditorView | null} */
  let view = null;
  let internalUpdate = false;

  /**
   * Get the language extension for the given language name.
   * @param {string} lang
   */
  function getLanguageExtension(lang) {
    switch (lang) {
      case 'sql': return sqlLang();
      case 'python': return pythonLang();
      case 'json': return jsonLang();
      default: return [];
    }
  }

  /**
   * Build a CM6 theme from CSS custom properties on the container element.
   * @param {HTMLElement} el
   * @param {number} minH
   * @param {number} maxH
   */
  function buildThemeFromTokens(el, minH, maxH) {
    const s = getComputedStyle(el);
    const get = (/** @type {string} */ prop) => s.getPropertyValue(prop).trim();

    const bg = get('--code-bg') || '#f0ece8';
    const text = get('--code-text') || '#1a1a1a';
    const font = get('--code-font') || 'monospace';
    const fontSize = get('--code-font-size') || '14px';
    const lineHeight = get('--code-line-height') || '1.6';
    const gutterBg = get('--code-gutter-bg') || '#e8e4e0';
    const gutterBorder = get('--code-gutter-border');
    const lineNumColor = get('--code-line-number-color') || '#999';
    const selectionBg = get('--code-selection-bg') || 'rgba(234,121,42,0.15)';
    const cursorColor = get('--code-cursor-color') || '#ea792a';

    return EditorView.theme({
      '&': {
        backgroundColor: bg,
        color: text,
        fontFamily: font,
        fontSize,
        lineHeight,
        minHeight: `calc(${lineHeight} * ${fontSize} * ${minH})`,
        maxHeight: `calc(${lineHeight} * ${fontSize} * ${maxH})`,
      },
      '&.cm-focused': {
        outline: 'none',
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: font,
      },
      '.cm-content': {
        caretColor: cursorColor,
        fontFamily: font,
        padding: '0',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: cursorColor,
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
        backgroundColor: selectionBg,
      },
      '.cm-gutters': {
        backgroundColor: gutterBg,
        borderRight: gutterBorder || '1px solid #ddd',
        color: lineNumColor,
      },
      '.cm-lineNumbers .cm-gutterElement': {
        padding: '0 8px 0 4px',
        minWidth: '32px',
      },
      '.cm-activeLine': {
        backgroundColor: 'transparent',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
      },
      '.cm-placeholder': {
        color: lineNumColor,
        fontStyle: 'italic',
      },
    });
  }

  onMount(() => {
    const extensions = [
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      syntaxHighlighting(defaultHighlightStyle),
      buildThemeFromTokens(container, minLines, maxLines),
      EditorView.updateListener.of((/** @type {import('@codemirror/view').ViewUpdate} */ update) => {
        if (update.docChanged) {
          internalUpdate = true;
          value = update.state.doc.toString();
          internalUpdate = false;
        }
      }),
    ];

    if (lineNumbers) {
      extensions.push(lnExtension());
    }

    if (placeholder) {
      extensions.push(phExtension(placeholder));
    }

    if (readonly) {
      extensions.push(EditorState.readOnly.of(true));
      extensions.push(EditorView.editable.of(false));
    }

    const langExt = getLanguageExtension(language);
    if (langExt) {
      extensions.push(langExt);
    }

    view = new EditorView({
      state: EditorState.create({ doc: /** @type {string} */ (value), extensions }),
      parent: container,
    });

    return () => {
      view?.destroy();
      view = null;
    };
  });

  // Sync external value changes into the editor
  $effect(() => {
    if (view && !internalUpdate) {
      const current = view.state.doc.toString();
      if (value !== current) {
        view.dispatch({
          changes: { from: 0, to: current.length, insert: /** @type {string} */ (value) },
        });
      }
    }
  });
</script>

<div
  class="code-editor {className}"
  class:code-editor--readonly={readonly}
  bind:this={container}
  data-language={language}
></div>

<style>
  .code-editor {
    border: var(--code-border);
    border-radius: var(--code-radius);
    overflow: hidden;
    background: var(--code-bg);
    transition: box-shadow var(--duration-instant) var(--easing-default);
  }

  .code-editor:focus-within:not(.code-editor--readonly) {
    box-shadow:
      0 0 0 var(--focus-ring-offset) var(--color-surface),
      0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width)) var(--focus-ring-color);
  }

  /* CM6 places its own wrapper — let it fill the container */
  .code-editor :global(.cm-editor) {
    border-radius: var(--code-radius);
  }
</style>
