<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import MapDisplay from '$ui/MapDisplay.svelte';
	import MapPicker from '$ui/MapPicker.svelte';
	import MapCluster from '$ui/MapCluster.svelte';
	import MapHeatmap from '$ui/MapHeatmap.svelte';
	import MapPopup from '$ui/MapPopup.svelte';
	import 'ol/ol.css';

	let pickedPoint = $state<[number, number] | undefined>(undefined);
	let boundaryPoint = $state<[number, number] | undefined>(undefined);
	let boundaryError = $state<string | undefined>(undefined);

	// Tenant boundary (#187) — square around the demo area.
	const demoBoundary = {
		type: 'Polygon',
		coordinates: [[
			[-9.165, 38.712], [-9.125, 38.712], [-9.125, 38.745], [-9.165, 38.745], [-9.165, 38.712],
		]],
	};

	// Overlay layers: inline GeoJSON (an entity feed would pass `url:` to
	// the platform's /{app}/public/layers/{id}/features endpoint instead).
	const demoLayers = [
		{
			id: 'green-spaces',
			type: 'geojson' as const,
			data: {
				type: 'FeatureCollection',
				features: [
					{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[
						[-9.158, 38.726], [-9.150, 38.726], [-9.150, 38.732], [-9.158, 38.732], [-9.158, 38.726],
					]] }, properties: {} },
				],
			},
			style: { fillColor: 'rgba(46,125,50,0.25)', strokeColor: '#2e7d32', strokeWidth: 2 },
		},
		{
			id: 'water-points',
			type: 'geojson' as const,
			data: {
				type: 'FeatureCollection',
				features: [
					{ type: 'Feature', geometry: { type: 'Point', coordinates: [-9.142, 38.728] }, properties: {} },
					{ type: 'Feature', geometry: { type: 'Point', coordinates: [-9.149, 38.734] }, properties: {} },
					{ type: 'Feature', geometry: { type: 'Point', coordinates: [-9.136, 38.724] }, properties: {} },
				],
			},
			// GeoStyler shape — what geolayers stores; mapped best-effort.
			style: { rules: [{ symbolizers: [{ kind: 'Mark', wellKnownName: 'circle', color: '#0277bd', radius: 6 }] }] },
		},
	];

	// Lisbon area markers
	const markers = [
		{ id: '1', lon: -9.139, lat: 38.722, label: 'Escola Básica Luís de Camões' },
		{ id: '2', lon: -9.150, lat: 38.737, label: 'Centro de Saúde Alameda' },
		{ id: '3', lon: -9.133, lat: 38.713, label: 'Biblioteca Municipal' },
		{ id: '4', lon: -9.145, lat: 38.748, label: 'Pavilhão Desportivo' },
		{ id: '5', lon: -9.160, lat: 38.728, label: 'Mercado Municipal' },
		{ id: '6', lon: -9.125, lat: 38.740, label: 'Parque Infantil Norte' },
		{ id: '7', lon: -9.172, lat: 38.715, label: 'Estação de Tratamento' },
		{ id: '8', lon: -9.148, lat: 38.705, label: 'Complexo Desportivo' },
		{ id: '9', lon: -9.135, lat: 38.750, label: 'Centro Cultural' },
		{ id: '10', lon: -9.165, lat: 38.742, label: 'Sede da Junta de Freguesia' },
		{ id: '11', lon: -9.142, lat: 38.718, label: 'Posto de Abastecimento' },
		{ id: '12', lon: -9.155, lat: 38.730, label: 'Centro de Dia' },
	];

	// Priced places: `pin` is drawn as the marker, `active` marks the chosen one.
	const pricedPlaces = [
		{ id: 'p1', lon: -9.1365, lat: 38.7139, label: 'Guesthouse in Baixa', pin: '€128' },
		{ id: 'p2', lon: -9.1302, lat: 38.7118, label: 'Rooms in Alfama', pin: '€96', active: true },
		{ id: 'p3', lon: -9.1446, lat: 38.7106, label: 'Hotel in Chiado', pin: '€214' },
		{ id: 'p4', lon: -9.1488, lat: 38.7203, label: 'Flat near Príncipe Real', pin: '€162' },
		{ id: 'p5', lon: -9.1418, lat: 38.7237, label: 'Hotel on Avenida', pin: '€188' },
	];

	// Heatmap points (occurrences)
	const heatPoints = [
		{ lon: -9.139, lat: 38.722, weight: 8 },
		{ lon: -9.140, lat: 38.723, weight: 6 },
		{ lon: -9.141, lat: 38.721, weight: 7 },
		{ lon: -9.150, lat: 38.737, weight: 3 },
		{ lon: -9.133, lat: 38.713, weight: 5 },
		{ lon: -9.145, lat: 38.748, weight: 2 },
		{ lon: -9.160, lat: 38.728, weight: 4 },
		{ lon: -9.125, lat: 38.740, weight: 1 },
		{ lon: -9.138, lat: 38.720, weight: 9 },
		{ lon: -9.142, lat: 38.724, weight: 5 },
		{ lon: -9.136, lat: 38.719, weight: 6 },
		{ lon: -9.152, lat: 38.735, weight: 3 },
		{ lon: -9.148, lat: 38.732, weight: 4 },
		{ lon: -9.155, lat: 38.738, weight: 2 },
	];

	const mapTokens = [
		'--map-radius: var(--radius-md)',
		'--map-border: var(--elevation-border)',
		'--map-marker-radius: var(--space-sm)',
		'--map-marker-fill: var(--color-accent)',
		'--map-marker-stroke: var(--color-surface)',
		'--map-cluster-radius: var(--space-md)',
		'--map-cluster-fill: var(--color-accent)',
		'--map-cluster-text-fill: var(--color-text-on-accent)',
		'--map-polygon-fill: color-mix(in srgb, var(--color-accent) 20%, transparent)',
		'--map-polygon-stroke: var(--color-accent)',
		'--map-pin-bg: var(--color-surface)',
		'--map-pin-text: var(--color-text)',
		'--map-pin-border-color: var(--color-border-strong)',
		'--map-pin-radius: var(--radius-pill)',
		'--map-pin-active-bg: var(--color-text)',
		'--map-pin-active-text: var(--color-surface)',
		'--map-tiles-muted-filter: grayscale(1) contrast(0.7) brightness(1.08)',
	];
