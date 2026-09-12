"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Monitor,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useFileSelection } from "@/hooks/use-file-selection";
import { formatFileSize } from "@/lib/utils/files";
import { ImportStatus } from "@/components/pdf/import-status";
import { UploadDropzone } from "@/components/pdf/upload-dropzone";
import { ToolCard } from "./tool-card";
import { pdfTools } from "@/data/tools";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";

export function HomeWorkspace() {
  const { files, setFiles, importFiles, loading, error, clearError } =
    useFileSelection();
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="eyebrow">
          <span />A little less paperwork
        </div>
        <h1 id="home-title">
          Your PDFs. <span>In good order.</span>
        </h1>
        <p>
          Bring your files together. Or take just the pages you need.
          <br className="hidden sm:block" /> A simpler space for your everyday
          PDF tasks.
        </p>
      </section>
      <section aria-label="Import PDF files" className="home-upload">
        <ImportStatus loading={loading && files.length > 0} error={error} />
        {files.length ? (
          <div className="imported-panel">
            <div className="imported-heading">
              <div>
                <Badge tone="green">
                  <Check size={12} />
                  {files.length} {files.length === 1 ? "file" : "files"}{" "}
                  selected
                </Badge>
                <h2>A good start. What’s next?</h2>
                <p>Choose a tool below to arrange your files.</p>
              </div>
              <Button
                disabled={loading}
                variant="ghost"
                onClick={() => {
                  setFiles([]);
                  clearError();
                }}
              >
                Clear all
                <X size={15} />
              </Button>
            </div>
            <div className="imported-files">
              {files.map((file) => (
                <div key={file.id} className="imported-file">
                  <FileText size={22} />
                  <div>
                    <span title={file.name}>{file.name}</span>
                    <small>
                      {file.pageCount} pages · {formatFileSize(file.size)}
                    </small>
                  </div>
                  <button
                    className="icon-button"
                    disabled={loading}
                    onClick={() =>
                      setFiles(files.filter((item) => item.id !== file.id))
                    }
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="imported-actions">
              <span>Your PDFs are ready. Everything stays on your device.</span>
              <Link
                href={files.length > 1 ? "/merge" : "/split"}
                className={buttonStyles("primary")}
              >
                {files.length > 1
                  ? "Open merge workspace"
                  : "Open split workspace"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <UploadDropzone onFiles={importFiles} loading={loading} />
        )}
      </section>
      <section className="home-tools" aria-labelledby="tools-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow-text">SMALL TOOLS. BIG DIFFERENCE.</span>
            <h2 id="tools-title">Make your next move.</h2>
          </div>
          <span className="section-caption">
            Two essentials. No unnecessary extras.
          </span>
        </div>
        <div className="tool-grid">
          {pdfTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
      <div className="home-assurances" aria-label="Our approach">
        <span>
          <ShieldCheck size={16} />
          Private by design
        </span>
        <span>
          <Monitor size={16} />
          Right in your browser
        </span>
        <span>
          <Sparkles size={16} />
          Refreshingly simple
        </span>
      </div>
    </>
  );
}
