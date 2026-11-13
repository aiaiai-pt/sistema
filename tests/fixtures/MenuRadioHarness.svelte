<!-- Test harness: a Menu mixing plain items with radio items, some disabled. -->
<script>
  import Menu from '../../components/Menu.svelte';
  import MenuItem from '../../components/MenuItem.svelte';

  let { anchor, sort = 'name' } = $props();
  let open = $state(true);
</script>

<Menu bind:open {anchor}>
  <MenuItem>Edit</MenuItem>
  <MenuItem role="menuitemradio" checked={sort === 'name'}>Name</MenuItem>
  <MenuItem role="menuitemradio" disabled checked={sort === 'size'}>Size</MenuItem>
  <button role="menuitemradio" aria-checked="false" disabled tabindex="-1">Kind</button>
  <MenuItem role="menuitemradio" checked={sort === 'date'}>Date</MenuItem>
  <MenuItem role="menuitemcheckbox" checked>Show hidden</MenuItem>
  <MenuItem disabled>Archive</MenuItem>
</Menu>
