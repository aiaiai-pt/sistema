import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

import {
  clusterFeatureStyle,
  popupCenter,
  tileLayerClass,
} from "../components/map-utils.js";

// A Cluster-source feature stand-in: `.get('features')` lists its members,
// each exposing `.get('markerData')`.
const member = (markerData: Record<string, unknown>) => ({
  get: (key: string) => (key === "markerData" ? markerData : undefined),
});
const clusterOf = (...markers: Record<string, unknown>[]) => ({
  get: (key: string) => (key === "features" ? markers.map(member) : undefined),
});

// Styles that say which one was asked for.
const styles = {
  marker: "marker",
  cluster: (size: number) => `cluster ${size}`,
  pin: (text: string, active?: boolean) =>
    `${active ? "active " : ""}pin ${text}`,
} as any;

describe("clusterFeatureStyle", () => {
  test("should_draw_a_marker_with_pin_text_as_a_pin", () => {
    const feature = clusterOf({ id: "h1", lon: 0, lat: 0, pin: "€182" });
    expect(clusterFeatureStyle(feature, styles)).toBe("pin €182");
  });

  test("should_draw_an_active_marker_as_an_active_pin", () => {
    const feature = clusterOf({
      id: "h1",
      lon: 0,
      lat: 0,
      pin: "€182",
      active: true,
    });
    expect(clusterFeatureStyle(feature, styles)).toBe("active pin €182");
  });

  test("should_draw_the_marker_whose_popup_is_open_as_active", () => {
    const feature = clusterOf({ id: "h1", lon: 0, lat: 0, pin: "€182" });
    expect(clusterFeatureStyle(feature, styles, "h1")).toBe("active pin €182");
    expect(clusterFeatureStyle(feature, styles, "h2")).toBe("pin €182");
  });

  test("should_keep_the_plain_marker_without_pin_text", () => {
    expect(
      clusterFeatureStyle(clusterOf({ id: "a", lon: 0, lat: 0 }), styles),
    ).toBe("marker");
    expect(
      clusterFeatureStyle(
        clusterOf({ id: "a", lon: 0, lat: 0, pin: "" }),
        styles,
      ),
    ).toBe("marker");
  });

  test("should_show_the_count_for_a_cluster_of_many", () => {
    const feature = clusterOf(
      { id: "a", lon: 0, lat: 0, pin: "€1" },
      { id: "b", lon: 0, lat: 0, pin: "€2" },
      { id: "c", lon: 0, lat: 0 },
    );
    expect(clusterFeatureStyle(feature, styles)).toBe("cluster 3");
  });
});

describe("muted basemap", () => {
  test("should_give_muted_tiles_their_own_layer_class", () => {
    expect(tileLayerClass({ type: "osm", tone: "muted" })).toBe(
      "ol-layer map-tiles-muted",
    );
    expect(
      tileLayerClass({
        type: "xyz",
        url: "https://t/{z}/{x}/{y}.png",
        tone: "muted",
      }),
    ).toContain("map-tiles-muted");
  });

  test("should_leave_other_tiles_on_the_shared_layer_class", () => {
    expect(tileLayerClass({ type: "osm" })).toBe("ol-layer");
  });

  test("should_filter_muted_tiles_in_every_map_component_and_both_schemes", () => {
    for (const name of [
      "MapCluster",
      "MapDisplay",
      "MapHeatmap",
      "MapPicker",
    ]) {
      const source = readFileSync(`components/${name}.svelte`, "utf8");
      expect(source, name).toMatch(
        /:global\(\.map-tiles-muted\)\s*\{\s*filter: var\(--map-tiles-muted-filter\);/,
      );
    }
    const tokens = readFileSync("tokens/components.css", "utf8");
    expect(tokens.match(/--map-tiles-muted-filter:/g)?.length).toBe(2);
    expect(tokens).toMatch(
      /:root\[data-scheme="dark"\]\s*\{\s*--map-tiles-muted-filter:/,
    );
  });
});

describe("popupCenter", () => {
  test("should_put_the_marker_below_the_middle_by_half_the_popup", () => {
    // 2 map units per px: a 200 px card shifts the centre 100 px = 200 units north.
    expect(popupCenter([1000, 5000], 200, 400, 2)).toEqual([1000, 5200]);
  });

  test("should_keep_the_marker_inside_the_bottom_edge_of_a_short_map", () => {
    // Half of 300 px less the 24 px margin caps the shift at 126 px.
    expect(popupCenter([0, 0], 400, 300, 1)).toEqual([0, 126]);
  });

  test("should_centre_on_the_marker_without_a_popup", () => {
    expect(popupCenter([10, 20], 0, 400, 3)).toEqual([10, 20]);
  });
});
