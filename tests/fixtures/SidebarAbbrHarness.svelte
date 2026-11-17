<!-- Test harness: a Sidebar with SidebarItems exercising the abbr/label props. -->
<script>
  import Sidebar from '../../components/Sidebar.svelte';
  import SidebarItem from '../../components/SidebarItem.svelte';

  let { collapsed = false } = $props();
</script>

<Sidebar {collapsed}>
  <!-- Item with abbr + label, no icon -->
  <SidebarItem href="/cases" abbr="C" label="Cases" data-testid="item-abbr">
    Cases
  </SidebarItem>

  <!-- Item with icon (abbr should be ignored when icon present) -->
  <SidebarItem href="/dashboard" abbr="D" label="Dashboard" data-testid="item-icon">
    {#snippet icon()}<svg data-testid="icon-svg" viewBox="0 0 16 16"><rect width="16" height="16"/></svg>{/snippet}
    Dashboard
  </SidebarItem>

  <!-- Item with no abbr and no icon -->
  <SidebarItem href="/empty" data-testid="item-empty">
    Empty
  </SidebarItem>
</Sidebar>
