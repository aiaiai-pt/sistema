// @vitest-environment jsdom
//
// #40 (atelier#669 V1) — file REPLACE semantics on the edit form: the field
// shows the currently-stored file (name/link), a new upload REPLACES it
// (single slot), and the payload distinguishes untouched (no attachment key
// emitted — the host keeps the stored file) from replaced (the new key
// rides attachment_keys / attachments_by_param). Untouched never re-uploads
// or clears. The legacy action-lane file param (no stored current) keeps
// its append-up-to-3 behavior.

import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import ActionFormRenderer from "../components/ActionFormRenderer.svelte";
import { storedFileDescriptor } from "../components/action-form-renderer-widgets";

let target: HTMLElement | undefined;
let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  target?.remove();
  target = undefined;
});

function render(props: Record<string, unknown>) {
  target = document.createElement("div");
  document.body.appendChild(target);
  component = mount(ActionFormRenderer, {
    target,
    props: {
      action: { key: "__update", label: "Edit" },
      mode: "admin-execute",
      ...props,
    },
  });
  flushSync();
  return target;
}

function lastPayload(seen: Record<string, unknown>[]): Record<string, unknown> {
  return (seen[seen.length - 1] ?? {}) as Record<string, unknown>;
}

async function driveUpload(t: HTMLElement, fileName: string) {
  const input = t.querySelector("input[type='file']") as HTMLInputElement;
  expect(input).not.toBeNull();
  const file = new File([new Uint8Array(64)], fileName, { type: "image/png" });
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
  flushSync();
  await vi.waitFor(() => {
    expect(t.textContent).toContain(fileName);
  });
  flushSync();
}

const PARAM = {
  key: "attachment",
  label: "Report",
  type: "file",
  widget: "file",
  default_value: {
    name: "inspection-2025.pdf",
    url: "https://files.example/k1",
  },
};

describe("storedFileDescriptor (pure)", () => {
  it("normalizes string and object stored-file shapes", () => {
    expect(storedFileDescriptor("report.pdf")).toEqual({ name: "report.pdf" });
    expect(storedFileDescriptor("https://x/f.pdf")).toEqual({
      name: "f.pdf",
      url: "https://x/f.pdf",
    });
    expect(storedFileDescriptor({ name: "a.pdf", url: "https://x/a" })).toEqual(
      { name: "a.pdf", url: "https://x/a" },
    );
    expect(storedFileDescriptor({ url: "https://x/b.png" })).toEqual({
      name: "b.png",
      url: "https://x/b.png",
    });
    expect(storedFileDescriptor(null)).toBeNull();
    expect(storedFileDescriptor("")).toBeNull();
    expect(storedFileDescriptor(42)).toBeNull();
  });
});

describe("file REPLACE semantics", () => {
  it("shows the currently-stored file as a link, and untouched emits NO attachment key", () => {
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [PARAM],
      uploadFile: vi.fn(),
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    const current = t.querySelector("[data-testid='afr-file-current']");
    expect(current).not.toBeNull();
    const link = current?.querySelector("a") as HTMLAnchorElement;
    expect(link.textContent).toContain("inspection-2025.pdf");
    expect(link.href).toBe("https://files.example/k1");
    const payload = lastPayload(seen);
    expect("attachment_keys" in payload).toBe(false);
  });

  it("uploading REPLACES: the new key rides the payload, the stored row hides", async () => {
    const seen: Record<string, unknown>[] = [];
    const uploadFile = vi.fn().mockResolvedValue({ key: "k-new" });
    const t = render({
      parameters: [PARAM],
      uploadFile,
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    await driveUpload(t, "replacement.png");
    expect(uploadFile).toHaveBeenCalledTimes(1);
    expect(t.querySelector("[data-testid='afr-file-current']")).toBeNull();
    const payload = lastPayload(seen);
    expect(payload.attachment_keys).toEqual(["k-new"]);
    expect(
      (payload.attachments_by_param as Record<string, string[]>).attachment,
    ).toEqual(["k-new"]);
  });

  it("replacing the replacement keeps ONE slot (never appends)", async () => {
    const seen: Record<string, unknown>[] = [];
    const uploadFile = vi
      .fn()
      .mockResolvedValueOnce({ key: "k-first" })
      .mockResolvedValueOnce({ key: "k-second" });
    const t = render({
      parameters: [PARAM],
      uploadFile,
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    await driveUpload(t, "first.png");
    await driveUpload(t, "second.png");
    const payload = lastPayload(seen);
    expect(payload.attachment_keys).toEqual(["k-second"]);
    expect(t.textContent).not.toContain("first.png");
  });

  it("removing the pending replacement restores untouched (stored file back, no keys)", async () => {
    const seen: Record<string, unknown>[] = [];
    const uploadFile = vi.fn().mockResolvedValue({ key: "k-new" });
    const t = render({
      parameters: [PARAM],
      uploadFile,
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    await driveUpload(t, "replacement.png");
    const remove = t.querySelector(
      ".fileupload-item button, [class*='fileupload'] button[aria-label*='emove']",
    ) as HTMLButtonElement;
    expect(remove).not.toBeNull();
    remove.click();
    flushSync();
    expect(t.querySelector("[data-testid='afr-file-current']")).not.toBeNull();
    const payload = lastPayload(seen);
    expect("attachment_keys" in payload).toBe(false);
  });

  it("a file param WITHOUT a stored current keeps the legacy append behavior", async () => {
    const uploadFile = vi
      .fn()
      .mockResolvedValueOnce({ key: "k1" })
      .mockResolvedValueOnce({ key: "k2" });
    const seen: Record<string, unknown>[] = [];
    const t = render({
      parameters: [{ key: "photos", label: "Photos", type: "file" }],
      uploadFile,
      onchange: (payload: Record<string, unknown>) => seen.push(payload),
    });
    await driveUpload(t, "one.png");
    await driveUpload(t, "two.png");
    expect(lastPayload(seen).attachment_keys).toEqual(["k1", "k2"]);
  });
});
