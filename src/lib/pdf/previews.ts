import type { PDFDocumentProxy } from "pdfjs-dist";

export type PreviewSession = {
  render: (
    page: number,
    canvas: HTMLCanvasElement,
    signal: AbortSignal,
  ) => Promise<void>;
};

// Initialized only in browser effects. No PDF.js code runs during SSR.
export async function openPdfPreview(
  bytes: Uint8Array,
  signal: AbortSignal,
): Promise<PreviewSession> {
  const pdfjs = await import("pdfjs-dist");
  signal.throwIfAborted();
  const assetPath = `/pdfjs/${pdfjs.version}/`;
  pdfjs.GlobalWorkerOptions.workerSrc = `${assetPath}pdf.worker.min.mjs`;
  const task = pdfjs.getDocument({
    // PDF.js transfers its buffer; retain the original bytes for pdf-lib.
    data: bytes.slice(),
    cMapUrl: `${assetPath}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${assetPath}standard_fonts/`,
    wasmUrl: `${assetPath}wasm/`,
    iccUrl: `${assetPath}iccs/`,
    stopAtErrors: true,
    enableXfa: false,
  });
  const destroy = () => {
    void task.destroy().catch(() => undefined);
  };
  signal.addEventListener("abort", destroy, { once: true });
  let document: PDFDocumentProxy;
  try {
    document = await task.promise;
    signal.throwIfAborted();
  } catch (error) {
    signal.removeEventListener("abort", destroy);
    await task.destroy().catch(() => undefined);
    throw error;
  }

  // Render visible thumbnails one at a time, reusing the same parsed document.
  let queue: Promise<void> = Promise.resolve();
  return {
    render(pageNumber, canvas, pageSignal) {
      const pending = queue.then(async () => {
        signal.throwIfAborted();
        pageSignal.throwIfAborted();
        const page = await document.getPage(pageNumber);
        let release = () => {};
        try {
          signal.throwIfAborted();
          pageSignal.throwIfAborted();
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({
            scale: 360 / Math.max(base.width, base.height),
          });
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const render = page.render({ canvas, viewport });
          const cancel = () => render.cancel();
          pageSignal.addEventListener("abort", cancel, { once: true });
          signal.addEventListener("abort", cancel, { once: true });
          release = () => {
            pageSignal.removeEventListener("abort", cancel);
            signal.removeEventListener("abort", cancel);
          };
          await render.promise;
        } finally {
          release();
          page.cleanup();
        }
      });
      queue = pending.catch(() => undefined);
      return pending;
    },
  };
}
