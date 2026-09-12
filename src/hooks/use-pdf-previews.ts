"use client";
import { useEffect, useState } from "react";
import { openPdfPreview, type PreviewSession } from "@/lib/pdf/previews";

export function usePdfPreviews(bytes: Uint8Array | undefined) {
  const [session, setSession] = useState<PreviewSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!bytes) return;
    const controller = new AbortController();
    void openPdfPreview(bytes, controller.signal)
      .then((session) => {
        if (!controller.signal.aborted) setSession(session);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError(
            "This PDF’s previews could not be loaded. You can still select pages using ranges, or try another copy of the file.",
          );
      });
    return () => controller.abort();
  }, [bytes]);
  return { session, error };
}
