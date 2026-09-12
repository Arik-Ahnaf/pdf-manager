export class PdfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfError";
  }
}

export function pdfErrorMessage(
  error: unknown,
  fallback = "Something went wrong while processing this PDF. Please try again.",
) {
  return error instanceof PdfError ? error.message : fallback;
}
