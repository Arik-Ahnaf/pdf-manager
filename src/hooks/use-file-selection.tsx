"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { WorkspaceFile } from "@/types/files";
import { readPdfFiles } from "@/lib/pdf/documents";
import { pdfErrorMessage } from "@/lib/pdf/errors";
import { MAX_FILES } from "@/lib/utils/files";

const FileSelectionContext = createContext<{
  files: WorkspaceFile[];
  setFiles: Dispatch<SetStateAction<WorkspaceFile[]>>;
  importFiles: (files: File[], replace?: boolean) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
} | null>(null);

export function FileSelectionProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const importing = useRef(false);

  async function importFiles(selected: File[], replace = false) {
    if (importing.current || !selected.length) return;
    if ((replace ? 0 : files.length) + selected.length > MAX_FILES) {
      setError(
        `You can arrange up to ${MAX_FILES} PDFs. Remove a file to add another.`,
      );
      return;
    }
    importing.current = true;
    setLoading(true);
    setError(null);
    try {
      const added = await readPdfFiles(selected);
      setFiles((current) => (replace ? added : [...current, ...added]));
    } catch (error) {
      setError(pdfErrorMessage(error));
    } finally {
      importing.current = false;
      setLoading(false);
    }
  }
  return (
    <FileSelectionContext.Provider
      value={{
        files,
        setFiles,
        importFiles,
        loading,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </FileSelectionContext.Provider>
  );
}

export function useFileSelection() {
  const context = useContext(FileSelectionContext);
  if (!context)
    throw new Error("useFileSelection requires FileSelectionProvider");
  return context;
}
