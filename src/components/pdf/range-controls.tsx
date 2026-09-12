import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageRange } from "@/types/files";
import { rangePages } from "@/lib/utils/ranges";

export function RangeControls({
  ranges,
  total,
  disabled,
  quickText,
  quickError,
  onQuickText,
  onRanges,
}: {
  ranges: PageRange[];
  total: number;
  disabled: boolean;
  quickText: string | null;
  quickError: string | null;
  onQuickText: (value: string) => void;
  onRanges: (ranges: PageRange[]) => void;
}) {
  return (
    <fieldset disabled={disabled} className="range-fieldset">
      <legend className="sr-only">Page ranges</legend>
      <label className="field-label" htmlFor="quick-ranges">
        Enter pages or ranges
      </label>
      <input
        id="quick-ranges"
        className="range-text-input"
        value={
          quickText ??
          ranges
            .map((range) =>
              range.from && range.to
                ? range.from === range.to
                  ? range.from
                  : `${range.from}-${range.to}`
                : "",
            )
            .filter(Boolean)
            .join(", ")
        }
        placeholder="1-3, 5, 8-10"
        onChange={(event) => onQuickText(event.target.value)}
        aria-invalid={!!quickError}
        aria-describedby="quick-ranges-hint"
      />
      <p
        id="quick-ranges-hint"
        className={quickError ? "field-error" : "field-hint"}
        role={quickError ? "alert" : undefined}
      >
        {quickError ??
          `Separate ranges with commas, or use the controls below. ${total} pages available.`}
      </p>
      <div className="range-list">
        {ranges.map((range, index) => {
          const invalid =
            (range.from !== "" || range.to !== "") &&
            rangePages(range.from, range.to, total) === null;
          return (
            <div className="range-item" key={range.id}>
              <div className="range-item-heading">
                <span>Range {index + 1}</span>
                {ranges.length > 1 && (
                  <button
                    className="icon-button"
                    onClick={() =>
                      onRanges(ranges.filter((item) => item.id !== range.id))
                    }
                    aria-label={`Remove range ${index + 1}`}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className="range-inputs">
                <label htmlFor={`range-from-${range.id}`}>
                  From
                  <input
                    id={`range-from-${range.id}`}
                    type="number"
                    min={1}
                    max={total}
                    step={1}
                    inputMode="numeric"
                    value={range.from}
                    aria-invalid={invalid}
                    aria-describedby={
                      invalid ? `range-error-${range.id}` : undefined
                    }
                    onChange={(event) =>
                      onRanges(
                        ranges.map((item) =>
                          item.id === range.id
                            ? { ...item, from: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <span>—</span>
                <label htmlFor={`range-to-${range.id}`}>
                  To
                  <input
                    id={`range-to-${range.id}`}
                    type="number"
                    min={1}
                    max={total}
                    step={1}
                    inputMode="numeric"
                    value={range.to}
                    aria-invalid={invalid}
                    aria-describedby={
                      invalid ? `range-error-${range.id}` : undefined
                    }
                    onChange={(event) =>
                      onRanges(
                        ranges.map((item) =>
                          item.id === range.id
                            ? { ...item, to: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
              </div>
              {invalid && (
                <p
                  className="field-error"
                  id={`range-error-${range.id}`}
                  role="alert"
                >
                  Use whole page numbers from 1–{total}, with From ≤ To.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <Button
        variant="secondary"
        className="add-range-button w-full"
        disabled={disabled || ranges.length >= total}
        onClick={() =>
          onRanges([...ranges, { id: crypto.randomUUID(), from: "", to: "" }])
        }
      >
        <Plus size={15} />
        Add another range
      </Button>
    </fieldset>
  );
}
