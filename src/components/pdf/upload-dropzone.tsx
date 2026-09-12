"use client";

import { useRef, useState } from "react";
import {
  ArrowUp,
  FilePlus2,
  LockKeyhole,
  Plus,
  Upload,
  LoaderCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { validateFiles } from "@/lib/utils/files";

export function UploadDropzone({
  onFiles,
  compact = false,
  multiple = true,
  disabled = false,
  loading = false,
}: {
  onFiles: (files: File[]) => void;
  compact?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function selectFiles(files: File[]) {
    if (disabled || loading || !files.length) return;
    const message =
      !multiple && files.length > 1
        ? "Choose one PDF to split. You can merge multiple files with the Merge PDF tool."
        : validateFiles(files);
    setError(message);
    if (!message) onFiles(files);
  }
  return (
    <div
      className={cn(
        "upload-dropzone",
        compact && "upload-dropzone--compact",
        dragging && "upload-dropzone--active",
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        dragDepth.current++;
        if (!disabled && !loading) setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepth.current--;
        if (dragDepth.current <= 0) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth.current = 0;
        setDragging(false);
        selectFiles(Array.from(event.dataTransfer.files));
      }}
    >
      <input
        ref={input}
        className="hidden"
        type="file"
        accept=".pdf,application/pdf"
        multiple={multiple}
        disabled={disabled || loading}
        aria-label={multiple ? "Select PDF files" : "Select a PDF file"}
        onChange={(event) => {
          selectFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      {compact ? (
        <span className="compact-upload-icon">
          <Plus size={25} strokeWidth={1.5} />
        </span>
      ) : (
        <div className="upload-illustration" aria-hidden="true">
          <div className="upload-sheet upload-sheet--back" />
          <div className="upload-sheet">
            <FilePlus2 size={28} strokeWidth={1.4} />
            <span>PDF</span>
          </div>
          <span className="upload-arrow">
            <ArrowUp size={17} strokeWidth={2.5} />
          </span>
        </div>
      )}
      <h2>
        {loading
          ? "Reading your PDFs…"
          : dragging
            ? "Your PDFs are welcome here"
            : compact
              ? "Add your PDF files"
              : "Good things start with a PDF"}
      </h2>
      <p>
        {compact
          ? "Drop files here to get started"
          : "Drag & drop your files here, or choose them below."}
      </p>
      <Button
        onClick={() => input.current?.click()}
        disabled={disabled || loading}
        variant={compact ? "secondary" : "primary"}
      >
        {loading ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <Upload size={17} />
        )}
        {multiple ? "Choose PDF files" : "Choose a PDF file"}
      </Button>
      <span className="upload-limit">
        PDF files · Up to 50 MB each{multiple ? " · 20 files max" : ""}
      </span>
      {!compact && (
        <div className="upload-local">
          <LockKeyhole size={12} />
          Files stay on your device
        </div>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
