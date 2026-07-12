/**
 * #499 criterion A — the shared display transforms lifted into the DS.
 * Ports the portal's cells/formatCell contracts (so behaviour is preserved for
 * the portal when it delegates here) and adds the two host-fork parameters
 * (objectFallback "json", treatAsDate) + geoPoint.
 */
import { describe, it, expect } from "vitest";
import {
  formatScalar,
  isIsoTimestamp,
  formatTimestamp,
  formatDateTime,
  displayCell,
  statusLabel,
  statusVariant,
  resolveStatusBadge,
  geoPoint,
} from "../components/renderer/display";

describe("formatScalar — pure value→string + object policy", () => {
  it("scalars stringify; null/undefined → ''", () => {
    expect(formatScalar("hi")).toBe("hi");
    expect(formatScalar(42)).toBe("42");
    expect(formatScalar(true)).toBe("true");
    expect(formatScalar(null)).toBe("");
    expect(formatScalar(undefined)).toBe("");
  });

  it("arrays join non-empty formatted members", () => {
    expect(formatScalar(["a", "", "b"])).toBe("a, b");
    expect(formatScalar([{ label: "X" }, { id: "y" }])).toBe("X, y");
  });

  it("relationship object renders label→name→display_name→title→code→id", () => {
    expect(formatScalar({ id: "u1", label: "Ana" })).toBe("Ana");
    expect(formatScalar({ id: "u1", name: "Bob" })).toBe("Bob");
    expect(formatScalar({ id: "u1", title: "Doc" })).toBe("Doc");
    expect(formatScalar({ id: "u1" })).toBe("u1");
  });

  it("#748 — display_name and code join the handle order (expanded ontology rels)", () => {
    // An expanded rel carrying only display_name/code must render its handle,
    // never its UUID (the gap that kept the admin's private renderCell alive).
    expect(formatScalar({ id: "u1", display_name: "Ana Silva" })).toBe(
      "Ana Silva",
    );
    expect(formatScalar({ id: "u1", code: "PROVEZERO" })).toBe("PROVEZERO");
    // Precedence: name beats display_name (the admin's order), display_name
    // beats title, title beats code.
    expect(formatScalar({ name: "N", display_name: "D", code: "C" })).toBe("N");
    expect(formatScalar({ display_name: "D", title: "T", code: "C" })).toBe(
      "D",
    );
    expect(formatScalar({ title: "T", code: "C" })).toBe("T");
  });

  it("#748 — booleanDisplay 'yes-no' renders the staff cell copy; default stays raw", () => {
    expect(formatScalar(true, { booleanDisplay: "yes-no" })).toBe("Yes");
    expect(formatScalar(false, { booleanDisplay: "yes-no" })).toBe("No");
    expect(formatScalar(true)).toBe("true");
    expect(formatScalar(false)).toBe("false");
    // arrays thread the option through
    expect(formatScalar([true, false], { booleanDisplay: "yes-no" })).toBe(
      "Yes, No",
    );
    // displayCell threads it too
    expect(displayCell(true, "en", { booleanDisplay: "yes-no" })).toBe("Yes");
    expect(displayCell(false, "en")).toBe("false");
  });

  it("REDACTS an unknown object by default (never leaks internals)", () => {
    expect(formatScalar({ secret: "x", deep: { a: 1 } })).toBe("");
  });

  it("objectFallback:'json' dumps the unknown object (admin operator view)", () => {
    const out = formatScalar({ a: 1 }, { objectFallback: "json" });
    expect(out).toContain('"a": 1');
    // a relationship object still prefers its human handle, even in json mode
    expect(
      formatScalar({ id: "u", name: "N" }, { objectFallback: "json" }),
    ).toBe("N");
  });
});

describe("timestamps", () => {
  it("detects ISO-8601 by value shape, not bare dates", () => {
    expect(isIsoTimestamp("2026-06-11T08:57:25.176184Z")).toBe(true);
    expect(isIsoTimestamp("2026-06-11T08:57:25+01:00")).toBe(true);
    expect(isIsoTimestamp("2026-06-11")).toBe(false);
    expect(isIsoTimestamp(1234)).toBe(false);
    expect(isIsoTimestamp(null)).toBe(false);
  });

  it("formats per locale, date-only, UTC-stable; raw on unparseable", () => {
    expect(formatTimestamp("2026-06-11T23:30:00Z", "en")).toBe("Jun 11, 2026");
    expect(formatTimestamp("2026-06-11T23:30:00Z", "pt")).toMatch(
      /11.*jun.*2026/i,
    );
    expect(formatTimestamp("9999-99-99T99:99:99Z", "en")).toBe(
      "9999-99-99T99:99:99Z",
    );
  });

  it("formatDateTime keeps the time, UTC-stable; raw on unparseable", () => {
    expect(formatDateTime("2026-06-11T23:30:00Z", "en")).toBe(
      "Jun 11, 2026, 11:30 PM",
    );
    expect(formatDateTime("2026-06-11T23:30:00Z", "pt")).toMatch(
      /11.*jun.*2026.*23:30/i,
    );
    expect(formatDateTime("9999-99-99T99:99:99Z", "en")).toBe(
      "9999-99-99T99:99:99Z",
    );
  });
});

