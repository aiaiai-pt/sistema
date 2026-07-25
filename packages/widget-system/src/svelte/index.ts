/**
 * @aiaiai-pt/widget-system/svelte
 *
 * Svelte integration for the widget registry — S1.3 (#58).
 *
 * `WidgetRenderer` receives its registry, match context, and observable state
 * explicitly as props (no module-global host state), resolves a widget from the
 * injected registry, and renders it — or a fail-closed status — over the
 * generic `WidgetState` model. It isolates an optional widget's runtime failure
 * with a Svelte error boundary and renders deterministically under SSR.
 *
 * This subpath imports Svelte; `/core` never does (the structural guard keeps
 * `/core` pure so a core-only consumer carries no svelte peer).
 */

export { default as WidgetRenderer } from "./WidgetRenderer.svelte";

// Re-export the state model so a Svelte consumer can build states without also
// importing `/core` directly.
export type {
  SlotImportance,
  StateDecision,
  WidgetState,
  WidgetStatus,
} from "../core/index.ts";
export { resolveWidgetState, stateRequest } from "../core/index.ts";
