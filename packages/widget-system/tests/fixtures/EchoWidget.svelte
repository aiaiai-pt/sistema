<!--
  Test fixture — a minimal generic widget. Renders the render request it
  receives so a test can assert real DOM output (not a no-op). Carries no
  Atelier vocabulary; consumes the generic { data, props, locale } contract.
-->
<script lang="ts">
  import type { WidgetRenderRequest } from "../../src/core/index";
  let { data, props, locale }: WidgetRenderRequest = $props();
  const title = $derived(typeof props.title === "string" ? props.title : "");
</script>

<div class="echo" data-locale={locale}>
  <span class="echo-data">{JSON.stringify(data)}</span>
  <span class="echo-title">{title}</span>
</div>
