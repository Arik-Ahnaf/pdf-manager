import { Check } from "lucide-react";
import { PdfThumbnail } from "./pdf-thumbnail";
import type { PreviewSession } from "@/lib/pdf/previews";
import { cn } from "@/lib/utils/cn";

export function PageCard({
  page,
  selected,
  onSelect,
  session,
  unavailable,
  disabled,
}: {
  page: number;
  selected: boolean;
  onSelect: () => void;
  session: PreviewSession | null;
  unavailable?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn("page-card", selected && "page-card--selected")}
      onClick={onSelect}
      disabled={disabled}
      aria-label={`Page ${page}`}
      aria-pressed={selected}
    >
      <span className="page-card-paper">
        <PdfThumbnail session={session} page={page} unavailable={unavailable} />
        <span className="page-checkbox">
          {selected && <Check size={11} strokeWidth={3} />}
        </span>
      </span>
      <span className="page-card-label">{page}</span>
    </button>
  );
}
