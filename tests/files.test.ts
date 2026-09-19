import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  MAX_FILES,
  formatFileSize,
  validateFiles,
} from "../src/lib/utils/files.ts";

const pdf = { name: "example.pdf", type: "application/pdf", size: 1024 };

test("allows up to 100 MB per PDF and rejects even one byte above the limit", () => {
  assert.equal(MAX_FILE_SIZE_MB, 100);
  assert.equal(MAX_FILE_SIZE, 100 * 1024 * 1024);
  for (const size of [50 * 1024 * 1024 + 1, 100 * 1024 * 1024]) {
    assert.equal(validateFiles([{ ...pdf, size }]), null);
  }
  assert.match(
    validateFiles([{ ...pdf, size: 100 * 1024 * 1024 + 1 }])!,
    /100 MB per file/,
  );
});

test("accepts PDF metadata, including uppercase extensions and missing OS MIME types", () => {
  assert.equal(validateFiles([pdf]), null);
  assert.equal(
    validateFiles([{ ...pdf, name: "EXAMPLE.PDF", type: "" }]),
    null,
  );
});
test("rejects non-PDF, empty, oversized, and excessive selections", () => {
  assert.match(validateFiles([{ ...pdf, name: "photo.png" }])!, /isn’t a PDF/);
  assert.match(validateFiles([{ ...pdf, type: "image/png" }])!, /isn’t a PDF/);
  assert.match(validateFiles([{ ...pdf, size: 0 }])!, /empty/);
  assert.match(
    validateFiles([{ ...pdf, size: MAX_FILE_SIZE + 1 }])!,
    /too large/,
  );
  assert.match(
    validateFiles(Array.from({ length: MAX_FILES + 1 }, () => pdf))!,
    /up to 20/,
  );
  assert.equal(validateFiles([{ ...pdf, size: MAX_FILE_SIZE }]), null);
});
test("formats file sizes at each displayed unit", () => {
  assert.equal(formatFileSize(0), "0 B");
  assert.equal(formatFileSize(1024), "1 KB");
  assert.equal(formatFileSize(1572864), "1.5 MB");
});
