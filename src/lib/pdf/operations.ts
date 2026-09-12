import type { GeneratedPdf, WorkspaceFile } from "../../types/files.ts";
import { loadPdf } from "./documents.ts";
import { PdfError } from "./errors.ts";

function pdfBlob(bytes: Uint8Array) {
  return new Blob([Uint8Array.from(bytes).buffer], { type: "application/pdf" });
}

export async function mergePdfs(
  files: readonly WorkspaceFile[],
): Promise<GeneratedPdf[]> {
  if (files.length < 2) throw new PdfError("Add at least two PDFs to merge.");
  const { PDFDocument } = await import("pdf-lib");
  const result = await PDFDocument.create();
  for (const file of files) {
    const source = await loadPdf(file.bytes);
    const pages = await result.copyPages(source, source.getPageIndices());
    pages.forEach((page) => result.addPage(page));
  }
  return [{ name: "merged.pdf", blob: pdfBlob(await result.save()) }];
}

export function normalizeSelectedPages(
  pages: readonly number[],
  pageCount: number,
): number[] {
  if (!pages.length) throw new PdfError("Select at least one page.");
  if (
    pages.some(
      (page) => !Number.isSafeInteger(page) || page < 1 || page > pageCount,
    )
  ) {
    throw new PdfError(
      `Page numbers must be whole numbers from 1 to ${pageCount}.`,
    );
  }
  return [...new Set(pages)].sort((a, b) => a - b);
}

export async function splitPdf(
  file: WorkspaceFile,
  groups: readonly (readonly number[])[],
): Promise<GeneratedPdf[]> {
  if (!groups.length) throw new PdfError("Select at least one page or range.");
  const source = await loadPdf(file.bytes);
  const selections = groups.map((pages) =>
    normalizeSelectedPages(pages, source.getPageCount()),
  );
  const { PDFDocument } = await import("pdf-lib");
  const base =
    file.name
      .replace(/\.pdf$/i, "")
      .replace(/[\\/<>:"|?*]/g, "-")
      .slice(0, 120) || "document";
  const results: GeneratedPdf[] = [];
  for (let index = 0; index < selections.length; index++) {
    const result = await PDFDocument.create();
    const pages = await result.copyPages(
      source,
      selections[index].map((page) => page - 1),
    );
    pages.forEach((page) => result.addPage(page));
    results.push({
      name:
        groups.length === 1
          ? `${base}-split.pdf`
          : `${base}-part-${index + 1}.pdf`,
      blob: pdfBlob(await result.save()),
    });
  }
  return results;
}
