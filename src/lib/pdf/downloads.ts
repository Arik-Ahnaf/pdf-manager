import type { GeneratedPdf, PdfDownload } from "../../types/files.ts";

export function createPdfDownloads(files: GeneratedPdf[]): PdfDownload[] {
  const downloads: PdfDownload[] = [];
  try {
    for (const file of files)
      downloads.push({ name: file.name, url: URL.createObjectURL(file.blob) });
    return downloads;
  } catch (error) {
    revokePdfDownloads(downloads);
    throw error;
  }
}

export function revokePdfDownloads(files: PdfDownload[]) {
  files.forEach((file) => URL.revokeObjectURL(file.url));
}

export function downloadPdf(file: PdfDownload) {
  const link = document.createElement("a");
  link.href = file.url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
