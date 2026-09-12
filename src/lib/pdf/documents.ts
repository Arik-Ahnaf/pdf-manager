import type { PDFDocument } from "pdf-lib";
import type { WorkspaceFile } from "../../types/files.ts";
import { validateFiles } from "../utils/files.ts";
import { PdfError, pdfErrorMessage } from "./errors.ts";

// Weak keys let removed files and their parsed documents be garbage collected.
// Sources remain read-only; every operation creates a separate destination.
const documents = new WeakMap<Uint8Array, Promise<PDFDocument>>();

export function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  const cached = documents.get(bytes);
  if (cached) return cached;
  const pending = (async () => {
    const { PDFDocument, EncryptedPDFError } = await import("pdf-lib");
    if (!new TextDecoder().decode(bytes.subarray(0, 1024)).includes("%PDF-")) {
      throw new PdfError("This file is not a valid PDF.");
    }
    try {
      const document = await PDFDocument.load(bytes, {
        throwOnInvalidObject: true,
        updateMetadata: false,
      });
      if (document.isEncrypted) throw new EncryptedPDFError();
      if (!document.getPageCount())
        throw new PdfError("This PDF has no pages.");
      // Resolve the page tree now so a broken tree fails at import, not export.
      document.getPages().forEach((page) => page.getSize());
      return document;
    } catch (error) {
      // pdf-lib's ES5 Error subclass does not reliably preserve instanceof.
      if (
        error instanceof EncryptedPDFError ||
        (error instanceof Error &&
          error.message === new EncryptedPDFError().message)
      ) {
        throw new PdfError(
          "This PDF is encrypted or password-protected. Unlock it before adding it to Folio.",
        );
      }
      if (error instanceof PdfError) throw error;
      throw new PdfError(
        "This PDF is damaged or unsupported. Please try another copy.",
      );
    }
  })();
  documents.set(bytes, pending);
  void pending.catch(() => documents.delete(bytes));
  return pending;
}

export async function readPdfFiles(files: File[]): Promise<WorkspaceFile[]> {
  const error = validateFiles(files);
  if (error) throw new PdfError(error);
  const results: WorkspaceFile[] = [];
  for (const file of files) {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const document = await loadPdf(bytes);
      results.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        pageCount: document.getPageCount(),
        file,
        bytes,
      });
    } catch (error) {
      throw new PdfError(
        `“${file.name}”: ${pdfErrorMessage(error, "This file could not be read. Please select it again.")}`,
      );
    }
  }
  return results;
}
