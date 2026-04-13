<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TokenRef from '$lib/components/TokenRef.svelte';
	import MapDisplay from '$ui/MapDisplay.svelte';
	import MapPicker from '$ui/MapPicker.svelte';
	import MapCluster from '$ui/MapCluster.svelte';
	import MapHeatmap from '$ui/MapHeatmap.svelte';
	import 'ol/ol.css';

	let pickedPoint = $state<[number, number] | undefined>(undefined);

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
</section>

<!-- MapHeatmap -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">MapHeatmap</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">Density visualization of weighted points. Built-in OpenLayers heatmap layer — no plugins. Configurable blur and radius.</p>

	<MapHeatmap
		points={heatPoints}
		center={[-9.139, 38.722]}
		zoom={14}
		blur={20}
		radius={12}
		height="360px"
	/>
</section>

<!-- Styled Tiles -->
<section style="margin-bottom: var(--space-2xl);">
	<h2 class="type-heading" style="margin-bottom: var(--space-md);">Styled Tiles</h2>
	<p class="type-body-sm" style="margin-bottom: var(--space-md);">All map components accept a tileSource prop. Default is OSM. Stadia Maps layers are free for web (no API key). XYZ supports Mapbox, CARTO, and any tile URL.</p>

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
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">CARTO POSITRON (LIGHT)</span>
			<MapDisplay
				center={[-9.139, 38.722]}
				zoom={14}
				marker={[-9.139, 38.722]}
				tileSource={{ type: 'xyz', url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png', attributions: '&copy; CARTO &copy; OpenStreetMap' }}
				height="200px"
			/>
		</div>
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">CARTO DARK MATTER</span>
			<MapDisplay
				center={[-9.139, 38.722]}
				zoom={14}
				marker={[-9.139, 38.722]}
				tileSource={{ type: 'xyz', url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', attributions: '&copy; CARTO &copy; OpenStreetMap' }}
				height="200px"
			/>
		</div>
		<div>
			<span class="type-label" style="margin-bottom: var(--space-sm); display: block;">CARTO VOYAGER</span>
			<MapDisplay
				center={[-9.139, 38.722]}
				zoom={14}
				marker={[-9.139, 38.722]}
				tileSource={{ type: 'xyz', url: 'https://{a-d}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', attributions: '&copy; CARTO &copy; OpenStreetMap' }}
				height="200px"
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
			<code class="type-data">{'{ type: "stadia", layer: "...", apiKey: "..." }'}</code>
			<span class="type-body-sm">Stadia Maps. Requires API key. Layers: stamen_toner_lite, alidade_smooth, alidade_smooth_dark, stamen_watercolor, outdoors, osm_bright.</span>
		</div>
		<div class="size-row">
			<code class="type-data">{'{ type: "xyz", url: "..." }'}</code>
			<span class="type-body-sm">Any XYZ tile URL. Use for Mapbox, CARTO, or self-hosted tiles.</span>
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
