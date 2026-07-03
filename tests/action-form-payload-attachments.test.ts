// #629 follow-up — per-param attachment attribution in the action payload.
// `attachments_by_param` is ADDITIVE beside the flat `attachment_keys`:
// consumers that map keys back to parameters (the staff execute adapter)
// read it instead of guessing positionally.

import { describe, expect, it } from "vitest";
import { buildActionPayload } from "../components/action-form-renderer-payload";

const BASE = {
  action: { id: "a1", key: "add_image", status: "published" },
  placement: null,
  targetConfig: {},
  sourceSchema: {},
  schemaVersion: null,
  mode: "admin-execute" as const,
};

describe("attachments_by_param", () => {
  it("rides beside attachment_keys, keyed by the uploading param", () => {
    const payload = buildActionPayload({
      ...BASE,
      rawValues: { caption: "x" },
      attachmentKeys: ["media/a.jpg", "media/b.jpg"],
      attachmentsByParam: { file: ["media/a.jpg"], evidence: ["media/b.jpg"] },
    });
    expect(payload.attachment_keys).toEqual(["media/a.jpg", "media/b.jpg"]);
    expect(payload.attachments_by_param).toEqual({
      file: ["media/a.jpg"],
      evidence: ["media/b.jpg"],
    });
  });

  it("is absent when empty (the pre-0.44.1 payload shape is unchanged)", () => {
    const payload = buildActionPayload({
      ...BASE,
      rawValues: {},
      attachmentsByParam: {},
    });
    expect("attachments_by_param" in payload).toBe(false);
    expect("attachment_keys" in payload).toBe(false);
  });
});
