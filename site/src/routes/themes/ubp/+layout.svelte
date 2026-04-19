<script lang="ts">
	import { onMount } from 'svelte';

	let { children } = $props();

	// Force data-theme on <html>, not on a nested div. The aiaiai root
	// layout's sidebar is a sibling of this route's content, so a scoped
	// wrapper wouldn't theme it — the shell would leak the light theme.
	// Restore the user's prior theme on leave so the switcher isn't sticky.
	onMount(() => {
		const root = document.documentElement;
		const prev = root.getAttribute('data-theme') ?? 'aiaiai';
		root.setAttribute('data-theme', 'ubp');
		return () => {
			root.setAttribute('data-theme', prev);
		};
	});
</script>

{@render children()}
