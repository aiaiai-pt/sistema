<!--
  @component EntryStreamWidget — a typed-entry stream with a composer.

  The generic face behind any threaded record: a conversation, an audit trail, an
  investigation's record. Entries arrive already resolved and are rendered by
  their DECLARED kind — the widget holds no vocabulary of its own.

  HOW KINDS RENDER, AND WHY THAT IS DATA. `props.presentation` maps each declared
  kind code to a generic variant:
      bubble — an authored utterance, attributable to someone
      prose  — an extended response that carries citations and a seal
      quiet  — a machine-scribed line: present, readable, visually recessive
  The kind codes themselves (question / answer / system, or whatever a deployment
  declares) never appear here. This is the same law the evidence seal follows: the
  words are declared vocabulary rows, so re-wording or widening the set is a
  declaration change, not a package release.

  An entry whose kind has NO declared presentation throws. Falling back to a
  default would silently render a machine-scribed system line as an authored
  utterance — mis-attributing a statement to a person, which is the worst
  available failure on a record surface.

  ONE LIVE REGION. This stream carries `role="log"` with `aria-live="off"`. A log
  announces by default, and a host that already owns an announcement region would
  then get every entry read twice. Announcing new entries is the HOST's job,
  through its own single live region. `aria-live` is not configurable here on
  purpose.

  IT NEVER FETCHES. Citations, composer submission and paging are CALLBACKS.

  String-free (D9): every visible word — the composer's affordances, the reading
  controls, the timestamps — is caller-supplied and already formatted.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import SealChip from "@aiaiai-pt/design-system/components/SealChip.svelte";
  import type { WidgetRenderRequest } from "../core/index.ts";

  interface SealTerm {
    value: string;
    label: string;
    tone?: "positive" | "info" | "caution" | "neutral";
  }

  interface ResolvedSeal {
    evidence: SealTerm;
    evidenceClass?: string;
    probability?: SealTerm;
    stale?: boolean;
  }

  /** One citation chip. `ref` is opaque and echoed back untouched. */
  interface Citation {
    label: string;
    ref?: unknown;
  }

  /** One resolved entry. No transport, no schema, no product vocabulary. */
  interface Entry {
    id?: string;
    /** Declared kind CODE — resolved against props.presentation. */
    kind: string;
    /** Declared agent term, already resolved to a label by the host. */
    agent?: SealTerm;
    /** Declared entry_type term, already resolved. */
    entry_type?: SealTerm;
    /** Already formatted for display by the host — never formatted here. */
    at?: string;
    body?: string;
    citations?: Citation[];
    seal?: ResolvedSeal;
  }

  /** How one declared kind presents. Generic variants, never kind names. */
  interface KindPresentation {
    variant: "bubble" | "prose" | "quiet";
    /** Which side an authored utterance sits on. Presentation only. */
    align?: "start" | "end";
    /** Caller-supplied accessible prefix, e.g. «pergunta». */
    label?: string;
  }

  interface Props extends WidgetRenderRequest {
    /** Composer slot — direct composition only; dispatch cannot carry snippets. */
    composer?: Snippet;
  }

  let { data, props, composer }: Props = $props();

  const entries = $derived.by((): Entry[] => {
    const list = (data as { entries?: unknown } | null)?.entries;
    return Array.isArray(list) ? (list as Entry[]) : [];
  });

  const presentation = $derived(
    (props?.presentation ?? {}) as Record<string, KindPresentation>,
  );

  const VARIANTS = ["bubble", "prose", "quiet"];

  /**
   * BOUNDARY GUARD — every rendered kind must be declared.
   *
   * The failure this prevents is not a missing style: an undeclared kind falling
   * back to `bubble` would present a machine-scribed line as something a person
   * said. On a record that is read as evidence, mis-attribution is worse than
   * refusing to draw.
   */
  const assertKinds = (list: Entry[], map: Record<string, KindPresentation>) => {
    for (const entry of list) {
      const declared = map?.[entry.kind];
      if (!declared) {
        throw new Error(
          `[EntryStreamWidget] Entry kind ${JSON.stringify(entry.kind)} has no ` +
            "declared presentation. Pass props.presentation[kind] = { variant }. " +
            "This widget enumerates no kinds; an undeclared kind must not fall " +
            "back, because a machine line rendered as an utterance mis-attributes it.",
        );
      }
      if (!VARIANTS.includes(declared.variant)) {
        throw new Error(
          `[EntryStreamWidget] Unknown variant ${JSON.stringify(declared.variant)} ` +
            `for kind ${JSON.stringify(entry.kind)}. Variants are ${VARIANTS.join(" | ")}.`,
        );
      }
    }
  };

  assertKinds(entries, presentation);
  $effect(() => assertKinds(entries, presentation));

  const onCitation = $derived(
    typeof props?.onCitation === "function"
      ? (props.onCitation as (ref: unknown) => void)
      : undefined,
  );

  /** Caller copy for the reading affordances. Absent → the control is omitted. */
  const toStartLabel = $derived(
    typeof props?.toStartLabel === "string" ? props.toStartLabel : undefined,
  );
  const toEndLabel = $derived(
    typeof props?.toEndLabel === "string" ? props.toEndLabel : undefined,
  );
  const streamLabel = $derived(
    typeof props?.streamLabel === "string" ? props.streamLabel : undefined,
  );

  const streamId = $props.id();

  const focusEdge = (edge: "start" | "end") => {
    const root = document.getElementById(streamId);
    const items = root?.querySelectorAll<HTMLElement>(".entry-stream-entry");
    if (!items || items.length === 0) return;
    const target = edge === "start" ? items[0] : items[items.length - 1];
    target.focus();
  };
