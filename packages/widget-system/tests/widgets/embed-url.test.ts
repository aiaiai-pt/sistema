/**
 * Unit tests for `safeEmbedSrc` — the embedded-analysis widget's URL guard
 * (S1.4 #59). Pure function; no DOM.
 *
 * Contract: admit only an http(s) absolute URL or a root-relative path; reject
 * everything else (dangerous schemes, protocol-relative, non-strings, empty).
 */

import { describe, expect, it } from "vitest";
import { safeEmbedSrc } from "../../src/widgets/embed-url.ts";

describe("safeEmbedSrc — accepted", () => {
  it("keeps an https absolute URL", () => {
    expect(safeEmbedSrc("https://metabase.example.com/embed/abc?token=x")).toBe(
      "https://metabase.example.com/embed/abc?token=x",
    );
  });

  it("keeps an http absolute URL", () => {
    expect(safeEmbedSrc("http://localhost:3000/embed/1")).toBe(
      "http://localhost:3000/embed/1",
    );
  });

  it("keeps a root-relative same-origin proxy path", () => {
    expect(safeEmbedSrc("/internal/metabase-embed/x/1")).toBe(
      "/internal/metabase-embed/x/1",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(safeEmbedSrc("  https://ex.com/e  ")).toBe("https://ex.com/e");
  });
});

describe("safeEmbedSrc — rejected", () => {
  it("rejects the javascript: scheme", () => {
    expect(safeEmbedSrc("javascript:alert(1)")).toBeNull();
  });

  it("rejects a data: URL", () => {
    expect(safeEmbedSrc("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("rejects blob: and file: schemes", () => {
    expect(safeEmbedSrc("blob:https://ex.com/uuid")).toBeNull();
    expect(safeEmbedSrc("file:///etc/passwd")).toBeNull();
  });

  it("rejects a protocol-relative //host (inherits page scheme, off-origin)", () => {
    expect(safeEmbedSrc("//evil.example.com/x")).toBeNull();
  });

  it("rejects a scheme with leading/embedded control chars", () => {
    // A naive startsWith check would be fooled; URL parsing is not.
    expect(safeEmbedSrc("java\tscript:alert(1)")).toBeNull();
  });

  it("rejects empty, whitespace-only, and non-string values", () => {
    expect(safeEmbedSrc("")).toBeNull();
    expect(safeEmbedSrc("   ")).toBeNull();
    expect(safeEmbedSrc(undefined)).toBeNull();
    expect(safeEmbedSrc(null)).toBeNull();
    expect(safeEmbedSrc(42)).toBeNull();
    expect(safeEmbedSrc({})).toBeNull();
  });
});
