"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  Check,
  ChevronDown,
  FileText,
  Grid2X2,
  LayoutGrid,
  ListFilter,
  Scissors,
  X,
} from "lucide-react";
import { useFileSelection } from "@/hooks/use-file-selection";
import { usePdfExport } from "@/hooks/use-pdf-export";
import { usePdfPreviews } from "@/hooks/use-pdf-previews";
import { splitPdf } from "@/lib/pdf/operations";
import { parsePageRanges } from "@/lib/pdf/ranges";
import { pdfErrorMessage } from "@/lib/pdf/errors";
import type { PageRange, WorkspaceFile } from "@/types/files";
import { PageHeading } from "@/components/layout/page-heading";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { PageCard } from "@/components/pdf/page-card";
import { FilePicker } from "@/components/pdf/file-picker";
import { UploadDropzone } from "@/components/pdf/upload-dropzone";
import { ImportStatus } from "@/components/pdf/import-status";
import { RangeControls } from "@/components/pdf/range-controls";
import { ActionToolbar } from "@/components/pdf/action-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatFileSize } from "@/lib/utils/files";
import { formatPageSelection, rangePages } from "@/lib/utils/ranges";

export function SplitWorkspace() {
  const { files } = useFileSelection();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const file = files.find((file) => file.id === chosenId) ?? files[0] ?? null;
  return (
    <SplitEditor key={file?.id ?? "empty"} file={file} onChoose={setChosenId} />
  );
}

