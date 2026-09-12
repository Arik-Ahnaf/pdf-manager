import { ArrowRight, Download, LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PdfDownload } from "@/types/files";

export function ActionToolbar({
  action,
  summary,
  disabled,
  processing,
  error,
  downloads,
  onAction,
}: {
  action: string;
  summary: string;
  disabled: boolean;
  processing: boolean;
  error: string | null;
  downloads: PdfDownload[];
  onAction: () => void;
}) {
  return (
    <div className="action-toolbar" aria-busy={processing}>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {downloads.length > 0 && (
        <div className="download-results">
          <p role="status">
            {downloads.length === 1
              ? "Your PDF is ready. Download it again below."
              : `${downloads.length} PDFs are ready. Download each file below.`}
          </p>
          {downloads.map((file) => (
            <a
              key={file.url}
              href={file.url}
              download={file.name}
              className="download-link"
            >
              <Download size={16} />
              <span>{file.name}</span>
            </a>
          ))}
        </div>
      )}
      <div className="action-summary">{summary}</div>
      <Button
        disabled={disabled || processing}
        className="w-full"
        onClick={onAction}
        aria-describedby="export-status"
      >
        {processing ? (
          <>
            <LoaderCircle size={17} className="animate-spin" />
            Creating your PDF{action === "Split PDF" ? "s" : ""}…
          </>
        ) : (
          <>
            {action}
            <ArrowRight size={17} />
          </>
        )}
      </Button>
      <p id="export-status" className="export-status" role="status">
        <LockKeyhole size={12} />
        {processing
          ? "Processing on your device"
          : "Processed privately in your browser"}
      </p>
    </div>
  );
}
