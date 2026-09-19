"use client";

import { useRef, useState } from "react";
import {
  ArrowDownAZ,
  ArrowRight,
  Combine,
  Files,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useFileSelection } from "@/hooks/use-file-selection";
import { usePdfExport } from "@/hooks/use-pdf-export";
import { mergePdfs } from "@/lib/pdf/operations";
import { PageHeading } from "@/components/layout/page-heading";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { FileCard } from "@/components/pdf/file-card";
import { FilePicker } from "@/components/pdf/file-picker";
import { UploadDropzone } from "@/components/pdf/upload-dropzone";
import { ImportStatus } from "@/components/pdf/import-status";
import { ActionToolbar } from "@/components/pdf/action-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFileSize, MAX_FILE_SIZE_MB } from "@/lib/utils/files";

export function MergeWorkspace() {
  const { files, setFiles, importFiles, loading, error, clearError } =
    useFileSelection();
  const exporter = usePdfExport(files.map((file) => file.id).join(","));
  const busy = loading || exporter.processing;
  const [announcement, setAnnouncement] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const dragged = useRef<string | null>(null);
  const pageCount = files.reduce((sum, file) => sum + file.pageCount, 0);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  function addFiles(selected: File[]) {
    if (!busy) void importFiles(selected);
  }
  function moveFile(from: number, to: number) {
    if (busy || from < 0 || to < 0 || to >= files.length || from === to) return;
    const updated = [...files];
    const [file] = updated.splice(from, 1);
    updated.splice(to, 0, file);
    setFiles(updated);
    setAnnouncement(
      `${file.name} moved to position ${to + 1} of ${files.length}.`,
    );
  }
  return (
    <>
      <PageHeading
        title="Merge PDF"
        description="Bring your documents together. Put them in the perfect order."
        icon={<Combine size={25} strokeWidth={1.7} />}
        action={<Badge tone="green">Local workspace</Badge>}
      />
      <fieldset disabled={busy} aria-busy={busy}>
        <legend className="sr-only">Merge PDF workspace</legend>
        <WorkspaceLayout
          viewer={
            <>
              <div className="viewer-toolbar">
                <div className="viewer-title">
                  <Files size={18} />
                  <h2>Your files</h2>
                  <Badge>{files.length}</Badge>
                </div>
                <FilePicker onFiles={addFiles} disabled={busy}>
                  <Plus size={16} />
                  Add PDFs
                </FilePicker>
              </div>
              <div className="viewer-subtoolbar">
                <span>
                  <GripVertical size={14} />
                  Drag to reorder, or use the arrows
                </span>
                <Button
                  variant="ghost"
                  disabled={busy || files.length < 2}
                  onClick={() => {
                    setFiles(
                      [...files].sort((a, b) => a.name.localeCompare(b.name)),
                    );
                    setAnnouncement("Files sorted by name.");
                  }}
                >
                  <ArrowDownAZ size={16} />
                  <span>Sort by name</span>
                </Button>
              </div>
              <ImportStatus
                loading={loading && files.length > 0}
                error={error}
              />
              <div
                className="merge-canvas"
                onDragEnd={() => {
                  dragged.current = null;
                  setDragging(null);
                }}
                onDragOver={(event) => {
                  if (event.dataTransfer.types.includes("Files"))
                    event.preventDefault();
                }}
                onDrop={(event) => {
                  if (event.dataTransfer.files.length) {
                    event.preventDefault();
                    addFiles(Array.from(event.dataTransfer.files));
                  }
                }}
              >
                {files.length ? (
                  <div className="file-grid">
                    {files.map((file, index) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        index={index}
                        count={files.length}
                        disabled={busy}
                        onRemove={() => {
                          setFiles(files.filter((item) => item.id !== file.id));
                          setAnnouncement(`${file.name} removed.`);
                          clearError();
                        }}
                        onMove={(direction) =>
                          moveFile(index, index + direction)
                        }
                        dragging={dragging === file.id}
                        onDragStart={() => {
                          dragged.current = file.id;
                          setDragging(file.id);
                        }}
                        onDrop={() => {
                          moveFile(
                            files.findIndex(
                              (item) => item.id === dragged.current,
                            ),
                            index,
                          );
                          dragged.current = null;
                          setDragging(null);
                        }}
                      />
                    ))}
                    <div className="add-file-tile">
                      <span>
                        <Plus size={25} strokeWidth={1.4} />
                      </span>
                      <FilePicker
                        onFiles={addFiles}
                        disabled={busy}
                        variant="ghost"
                      >
                        Add more files
                      </FilePicker>
                      <small>
                        Or drop PDFs here · Up to {MAX_FILE_SIZE_MB} MB each
                      </small>
                    </div>
                  </div>
                ) : (
                  <UploadDropzone
                    compact
                    onFiles={addFiles}
                    disabled={busy}
                    loading={loading}
                  />
                )}
              </div>
              <div className="viewer-bottom">
                <span>
                  {files.length} {files.length === 1 ? "file" : "files"} ·{" "}
                  {pageCount} pages · {formatFileSize(totalSize)}
                </span>
                <Button
                  variant="ghost"
                  disabled={busy || !files.length}
                  onClick={() => {
                    setFiles([]);
                    clearError();
                    setAnnouncement("All files removed.");
                  }}
                >
                  <Trash2 size={14} />
                  Clear all
                </Button>
              </div>
            </>
          }
          options={
            <>
              <div className="options-heading">
                <span className="options-step">01</span>
                <div>
                  <h2>One tidy document</h2>
                  <p>Your files, brought together.</p>
                </div>
              </div>
              <div className="options-body">
                <div className="merge-diagram" aria-hidden="true">
                  <span className="mini-document">PDF</span>
                  <span className="mini-document mini-document--offset">
                    PDF
                  </span>
                  <ArrowRight size={21} />
                  <span className="mini-document mini-document--merged">
                    <Combine size={21} />
                  </span>
                </div>
                <div className="option-section">
                  <label htmlFor="output-name" className="field-label">
                    File name
                  </label>
                  <div className="input-with-suffix">
                    <input id="output-name" value="merged" readOnly />
                    <span>.pdf</span>
                  </div>
                  <p className="field-hint">
                    Your combined document downloads as merged.pdf.
                  </p>
                </div>
                <div className="summary-card">
                  <div>
                    <span>Selected files</span>
                    <strong>{files.length} PDFs</strong>
                  </div>
                  <div>
                    <span>Total pages</span>
                    <strong>{pageCount}</strong>
                  </div>
                  <div>
                    <span>Combined file size</span>
                    <strong>{formatFileSize(totalSize)}</strong>
                  </div>
                </div>
                <div className="quiet-tip">
                  <span>Good to know</span>
                  <p>
                    The order on the left is the order in your merged document.
                    Add, remove, and rearrange until it feels right.
                  </p>
                </div>
              </div>
              <ActionToolbar
                action="Merge PDF"
                summary={
                  files.length < 2
                    ? "Add at least 2 PDFs to merge"
                    : `${files.length} PDFs → 1 document`
                }
                disabled={busy || files.length < 2}
                processing={exporter.processing}
                error={exporter.error}
                downloads={exporter.downloads}
                onAction={() => void exporter.run(() => mergePdfs(files))}
              />
            </>
          }
        />
      </fieldset>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