function SplitEditor({
  file,
  onChoose,
}: {
  file: WorkspaceFile | null;
  onChoose: (id: string) => void;
}) {
  const { files, setFiles, importFiles, loading, error, clearError } =
    useFileSelection();
  const [mode, setMode] = useState<"range" | "pages">("range");
  const [ranges, setRanges] = useState<PageRange[]>([
    { id: "initial-range", from: "", to: "" },
  ]);
  const [quickText, setQuickText] = useState<string | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [separate, setSeparate] = useState(false);
  const [large, setLarge] = useState(false);
  const rangeTab = useRef<HTMLButtonElement>(null);
  const pagesTab = useRef<HTMLButtonElement>(null);
  const totalPages = file?.pageCount ?? 0;
  const rangeSelections = ranges.map((range) =>
    rangePages(range.from, range.to, totalPages),
  );
  const invalidRange =
    !!quickError || rangeSelections.some((range) => range === null);
  const activePages =
    mode === "range"
      ? quickError
        ? []
        : [...new Set(rangeSelections.flatMap((range) => range ?? []))]
      : selected;
  const exporter = usePdfExport(
    JSON.stringify([file?.id, mode, ranges, quickText, selected, separate]),
  );
  const busy = loading || exporter.processing;
  const canSelect = !!file && !busy;
  const preview = usePdfPreviews(file?.bytes);

  function chooseMode(next: "range" | "pages") {
    if (next === "pages" && mode === "range") setSelected(activePages);
    setMode(next);
  }
  function handleTabKeys(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? "range"
        : event.key === "End"
          ? "pages"
          : mode === "range"
            ? "pages"
            : "range";
    chooseMode(next);
    (next === "range" ? rangeTab : pagesTab).current?.focus();
  }
  function updateQuickRanges(value: string) {
    setQuickText(value);
    try {
      const groups = parsePageRanges(value, totalPages);
      setRanges(
        groups.map((pages, index) => ({
          id: `quick-${index}`,
          from: String(pages[0]),
          to: String(pages[pages.length - 1]),
        })),
      );
      setQuickError(null);
    } catch (error) {
      setQuickError(pdfErrorMessage(error));
    }
  }
  function togglePage(page: number) {
    if (!canSelect) return;
    const current = mode === "range" ? activePages : selected;
    setSelected(
      current.includes(page)
        ? current.filter((value) => value !== page)
        : [...current, page],
    );
    setMode("pages");
  }
  function replaceFile(selectedFiles: File[]) {
    if (!busy) void importFiles(selectedFiles, true);
  }
  function generate() {
    if (
      !file ||
      busy ||
      !activePages.length ||
      (mode === "range" && invalidRange)
    )
      return;
    const groups =
      mode === "range"
        ? (rangeSelections as number[][])
        : separate
          ? [...selected].sort((a, b) => a - b).map((page) => [page])
          : [selected];
    void exporter.run(() => splitPdf(file, groups));
  }

  return (
    <>
      <PageHeading
        title="Split PDF"
        description="Keep what matters. Pick a range or choose individual pages."
        icon={<Scissors size={25} strokeWidth={1.7} />}
        action={<Badge tone="green">Local workspace</Badge>}
      />
      <fieldset disabled={busy} aria-busy={busy}>
        <legend className="sr-only">Split PDF workspace</legend>
        <WorkspaceLayout
          viewer={
            <>
              <div className="viewer-toolbar">
                <div className="viewer-title split-file-title">
                  <FileText size={18} />
                  <div>
                    <h2 title={file?.name}>{file?.name ?? "Your PDF"}</h2>
                    <span>
                      {file
                        ? `${totalPages} pages · ${formatFileSize(file.size)}`
                        : "Choose a document to get started"}
                    </span>
                  </div>
                </div>
                <div className="file-picker-actions">
                  <FilePicker
                    multiple={false}
                    onFiles={replaceFile}
                    disabled={busy}
                    variant="ghost"
                  >
                    {file ? "Change PDF" : "Choose PDF"}
                    <ChevronDown size={14} />
                  </FilePicker>
                  {file && (
                    <button
                      className="icon-button"
                      disabled={busy}
                      aria-label={`Remove ${file.name}`}
                      onClick={() => {
                        setFiles(files.filter((item) => item.id !== file.id));
                        clearError();
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              {files.length > 1 && (
                <div className="document-switch">
                  <label className="field-label" htmlFor="split-document">
                    Choose an uploaded PDF
                  </label>
                  <select
                    id="split-document"
                    value={file?.id}
                    onChange={(event) => onChoose(event.target.value)}
                  >
                    {files.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <ImportStatus loading={loading && !!file} error={error} />
              {preview.error && (
                <p className="field-error import-error" role="alert">
                  {preview.error}
                </p>
              )}
              <div className="viewer-subtoolbar">
                <span>
                  <span className="selection-dot" />
                  {activePages.length} of {totalPages} pages selected
                </span>
                <div
                  className="view-switch"
                  role="group"
                  aria-label="Thumbnail size"
                >
                  <button
                    disabled={!canSelect}
                    className={cn(
                      "icon-button",
                      !large && "view-switch--active",
                    )}
                    aria-label="Small thumbnails"
                    aria-pressed={!large}
                    onClick={() => setLarge(false)}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    disabled={!canSelect}
                    className={cn(
                      "icon-button",
                      large && "view-switch--active",
                    )}
                    aria-label="Large thumbnails"
                    aria-pressed={large}
                    onClick={() => setLarge(true)}
                  >
                    <Grid2X2 size={16} />
                  </button>
                </div>
              </div>
              <div className="split-canvas">
                {file ? (
                  <div className={cn("page-grid", large && "page-grid--large")}>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <PageCard
                        key={index}
                        page={index + 1}
                        selected={activePages.includes(index + 1)}
                        onSelect={() => togglePage(index + 1)}
                        session={preview.session}
                        unavailable={!!preview.error}
                        disabled={!canSelect}
                      />
                    ))}
                  </div>
                ) : (
                  <UploadDropzone
                    compact
                    multiple={false}
                    onFiles={replaceFile}
                    disabled={busy}
                    loading={loading}
                  />
                )}
              </div>
              <div className="viewer-bottom">
                <span>
                  {file
                    ? "Click a page to select it"
                    : "Your PDF stays on your device"}
                </span>
                {file && (
                  <Button
                    variant="ghost"
                    disabled={!canSelect}
                    onClick={() => {
                      setMode("pages");
                      setSelected(
                        activePages.length === totalPages
                          ? []
                          : Array.from(
                              { length: totalPages },
                              (_, index) => index + 1,
                            ),
                      );
                    }}
                  >
                    {activePages.length === totalPages
                      ? "Clear selection"
                      : "Select all"}
                  </Button>
                )}
              </div>
            </>
          }
          options={
            <>
              <div className="options-heading">
                <span className="options-step options-step--peach">01</span>
                <div>
                  <h2>Make the cut</h2>
                  <p>A whole document. Your chosen pages.</p>
                </div>
              </div>
              <div className="options-body split-options">
                <div
                  className="segmented-tabs"
                  role="tablist"
                  aria-label="Split method"
                >
                  <button
                    ref={rangeTab}
                    id="range-tab"
                    role="tab"
                    aria-selected={mode === "range"}
                    aria-controls="range-panel"
                    tabIndex={mode === "range" ? 0 : -1}
                    className={cn(mode === "range" && "segmented-tab--active")}
                    onClick={() => chooseMode("range")}
                    onKeyDown={handleTabKeys}
                  >
                    <ListFilter size={16} />
                    Page ranges
                  </button>
                  <button
                    ref={pagesTab}
                    id="pages-tab"
                    role="tab"
                    aria-selected={mode === "pages"}
                    aria-controls="pages-panel"
                    tabIndex={mode === "pages" ? 0 : -1}
                    className={cn(mode === "pages" && "segmented-tab--active")}
                    onClick={() => chooseMode("pages")}
                    onKeyDown={handleTabKeys}
                  >
                    <LayoutGrid size={15} />
                    Select pages
                  </button>
                </div>
                {mode === "range" ? (
                  <div
                    id="range-panel"
                    role="tabpanel"
                    aria-labelledby="range-tab"
                    tabIndex={0}
                    className="split-mode-panel"
                  >
                    <h3>Choose your page ranges</h3>
                    <p className="field-hint">
                      Each range becomes a separate PDF.
                    </p>
                    <RangeControls
                      ranges={ranges}
                      total={totalPages}
                      disabled={!canSelect}
                      quickText={quickText}
                      quickError={quickError}
                      onQuickText={updateQuickRanges}
                      onRanges={(ranges) => {
                        setRanges(ranges);
                        setQuickText(null);
                        setQuickError(null);
                      }}
                    />
                  </div>
                ) : (
                  <div
                    id="pages-panel"
                    role="tabpanel"
                    aria-labelledby="pages-tab"
                    tabIndex={0}
                    className="split-mode-panel"
                  >
                    <h3>Pick just the pages you need</h3>
                    <p className="field-hint">
                      Click the thumbnails to select or deselect pages.
                    </p>
                    <div className="selected-pages-box">
                      <span className="field-label">Selected pages</span>
                      <p>
                        {activePages.length
                          ? formatPageSelection(activePages)
                          : "No pages selected"}
                      </p>
                    </div>
                    <div className="selection-actions">
                      <Button
                        variant="ghost"
                        disabled={!canSelect}
                        onClick={() =>
                          setSelected(
                            Array.from(
                              { length: totalPages },
                              (_, index) => index + 1,
                            ),
                          )
                        }
                      >
                        Select all
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={!canSelect || !selected.length}
                        onClick={() => setSelected([])}
                      >
                        Clear
                      </Button>
                    </div>
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        disabled={!canSelect}
                        checked={separate}
                        onChange={(event) => setSeparate(event.target.checked)}
                      />
                      <span>
                        <strong>One PDF per page</strong>
                        <small>
                          Save each selected page as a separate file.
                        </small>
                      </span>
                    </label>
                  </div>
                )}
                <div className="selection-summary">
                  <span className="selection-summary-icon">
                    <Check size={17} />
                  </span>
                  <div>
                    <strong>{activePages.length} pages selected</strong>
                    <span>
                      {!file
                        ? "Add a PDF to choose pages"
                        : mode === "range"
                          ? invalidRange
                            ? "Enter valid page ranges"
                            : `${ranges.length} ${ranges.length === 1 ? "range" : "ranges"} · ${ranges.length} ${ranges.length === 1 ? "PDF" : "PDFs"}`
                          : separate
                            ? `${activePages.length} separate PDFs`
                            : activePages.length
                              ? "Save together as 1 PDF"
                              : "Select a page to get started"}
                    </span>
                  </div>
                </div>
                <div className="quiet-tip">
                  <span>A small tip</span>
                  <p>
                    You can select pages directly in the preview. We’ll switch
                    to “Select pages” for you.
                  </p>
                </div>
              </div>
              <ActionToolbar
                action="Split PDF"
                summary={
                  activePages.length
                    ? `${activePages.length} pages, just the ones you need`
                    : "Select pages to start your new document"
                }
                disabled={
                  busy ||
                  !file ||
                  !activePages.length ||
                  (mode === "range" && invalidRange)
                }
                processing={exporter.processing}
                error={exporter.error}
                downloads={exporter.downloads}
                onAction={generate}
              />
            </>
          }
        />
      </fieldset>
      <p role="status" aria-live="polite" className="sr-only">
        {activePages.length} pages selected.
      </p>
    </>
  );
}
