<!--
  Test fixture — a widget that throws during render, to exercise the renderer's
  error boundary (acceptance #4: optional-widget failure isolation).
-->
<script lang="ts">
  import type { WidgetRenderRequest } from "../../src/core/index.ts";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { data, props, locale }: WidgetRenderRequest = $props();
  const boom = $derived.by((): string => {
    throw new Error("widget boom");
  });
</script>

<div>{boom}</div>
