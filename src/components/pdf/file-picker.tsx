"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { validateFiles } from "@/lib/utils/files";

export function FilePicker({
  onFiles,
  multiple = true,
  children,
  variant = "secondary",
  className,
  disabled = false,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className={className}>
      <input
        ref={input}
        type="file"
        accept=".pdf,application/pdf"
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        aria-label={multiple ? "Choose PDF files" : "Choose a PDF file"}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) {
            const message = validateFiles(files);
            setError(message);
            if (!message) onFiles(files);
          }
          event.target.value = "";
        }}
      />
      <Button
        disabled={disabled}
        variant={variant}
        onClick={() => input.current?.click()}
      >
        {children}
      </Button>
      {error && (
        <p className="field-error picker-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
