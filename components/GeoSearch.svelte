<!--
  @component GeoSearch

  Bidirectional geocoding input powered by Nominatim (OpenStreetMap).
  Forward: type address → get coordinates.
  Reverse: set `coords` prop → shows resolved address.
  Consumes --combobox-* tokens from components.css.

  @example Forward geocoding
  <GeoSearch onlocation={(lon, lat) => console.log(lon, lat)} />

  @example Bidirectional (MapPicker sets coords on click → address shows)
  <GeoSearch
    bind:coords={pickedCoords}
    onlocation={(lon, lat) => { mapCenter = [lon, lat]; }}
  />

  @example With viewbox bias
  <GeoSearch
    viewbox={[-9.5, 38.5, -8.8, 39.0]}
    onlocation={(lon, lat) => console.log(lon, lat)}
  />
-->
<script>
  import Combobox from './Combobox.svelte';

  let {
    /** @type {string | undefined} */
    label = undefined,
    /** @type {string} */
    placeholder = 'Search address or place...',
    /** @type {boolean} */
    disabled = false,
    /** @type {string | undefined} */
    error = undefined,
    /** @type {string | undefined} */
    help = undefined,
    /** @type {string} */
    size = 'md',
    /** @type {string} — Nominatim-compatible search endpoint */
    providerUrl = 'https://nominatim.openstreetmap.org/search',
    /** @type {[number, number, number, number] | undefined} — [minLon, minLat, maxLon, maxLat] bias */
    viewbox = undefined,
    /** @type {((lon: number, lat: number, item: { label: string, value: string }) => void) | undefined} */
    onlocation = undefined,
    /** @type {[number, number] | undefined} — set externally to reverse-geocode and show address */
    coords = $bindable(undefined),
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  /** @type {import('./Combobox.svelte').ComboboxItem[]} */
  let items = $state([]);
  let loading = $state(false);
  let value = $state('');
  let debounceTimer = 0;
  let lastReversed = '';

  // Reverse geocode when coords change (map click or initial load)
  $effect(() => {
    if (!coords) return;
    const key = `${coords[0]},${coords[1]}`;
    if (key === lastReversed) return;
    lastReversed = key;
    reverseGeocode(coords[0], coords[1]);
  });

  async function reverseGeocode(lon, lat) {
    loading = true;
    try {
      const base = providerUrl.replace('/search', '/reverse');
      const resp = await fetch(`${base}?lon=${lon}&lat=${lat}&format=json`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!resp.ok) return;
      const result = await resp.json();
      if (result.display_name) {
        value = `${lon},${lat}`;
        items = [{ value: `${lon},${lat}`, label: result.display_name, description: result.type?.replace(/_/g, ' ') ?? '' }];
      }
    } catch {
      // Reverse geocoding failed — leave search bar as-is
    } finally {
      loading = false;
    }
  }

  /** Nominatim rate limit: 1 req/sec. Debounce at 400ms. */
  function handleSearch(query) {
    clearTimeout(debounceTimer);
    if (!query || query.length < 3) {
      items = [];
      return;
    }
    loading = true;
    debounceTimer = setTimeout(() => fetchResults(query), 400);
  }

  async function fetchResults(query) {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '6',
        addressdetails: '1',
      });
      if (viewbox) {
        params.set('viewbox', viewbox.join(','));
        params.set('bounded', '0'); // bias, not restrict
      }
      const resp = await fetch(`${providerUrl}?${params}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!resp.ok) {
        items = [];
        return;
      }
      /** @type {Array<{lat: string, lon: string, display_name: string, type: string, class: string}>} */
      const results = await resp.json();
      items = results.map((r) => ({
        value: `${r.lon},${r.lat}`,
        label: r.display_name,
        description: r.type !== 'yes' ? r.type.replace(/_/g, ' ') : r.class.replace(/_/g, ' '),
      }));
    } catch {
      items = [];
    } finally {
      loading = false;
    }
  }

  function handleChange(val) {
    if (!val) return;
    const [lonStr, latStr] = val.split(',');
    const lon = parseFloat(lonStr);
    const lat = parseFloat(latStr);
    if (!Number.isNaN(lon) && !Number.isNaN(lat) && onlocation) {
      const selectedItem = items.find((i) => i.value === val);
      onlocation(lon, lat, selectedItem ?? { label: '', value: val });
    }
  }
</script>

<Combobox
  {label}
  {placeholder}
  {disabled}
  {error}
  {help}
  {size}
  {items}
  {loading}
  bind:value
  onsearch={handleSearch}
  onchange={handleChange}
  class={className}
  {...rest}
/>