</script>

<svelte:head>
	<title>Map — aiaiai Design System</title>
</svelte:head>

<PageHeader
	title="Map"
	description="OpenLayers map components for display, selection, clustering, and heatmap visualization. OSM tiles, WGS84 coordinates. All dynamically imported for SSR safety."
/>

<!-- MapDisplay -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">MapDisplay</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Read-only map for detail views. Shows a point marker or polygon. No interactions — purely visual.</p>

	<div class="map-demo-grid">
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">POINT MARKER</span>
			<MapDisplay center={[-9.139, 38.722]} zoom={15} marker={[-9.139, 38.722]} height="240px" />
		</div>
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">POLYGON</span>
			<MapDisplay
				center={[-9.145, 38.730]}
				zoom={14}
				polygon={[[-9.155, 38.735], [-9.135, 38.735], [-9.135, 38.725], [-9.155, 38.725], [-9.155, 38.735]]}
				height="240px"
			/>
		</div>
	</div>
</section>

<!-- MapPicker -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">MapPicker</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Interactive map for form fields. Click to place a point or draw a polygon. Follows Input patterns (label, help, error).</p>

	<div class="map-demo-grid">
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">POINT MODE</span>
			<MapPicker
				label="EQUIPMENT LOCATION"
				mode="point"
				center={[-9.139, 38.722]}
				zoom={14}
				bind:value={pickedPoint}
				help="Click on the map to place a marker."
				height="280px"
			/>
			{#if pickedPoint}
				<div style="margin-top: var(--space-xs);">
					<code class="type-data" style="font-size: var(--type-caption-size); color: var(--color-text-muted);">
						{pickedPoint[1].toFixed(6)}, {pickedPoint[0].toFixed(6)}
					</code>
				</div>
			{/if}
		</div>
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">POLYGON MODE</span>
			<MapPicker
				label="SERVICE AREA"
				mode="polygon"
				center={[-9.145, 38.730]}
				zoom={14}
				help="Click vertices to draw a polygon. Double-click to finish."
				height="280px"
			/>
		</div>
	</div>
</section>

<!-- Layers & boundary (#187) -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Layers & boundary</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Ordered GeoJSON overlays under the interactive layer — entity feeds, WFS GeoJSON, or inline data; styles are flat or GeoStyler (first rule). MapPicker additionally takes a <code>boundary</code> polygon rendered as a dashed outline, and signals <code>onoutofbounds</code> when a placed point leaves it — the pin still lands; blocking is the consumer's (and ultimately the server's) decision.</p>

	<div class="map-demo-grid">
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">MAPDISPLAY + LAYERS</span>
			<MapDisplay
				center={[-9.145, 38.728]}
				zoom={14}
				layers={demoLayers}
				marker={[-9.139, 38.722]}
				height="280px"
			/>
		</div>
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">MAPPICKER + BOUNDARY</span>
			<MapPicker
				label="REPORT LOCATION"
				mode="point"
				center={[-9.145, 38.728]}
				zoom={13}
				layers={demoLayers}
				boundary={demoBoundary}
				bind:value={boundaryPoint}
				onoutofbounds={(outside) => {
					boundaryError = outside ? 'The selected point is outside the municipality boundary.' : undefined;
				}}
				error={boundaryError}
				help="Place a point — outside the dashed boundary triggers the signal."
				search={false}
				height="280px"
			/>
		</div>
	</div>
</section>

<!-- MapCluster -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">MapCluster</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Clustered markers for list views. Click a cluster to zoom in, click a single marker to trigger the onclick callback. Auto-centers on markers.</p>

	<MapCluster
		{markers}
		center={[-9.145, 38.730]}
		zoom={13}
		onclick={(m) => console.log('Clicked:', m.label)}
		height="360px"
	/>

	<p class="type-body-sm" style="margin: var(--space-md) 0;">With GeoJSON overlay layers (same <code>layers</code> contract as MapDisplay/MapPicker — ordered, unbounded):</p>

	<MapCluster
		{markers}
		layers={demoLayers}
		center={[-9.145, 38.730]}
		zoom={13}
		height="360px"
		data-testid="cluster-with-layers"
	/>

	<p class="type-body-sm" style="margin: var(--space-md) 0;">Pins: a marker with <code>pin</code> text is drawn as a labelled pin, such as a price or a time. <code>active: true</code> draws it in the active style, and the marker whose popup is open is drawn active too. Over a muted basemap (<code>tileSource.tone: 'muted'</code>) the pins carry the colour. Set <code>distance</code> to about a pin's width so pins that would overlap form a cluster instead.</p>

	<MapCluster
		markers={pricedPlaces}
		tileSource={{ type: 'osm', tone: 'muted' }}
		distance={56}
		height="360px"
		data-testid="cluster-with-pins"
	>
		{#snippet popup(place: (typeof pricedPlaces)[number], close: () => void)}
			<MapPopup visible onclose={close}>
				<strong class="type-body-sm">{place.label}</strong>
				<span class="type-data">{place.pin} a night</span>
			</MapPopup>
		{/snippet}
	</MapCluster>
</section>

<!-- MapHeatmap -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">MapHeatmap</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Density visualization of weighted points. Built-in OpenLayers heatmap layer — no plugins. Configurable blur and radius.</p>

	<MapHeatmap
		points={heatPoints}
		center={[-9.139, 38.722]}
		radius={30}
		blur={15}
		height="360px"
	/>

	<p class="type-body-sm" style="margin: var(--space-md) 0;">With GeoJSON overlay layers:</p>

	<MapHeatmap
		points={heatPoints}
		layers={demoLayers}
		center={[-9.139, 38.722]}
		radius={30}
		blur={15}
		height="360px"
		data-testid="heatmap-with-layers"
	/>
</section>

<!-- Styled Tiles -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Styled Tiles</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">All map components accept a tileSource prop. Default is OSM. Any source takes <code>tone: 'muted'</code>, which greys the basemap in light schemes and darkens it in dark ones, so markers and routes carry the colour. It needs no API key. Stadia Maps and CARTO basemaps now need one; pass Stadia's as <code>apiKey</code>.</p>

	<div class="map-demo-grid">
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">OSM (DEFAULT)</span>
			<MapDisplay
				center={[-9.139, 38.722]}
				zoom={14}
				marker={[-9.139, 38.722]}
				height="200px"
			/>
		</div>
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">OSM, MUTED</span>
			<MapDisplay
				center={[-9.139, 38.722]}
				zoom={14}
				marker={[-9.139, 38.722]}
				tileSource={{ type: 'osm', tone: 'muted' }}
				height="200px"
				data-testid="tiles-muted"
			/>
		</div>
	</div>
</section>

<!-- Tile Source Reference -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Tile Source Config</h2>
	<div class="size-table">
		<div class="size-row">
			<code class="type-data">{'{ type: "osm" }'}</code>
			<span class="type-body-sm">Default. Standard OpenStreetMap tiles.</span>
		</div>
		<div class="size-row">
			<code class="type-data">{'{ type: "osm", tone: "muted" }'}</code>
			<span class="type-body-sm">Any source with <code>tone: "muted"</code>: the basemap is filtered with --map-tiles-muted-filter, which has a light and a dark value. Markers, pins and overlays stay at full colour.</span>
		</div>
		<div class="size-row">
			<code class="type-data">{'{ type: "stadia", layer: "...", apiKey: "..." }'}</code>
			<span class="type-body-sm">Stadia Maps. Requires API key. Layers: stamen_toner_lite, alidade_smooth, alidade_smooth_dark, stamen_watercolor, outdoors, osm_bright.</span>
		</div>
		<div class="size-row">
			<code class="type-data">{'{ type: "xyz", url: "..." }'}</code>
			<span class="type-body-sm">Any XYZ tile URL, such as Mapbox, keyed CARTO or self-hosted tiles.</span>
		</div>
	</div>
</section>

<!-- Token reference -->
<TokenRef component="Map components" file="components.css" tokens={mapTokens} />

<style>
	.map-demo-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	@media (min-width: 768px) {
		.map-demo-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.size-table {
		border: var(--elevation-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.size-row {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-sm) var(--space-md);
		border-bottom: var(--elevation-border);
	}

	.size-row:last-child {
		border-bottom: none;
	}

	.size-row code {
		min-width: 200px;
		flex-shrink: 0;
	}
</style>
