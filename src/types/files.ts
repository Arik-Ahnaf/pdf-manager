export type WorkspaceFile = {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  file: File;
  bytes: Uint8Array<ArrayBuffer>;
};

export type PageRange = { id: string; from: string; to: string };

export type GeneratedPdf = { name: string; blob: Blob };
export type PdfDownload = { name: string; url: string };