describe("displayCell — date routing + forks", () => {
  it("portal value-mode: ISO strings → date, rest → formatScalar", () => {
    expect(displayCell("2026-06-11T08:00:00Z", "en")).toBe("Jun 11, 2026");
    expect(displayCell("Pothole on Rua A", "en")).toBe("Pothole on Rua A");
    expect(displayCell(null, "en")).toBe("");
  });

  it("admin type-mode: treatAsDate forces date formatting", () => {
    // a value the value-shape regex would NOT catch as a date is still
    // formatted when the caller knows (from schema) it's a datetime field.
    expect(
      displayCell("2026-06-11T08:00:00Z", "en", { treatAsDate: true }),
    ).toBe("Jun 11, 2026");
    // non-date string with treatAsDate but unparseable → passes through raw
    expect(displayCell("not-a-date", "en", { treatAsDate: true })).toBe(
      "not-a-date",
    );
  });

  it("admin type-mode: treatAsDateTime KEEPS the time (schema datetime field)", () => {
    // a `datetime`-typed field renders its full instant — the time is data
    // (SLA stamps, acknowledgements), not noise. Contrast treatAsDate above,
    // which drops it. Midnight is still shown (it's a real datetime).
    expect(
      displayCell("2026-06-11T08:30:00Z", "en", { treatAsDateTime: true }),
    ).toBe("Jun 11, 2026, 8:30 AM");
    expect(
      displayCell("2026-06-11T00:00:00Z", "en", { treatAsDateTime: true }),
    ).toBe("Jun 11, 2026, 12:00 AM");
    expect(displayCell("not-a-date", "en", { treatAsDateTime: true })).toBe(
      "not-a-date",
    );
  });

  it("treatAsDate wins when a caller mistakenly sets both", () => {
    expect(
      displayCell("2026-06-11T08:30:00Z", "en", {
        treatAsDate: true,
        treatAsDateTime: true,
      }),
    ).toBe("Jun 11, 2026");
  });

  it("portal value-mode is UNCHANGED by the new option (no flag → date-only)", () => {
    // regression guard: the citizen path must not gain times.
    expect(displayCell("2026-06-11T08:30:00Z", "en")).toBe("Jun 11, 2026");
  });

  it("threads objectFallback through to formatScalar", () => {
    expect(displayCell({ a: 1 }, "en")).toBe(""); // redact default
    expect(displayCell({ a: 1 }, "en", { objectFallback: "json" })).toContain(
      '"a": 1',
    );
  });
});

describe("status badge mapping (data-driven, junk-safe)", () => {
  const labels = { open: "Aberta", in_progress: "Em curso" };
  const variants = { open: "info", resolved: "success" };

  it("label maps machine→copy with raw fallback", () => {
    expect(statusLabel("open", labels)).toBe("Aberta");
    expect(statusLabel("weird", labels)).toBe("weird");
    expect(statusLabel("open", undefined)).toBe("open");
  });

  it("variant maps with neutral fallback, junk-safe", () => {
    expect(statusVariant("open", variants)).toBe("info");
    expect(statusVariant("closed", variants)).toBe("neutral");
    expect(statusVariant("open", "junk")).toBe("neutral");
    expect(statusVariant("open", ["junk"])).toBe("neutral");
  });

  it("resolveStatusBadge combines both", () => {
    expect(resolveStatusBadge("open", { labels, variants })).toEqual({
      label: "Aberta",
      variant: "info",
    });
    expect(resolveStatusBadge("x")).toEqual({ label: "x", variant: "neutral" });
  });
});

describe("geoPoint", () => {
  it("extracts [lon,lat] from a GeoJSON-ish Point", () => {
    expect(geoPoint({ type: "Point", coordinates: [-9.14, 38.74] })).toEqual([
      -9.14, 38.74,
    ]);
    expect(geoPoint({ coordinates: [1, 2, 3] })).toEqual([1, 2]);
  });

  it("null on non-points / bad coords", () => {
    expect(geoPoint(null)).toBeNull();
    expect(geoPoint({})).toBeNull();
    expect(geoPoint({ coordinates: [1] })).toBeNull();
    expect(geoPoint({ coordinates: ["a", "b"] })).toBeNull();
    expect(geoPoint({ coordinates: [Infinity, 2] })).toBeNull();
  });
});
