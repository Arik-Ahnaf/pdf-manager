"use client";

import { useEffect, useRef, useState } from "react";
import type { GeneratedPdf, PdfDownload } from "@/types/files";
import {
  createPdfDownloads,
  downloadPdf,
  revokePdfDownloads,
} from "@/lib/pdf/downloads";
import { pdfErrorMessage } from "@/lib/pdf/errors";

type ExportState = {
  source: string;
  processing: boolean;
  error: string | null;
  downloads: PdfDownload[];
};

export function usePdfExport(source: string) {
  const [state, setState] = useState<ExportState>({
    source,
    processing: false,
    error: null,
    downloads: [],
  });
  const generation = useRef(0);
  const lock = useRef(false);
  const resources = useRef<PdfDownload[]>([]);

  // Reset derived results immediately when input files or selections change.
  if (state.source !== source)
    setState({ source, processing: false, error: null, downloads: [] });

  useEffect(
    () => () => {
      generation.current++;
      lock.current = false;
      revokePdfDownloads(resources.current);
      resources.current = [];
    },
    [source],
  );

  async function run(operation: () => Promise<GeneratedPdf[]>) {
    if (lock.current) return;
    lock.current = true;
    const token = ++generation.current;
    revokePdfDownloads(resources.current);
    resources.current = [];
    setState({ source, processing: true, error: null, downloads: [] });
    try {
      // Paint the loading state before starting CPU work on the main thread.
      await new Promise((resolve) => setTimeout(resolve, 0));
      const files = await operation();
      if (token !== generation.current) return;
      const downloads = createPdfDownloads(files);
      resources.current = downloads;
      setState({ source, processing: false, error: null, downloads });
      if (downloads.length === 1) downloadPdf(downloads[0]);
    } catch (error) {
      if (token === generation.current) {
        revokePdfDownloads(resources.current);
        resources.current = [];
        setState({
          source,
          processing: false,
          error: pdfErrorMessage(error),
          downloads: [],
        });
      }
    } finally {
      if (token === generation.current) lock.current = false;
    }
  }
  return { ...state, run };
}
