"use client";

import { ArrowLeft, ArrowRight, FileText, GripVertical, X } from "lucide-react";
import { formatFileSize } from "@/lib/utils/files";
import { cn } from "@/lib/utils/cn";
import type { WorkspaceFile } from "@/types/files";

export function FileCard({
  file,
  index,
  count,
  onRemove,
  onMove,
  onDragStart,
  onDrop,
  dragging,
  disabled = false,
}: {
  file: WorkspaceFile;
  index: number;
  count: number;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: () => void;
  onDrop: () => void;
  dragging: boolean;
  disabled?: boolean;
}) {
  return (
    <article
      className={cn("file-card", dragging && "file-card--dragging")}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled) onDrop();
      }}
    >
      <div className="file-card-top">
        <span className="file-order">{String(index + 1).padStart(2, "0")}</span>
        <span
          draggable={!disabled}
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", file.id);
            event.dataTransfer.effectAllowed = "move";
            onDragStart();
          }}
          className="file-drag-handle"
          aria-hidden="true"
          title="Drag to reorder"
        >
          <GripVertical size={17} />
        </span>
        <button
          className="icon-button file-remove"
          disabled={disabled}
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
        >
          <X size={15} />
        </button>
      </div>
      <div className="file-card-preview">
        <div className="local-file-preview">
          <FileText size={38} strokeWidth={1.2} />
          <span>PDF</span>
          <small>
            {file.pageCount} {file.pageCount === 1 ? "page" : "pages"}
          </small>
        </div>
      </div>
      <div className="file-card-info">
        <h3 title={file.name}>{file.name}</h3>
        <p>
          {file.pageCount} pages
          <span>·</span>
          {formatFileSize(file.size)}
        </p>
      </div>
      <div className="file-card-controls">
        <button
          className="icon-button"
          disabled={disabled || index === 0}
          onClick={() => onMove(-1)}
          aria-label={`Move ${file.name} earlier`}
        >
          <ArrowLeft size={15} />
        </button>
        <span>Move file</span>
        <button
          className="icon-button"
          disabled={disabled || index === count - 1}
          onClick={() => onMove(1)}
          aria-label={`Move ${file.name} later`}
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}
