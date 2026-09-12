import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { fixturePdf, encryptedFixture } from "./pdf-fixtures.ts";
import { readPdfFiles, loadPdf } from "../src/lib/pdf/documents.ts";
import { mergePdfs, splitPdf } from "../src/lib/pdf/operations.ts";
import { parsePageRanges } from "../src/lib/pdf/ranges.ts";
import {
  createPdfDownloads,
  revokePdfDownloads,
} from "../src/lib/pdf/downloads.ts";

test("reads actual PDF metadata and reuses parsed sources", async () => {
  const original = await fixturePdf("real.pdf", [210, 220, 230]);
  const [file] = await readPdfFiles([original]);
  assert.equal(file.file, original);
  assert.equal(file.name, "real.pdf");
  assert.equal(file.size, original.size);
  assert.equal(file.pageCount, 3);
  assert.equal(await loadPdf(file.bytes), await loadPdf(file.bytes));
});

test("merges in displayed file order without changing source bytes, pages or rotation", async () => {
  const files = await readPdfFiles([
    await fixturePdf("a.pdf", [201, 202]),
    await fixturePdf("b.pdf", [301]),
  ]);
  const before = files.map((file) => file.bytes.slice());
  const [output] = await mergePdfs([files[1], files[0]]);
  assert.equal(output.name, "merged.pdf");
  assert.equal(output.blob.type, "application/pdf");
  const merged = await PDFDocument.load(await output.blob.arrayBuffer());
  assert.deepEqual(
    merged.getPages().map((page) => page.getWidth()),
    [301, 201, 202],
  );
  assert.equal(merged.getPage(2).getRotation().angle, 90);
  files.forEach((file, index) => assert.deepEqual(file.bytes, before[index]));
  assert.equal((await loadPdf(files[0].bytes)).getPageCount(), 2);
  await assert.rejects(mergePdfs([]), /at least two/);
  await assert.rejects(mergePdfs([files[0]]), /at least two/);
});

test("extracts unique selected pages in document order and creates separate range outputs", async () => {
  const [file] = await readPdfFiles([
    await fixturePdf("source.pdf", [201, 202, 203, 204]),
  ]);
  const [selection] = await splitPdf(file, [[4, 2, 2]]);
  const result = await PDFDocument.load(await selection.blob.arrayBuffer());
  assert.equal(selection.name, "source-split.pdf");
  assert.deepEqual(
    result.getPages().map((page) => page.getWidth()),
    [202, 204],
  );
  assert.equal(result.getPage(0).getRotation().angle, 90);
  const outputs = await splitPdf(file, parsePageRanges("1-2, 4", 4));
  assert.deepEqual(
    outputs.map((output) => output.name),
    ["source-part-1.pdf", "source-part-2.pdf"],
  );
  const documents = await Promise.all(
    outputs.map(async (output) =>
      PDFDocument.load(await output.blob.arrayBuffer()),
    ),
  );
  assert.deepEqual(
    documents.map((doc) => doc.getPages().map((page) => page.getWidth())),
    [[201, 202], [204]],
  );
  const individual = await splitPdf(file, [[1], [2], [3], [4]]);
  assert.equal(individual.length, 4);
  assert.equal((await loadPdf(file.bytes)).getPageCount(), 4);
});

test("rejects empty, non-integer and out-of-bounds split selections", async () => {
  const [file] = await readPdfFiles([await fixturePdf("one.pdf", [201])]);
  for (const groups of [
    [],
    [[]],
    [[0]],
    [[2]],
    [[1.2]],
    [[NaN]],
    [[Infinity]],
  ]) {
    await assert.rejects(splitPdf(file, groups));
  }
});

test("rejects unsupported, damaged, encrypted and zero-page PDFs without partial imports", async () => {
  const valid = await fixturePdf("good.pdf", [201]);
  for (const invalid of [
    new File(["hello"], "image.png", { type: "image/png" }),
    new File(["hello"], "broken.pdf", { type: "application/pdf" }),
    new File(["%PDF-1.7\ncorrupted"], "corrupted.pdf", {
      type: "application/pdf",
    }),
  ]) {
    await assert.rejects(readPdfFiles([valid, invalid]));
  }
  await assert.rejects(
    readPdfFiles([await encryptedFixture()]),
    /encrypted or password-protected/,
  );
  await assert.rejects(
    readPdfFiles([await fixturePdf("empty.pdf", [])]),
    /no pages/,
  );
});

test("parses single pages, ranges, spaces and Unicode dashes; rejects malformed or reversed ranges", () => {
  assert.deepEqual(parsePageRanges("1-3, 5, 8–10", 10), [
    [1, 2, 3],
    [5],
    [8, 9, 10],
  ]);
  assert.deepEqual(parsePageRanges(" 1 , 2 - 2 ", 2), [[1], [2]]);
  for (const value of [
    "",
    " ",
    "0",
    "11",
    "3-1",
    "1.5",
    "1,",
    "1,,2",
    "1-2-3",
    "Infinity",
    "-1",
    "1e1",
  ])
    assert.throws(() => parsePageRanges(value, 10));
});

test("creates working Blob download URLs and revokes each one", async () => {
  const files = await readPdfFiles([await fixturePdf("download.pdf", [201])]);
  const outputs = await splitPdf(files[0], [[1]]);
  const downloads = createPdfDownloads(outputs);
  assert.equal(downloads[0].name, "download-split.pdf");
  assert.ok(downloads[0].url.startsWith("blob:"));
  assert.equal((await fetch(downloads[0].url)).status, 200);
  revokePdfDownloads(downloads);
  await assert.rejects(fetch(downloads[0].url));
});
