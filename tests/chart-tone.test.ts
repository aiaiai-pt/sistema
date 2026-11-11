// A muted series and an axis ceiling: rain as quiet bars under temperature
// lines, on a scale where 3 mm looks small and 30 mm still fits.

import { describe, expect, it } from "vitest";
import { buildChartOption, seriesColor } from "../components/renderer/chart-option";
import type { ChartData } from "../components/renderer/aggregate";

const TOKENS = { accent: "#2563eb", textPrimary: "#111", textSecondary: "#6b7280", border: "#333", surface: "#444" };
const days: ChartData = {
  category: ["1 Oct", "2 Oct", "3 Oct"],
  series: [
    { name: "Rain mm", type: "bar", axis: "secondary", tone: "muted", data: [1, 3, 2] },
    { name: "High °C", type: "line", data: [24, 25, 23] },
    { name: "Low °C", type: "line", data: [13, 14, 12] },
  ],
};
type Series = { itemStyle: { color: string }; lineStyle?: { color: string } };
type Axis = { max?: number | ((extent: { min: number; max: number }) => number) };
const series = (option: Record<string, unknown>) => option.series as Series[];
const axes = (option: Record<string, unknown>) => option.yAxis as Axis[];
const top = (axis: Axis, max: number) => (typeof axis.max === "function" ? axis.max({ min: 0, max }) : axis.max);

describe("buildChartOption tone", () => {
  it("should_draw_a_muted_series_in_the_secondary_text_colour_not_the_accent", () => {
    const [rain] = series(buildChartOption(days, { tokens: TOKENS, ySecondary: true }));
    expect(rain.itemStyle.color).toContain("#6b7280");
    expect(rain.itemStyle.color).not.toContain("#2563eb");
  });

  it("should_keep_the_accent_ramp_for_the_other_series_as_if_the_muted_one_were_absent", () => {
    const [, high, low] = series(buildChartOption(days, { tokens: TOKENS, ySecondary: true }));
    expect(high.lineStyle!.color).toBe(seriesColor(TOKENS.accent, 0));
    expect(low.lineStyle!.color).toBe(seriesColor(TOKENS.accent, 1));
  });
});

describe("buildChartOption ceiling", () => {
  it("should_reach_at_least_the_ceiling_and_grow_past_it_for_larger_values", () => {
    const option = buildChartOption(days, { tokens: TOKENS, ySecondary: true, ySecondaryCeiling: 20 });
    const [primary, secondary] = axes(option);
    expect(top(secondary, 3)).toBe(20);
    expect(top(secondary, 31)).toBe(31);
    expect(primary.max).toBeUndefined();
  });

  it("should_apply_a_ceiling_to_the_primary_axis", () => {
    const [primary] = axes(buildChartOption(days, { tokens: TOKENS, yCeiling: 40 }));
    expect(top(primary, 25)).toBe(40);
  });

  it("should_leave_the_axes_to_fit_the_data_without_a_ceiling", () => {
    const option = buildChartOption(days, { tokens: TOKENS, ySecondary: true });
    expect(axes(option).map((axis) => axis.max)).toEqual([undefined, undefined]);
  });
});
