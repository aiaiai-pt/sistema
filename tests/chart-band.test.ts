// @vitest-environment jsdom
//
// A shaded band over a run of categories (a stay inside a run of days, a
// campaign inside a run of weeks). The canvas draws it as an ECharts markArea;
// the a11y table carries the same fact on the rows inside the band, so the
// band is never encoded only in pixels.

import { mount, unmount } from "svelte";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import EChart from "../components/EChart.svelte";
import { buildChartOption } from "../components/renderer/chart-option";
import type { ChartData } from "../components/renderer/aggregate";

const TOKENS = { accent: "#2563eb", textPrimary: "#111", textSecondary: "#222", border: "#333", surface: "#444", band: "#eee" };
const days: ChartData = {
  category: ["1 Oct", "2 Oct", "3 Oct", "4 Oct"],
  series: [
    { name: "High °C", type: "line", data: [24, 25, 23, 22] },
    { name: "Rain days %", type: "bar", axis: "secondary", data: [10, 40, 30, 20] },
  ],
};
type Series = { markArea?: { silent: boolean; itemStyle: { color: string }; label: { show: boolean }; data: unknown } };
const series = (option: Record<string, unknown>) => option.series as Series[];

describe("buildChartOption band", () => {
  it("should_shade_the_band_from_its_first_to_its_last_category", () => {
    const option = buildChartOption(days, { tokens: TOKENS, ySecondary: true, band: { from: "2 Oct", to: "3 Oct", label: "Stay" } });
    const area = series(option)[0].markArea!;
    expect(area.data).toEqual([[{ name: "Stay", xAxis: "2 Oct" }, { xAxis: "3 Oct" }]]);
    expect(area.itemStyle.color).toBe("#eee");
    expect(area.silent).toBe(true);
    expect(area.label.show).toBe(true);
    expect(series(option)[1].markArea).toBeUndefined();
  });

  it("should_shade_along_the_y_axis_on_a_horizontal_chart", () => {
    const option = buildChartOption(days, { tokens: TOKENS, orientation: "horizontal", band: { from: "1 Oct", to: "2 Oct" } });
    expect(series(option)[0].markArea!.data).toEqual([[{ name: "", yAxis: "1 Oct" }, { yAxis: "2 Oct" }]]);
    expect(series(option)[0].markArea!.label.show).toBe(false);
  });

  it("should_draw_no_band_when_its_ends_are_not_categories", () => {
    const option = buildChartOption(days, { tokens: TOKENS, band: { from: "30 Sep", to: "2 Oct" } });
    expect(series(option)[0].markArea).toBeUndefined();
    expect(series(buildChartOption(days, { tokens: TOKENS }))[0].markArea).toBeUndefined();
  });

  it("should_fall_back_to_the_accent_wash_without_a_band_token", () => {
    const { band: _, ...tokens } = TOKENS;
    const option = buildChartOption(days, { tokens, band: { from: "1 Oct", to: "1 Oct" } });
    expect(series(option)[0].markArea!.itemStyle.color).toContain("#2563eb");
  });
});

describe("EChart band in the data table", () => {
  let target: HTMLElement | undefined;
  let component: Record<string, unknown> | undefined;
  afterEach(() => { if (component) unmount(component); target?.remove(); component = undefined; target = undefined; });

  it("should_mark_the_rows_inside_the_band_with_its_label", () => {
    target = document.createElement("div");
    document.body.appendChild(target);
    component = mount(EChart, { target, props: { caption: "Weather", labelHeader: "Day", category: days.category, series: days.series, ySecondary: true, band: { from: "2 Oct", to: "3 Oct", label: "Stay" } } }) as Record<string, unknown>;
    const rows = Array.from(target.querySelectorAll("tbody tr"));
    expect(rows.map((row) => row.hasAttribute("data-band"))).toEqual([false, true, true, false]);
    expect(rows.map((row) => row.querySelector("th")!.textContent!.replace(/\s+/g, " ").trim())).toEqual(["1 Oct", "2 Oct Stay", "3 Oct Stay", "4 Oct"]);
  });

  it("should_register_the_mark_area_component_and_read_the_band_token", () => {
    const source = readFileSync("components/EChart.svelte", "utf8");
    expect(source).toContain("components.MarkAreaComponent");
    expect(source).toContain('"--chart-band-bg"');
    expect(readFileSync("tokens/components.css", "utf8")).toMatch(/--chart-band-bg:\s*var\(--color-accent-subtle\)/);
  });
});
