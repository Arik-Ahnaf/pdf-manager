"use client";
import { useEffect, useRef, useState } from "react";
import { FileWarning, LoaderCircle } from "lucide-react";
import type { PreviewSession } from "@/lib/pdf/previews";

export function PdfThumbnail({
  session,
  page,
  unavailable = false,
}: {
  session: PreviewSession | null;
  page: number;
  unavailable?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  useEffect(() => {
    if (!session || !canvas.current || !container.current) return;
    const element = canvas.current;
    const controller = new AbortController();
    let started = false;
    const render = () => {
      if (started) return;
      started = true;
      void session
        .render(page, element, controller.signal)
        .then(() => {
          if (!controller.signal.aborted) setStatus("ready");
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus("error");
        });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          render();
          observer.disconnect();
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [session, page]);
  const failed = unavailable || status === "error";
  return (
    <span ref={container} className="pdf-thumbnail" aria-hidden="true">
      <canvas
        ref={canvas}
        className={status === "ready" ? "pdf-thumbnail-canvas" : "hidden"}
      />
      {status !== "ready" && (
        <span className="thumbnail-status">
          {failed ? (
            <>
              <FileWarning size={20} />
              <small>Preview unavailable</small>
            </>
          ) : (
            <>
              <LoaderCircle size={20} className="animate-spin" />
              <small>Loading page…</small>
            </>
          )}
        </span>
      )}
    </span>
  );
}