</script>

<div class="entry-stream">
  <!--
    Forward/backward reading affordance: keyboard-reachable jumps to either end
    of the stream, for a reader who does not want to arrow through a long record.
  -->
  {#if toStartLabel || toEndLabel}
    <div class="entry-stream-nav">
      {#if toStartLabel}
        <button type="button" class="entry-stream-jump" onclick={() => focusEdge("start")}
          >{toStartLabel}</button
        >
      {/if}
      {#if toEndLabel}
        <button type="button" class="entry-stream-jump" onclick={() => focusEdge("end")}
          >{toEndLabel}</button
        >
      {/if}
    </div>
  {/if}

  <!--
    role=log with aria-live OFF. The host owns the one live region; a second one
    here would announce every entry twice.
  -->
  <ol
    id={streamId}
    class="entry-stream-list"
    role="log"
    aria-live="off"
    aria-label={streamLabel}
  >
    {#each entries as entry, i (entry.id ?? i)}
      {@const p = presentation[entry.kind]}
      <li
        class="entry-stream-entry entry-stream-{p.variant} entry-stream-align-{p.align ??
          'start'}"
        tabindex="-1"
        data-kind={entry.kind}
      >
        <div class="entry-stream-meta">
          <!-- Caller-supplied accessible prefix; visually part of the meta line. -->
          {#if p.label}<span class="entry-stream-kind-label">{p.label}</span>{/if}
          {#if entry.agent}<span class="entry-stream-agent">{entry.agent.label}</span>{/if}
          {#if entry.entry_type}<span class="entry-stream-type"
              >{entry.entry_type.label}</span
            >{/if}
          {#if entry.at}<span class="entry-stream-at">{entry.at}</span>{/if}
        </div>

        {#if entry.body}
          {#if entry.seal}
            <!-- A sealed body: the seal rides the statement, not the styling. -->
            <SealChip
              class="entry-stream-body"
              value={entry.body}
              evidence={entry.seal.evidence}
              probability={entry.seal.probability}
              stale={entry.seal.stale ?? false}
              whyLabel={typeof props?.whyLabel === "string" ? props.whyLabel : undefined}
              closeLabel={typeof props?.closeLabel === "string"
                ? props.closeLabel
                : undefined}
              staleLabel={typeof props?.staleLabel === "string"
                ? props.staleLabel
                : undefined}
            />
          {:else}
            <p class="entry-stream-body">{entry.body}</p>
          {/if}
        {/if}

        {#if entry.citations && entry.citations.length > 0}
          <ul class="entry-stream-citations">
            {#each entry.citations as citation, c (citation.ref ?? c)}
              <li>
                {#if onCitation}
                  <button
                    type="button"
                    class="entry-stream-citation entry-stream-citation-action"
                    onclick={() => onCitation?.(citation.ref)}>{citation.label}</button
                  >
                {:else}
                  <span class="entry-stream-citation">{citation.label}</span>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ol>

  {#if composer}
    <div class="entry-stream-composer">{@render composer()}</div>
  {/if}
</div>

<style>
  .entry-stream {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .entry-stream-nav {
    display: flex;
    gap: var(--space-sm);
  }

  .entry-stream-jump,
  .entry-stream-citation-action {
    padding: 0;
    border: none;
    background: none;
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-accent);
    cursor: pointer;
  }

  .entry-stream-jump:focus-visible,
  .entry-stream-citation-action:focus-visible,
  .entry-stream-entry:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }

  .entry-stream-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .entry-stream-entry {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    max-width: 68ch;
  }

  .entry-stream-align-end {
    align-self: flex-end;
  }

  .entry-stream-meta {
    display: flex;
    align-items: baseline;
    gap: var(--space-xs);
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }

  .entry-stream-kind-label,
  .entry-stream-agent {
    font-family: var(--type-overline-font);
    font-size: var(--type-overline-size);
    letter-spacing: var(--type-overline-tracking);
    text-transform: uppercase;
  }

  .entry-stream-at {
    font-family: var(--type-data-font);
  }

  .entry-stream-body {
    margin: 0;
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    line-height: var(--type-body-sm-leading);
    color: var(--color-text);
  }

  /* bubble — an authored utterance, visually enclosed and attributable. */
  .entry-stream-bubble {
    padding: var(--space-xs) var(--space-sm);
    border: var(--elevation-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-secondary);
  }

  /* prose — an extended response; open, wider measure, carries citations. */
  .entry-stream-prose {
    padding: var(--space-xs) 0;
  }

  /*
   * quiet — machine-scribed. Recessive but never hidden: a system line is part
   * of the record, so it stays readable rather than becoming decoration.
   */
  .entry-stream-quiet {
    padding: var(--space-2xs) 0;
    border-left: var(--elevation-border);
    padding-left: var(--space-sm);
  }

  .entry-stream-quiet .entry-stream-body {
    font-family: var(--type-caption-font);
    font-size: var(--type-caption-size);
    color: var(--color-text-secondary);
  }

  .entry-stream-citations {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .entry-stream-citation {
    display: inline-flex;
    align-items: center;
    font-family: var(--badge-font);
    font-size: var(--badge-size);
    letter-spacing: var(--badge-tracking);
    border-radius: var(--badge-radius);
    padding: var(--badge-padding-y) var(--badge-padding-x);
    background: var(--badge-neutral-bg);
    color: var(--badge-neutral-text);
    line-height: 1;
  }

  .entry-stream-composer {
    display: flex;
    flex-direction: column;
  }
</style>
