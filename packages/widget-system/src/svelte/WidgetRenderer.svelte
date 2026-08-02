<!--
  @component WidgetRenderer — the Svelte integration for the widget registry
  (S1.3 #58).

  Receives its registry, match context, and observable state EXPLICITLY as props
  — there is no module-global registry or host state, so two renderers (two
  hosts, two SSR requests, two tests) never observe each other. This is the
  Svelte half of the isolated-factory contract (D6); the pure half lives in
  `/core`.

  Responsibilities:
   1. Resolve the widget from the injected registry using the match context
      (selection input — kind/type only; no data).
   2. Decide, via the pure `resolveWidgetState`, whether to render the widget
      (optionally flagged stale) or a status affordance — fail-closed, so a
      structural slot never silently vanishes.
   3. Isolate an optional widget's runtime failure with `<svelte:boundary>`, so
      one throwing widget cannot take down the rest of a surface (acceptance
      #4). A structural slot surfaces a visible error on failure; an optional
      slot fails soft to nothing.

  SSR-safe: renders deterministically on the server. It touches no browser
  globals; the only client-only behaviour lives inside the mounted widgets'
  own effects (e.g. EChart lazy-loads echarts in an effect), never here.

  String-free (D9): every user-visible label is caller-supplied via `messages`.
  The package ships no translatable copy; a status with no supplied message
  still carries its ARIA role and `data-widget-state` token for assistive tech
  and tests.
-->
<script lang="ts">
  import type { Component } from "svelte";
  import type {
    WidgetMatchContext,
    WidgetRegistry,
    WidgetRenderRequest,
  } from "../core/index";
  import {
    resolveWidgetState,
    stateRequest,
    type SlotImportance,
    type WidgetState,
    type WidgetStatus,
  } from "../core/index";

  interface Props {
    /** The injected registry — created per host/request with `createRegistry`. */
    registry: WidgetRegistry<Component<WidgetRenderRequest>, WidgetMatchContext>;
    /** Selection input (kind/type). No data — the render request carries that. */
    context: WidgetMatchContext;
    /** The host-reported observable state for this slot. */
    state: WidgetState;
    /**
     * Fail-closed importance. `structural` slots surface every terminal status
     * visibly; `optional` slots fail soft to nothing. Defaults to `optional`.
     */
    importance?: SlotImportance;
    /**
     * Caller-supplied labels per status (D9 — the package ships no copy). A
     * status with no message still renders its role + data-widget-state token.
     */
    messages?: Partial<Record<WidgetStatus, string>>;
  }

  let {
    registry,
    context,
    state,
    importance = "optional",
    messages = {},
  }: Props = $props();

  // Selection is resolved from the registry — the authority on whether a widget
  // exists for this context (a host claiming `ready` with no registration is
  // corrected to `unsupported` by resolveWidgetState).
  const match = $derived(registry.resolve(context));
  const decision = $derived(
    resolveWidgetState(state.status, importance, match !== null),
  );
  const request = $derived(stateRequest(state));
</script>

{#if decision.render === "widget" && match && request}
  {@const Widget = match.payload}
  <div
    class="ws-widget"
    data-widget-state={decision.stale ? "stale" : "ready"}
    data-widget-key={match.key}
  >
    <svelte:boundary>
      <Widget data={request.data} props={request.props} locale={request.locale} />

      {#snippet failed(_error, _reset)}
        <!-- Optional-widget failure isolation (acceptance #4). A structural slot
             surfaces a visible error; an optional slot fails soft to nothing so
             one bad widget never breaks the surface. -->
        {#if importance === "structural"}
          <div role="alert" data-widget-state="error">{messages.error ?? ""}</div>
        {/if}
      {/snippet}
    </svelte:boundary>

    {#if decision.stale}
      <p class="ws-stale" role="status" data-widget-stale>{messages.stale ?? ""}</p>
    {/if}
  </div>
{:else if decision.visible}
  {@const status = decision.effectiveStatus}
  <div
    class="ws-status"
    data-widget-state={status}
    role={status === "loading" ? "status" : "alert"}
    aria-busy={status === "loading" ? "true" : undefined}
  >
    {messages[status] ?? ""}
  </div>
{/if}

<style>
  .ws-widget {
    display: contents;
  }

  .ws-stale {
    margin: 0;
    font-size: var(--type-caption-size);
    color: var(--color-text-muted);
  }

  .ws-status {
    display: flex;
    align-items: center;
    justify-content: center;
    min-block-size: var(--space-2xl);
    padding: var(--space-md);
    font-size: var(--type-body-sm-size);
    color: var(--color-text-muted);
  }

  .ws-status[data-widget-state="error"],
  .ws-status[data-widget-state="unauthorized"],
  .ws-status[data-widget-state="timeout"] {
    color: var(--color-destructive);
  }
</style>
