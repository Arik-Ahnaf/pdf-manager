import { PdfError } from "./errors.ts";
import { rangePages } from "../utils/ranges.ts";

// Each comma-delimited segment is one output in the existing ranges mode.
export function parsePageRanges(text: string, total: number): number[][] {
  if (!text.trim())
    throw new PdfError("Enter a page or range, such as 1–3, 5, 8–10.");
  return text.split(",").map((part) => {
    const match = /^\s*(\d+)\s*(?:[-–]\s*(\d+))?\s*$/.exec(part);
    const pages = match
      ? rangePages(match[1], match[2] ?? match[1], total)
      : null;
    if (!pages)
      throw new PdfError(
        `Use pages from 1 to ${total}, for example 1–3, 5. Ranges must start before they end.`,
      );
    return pages;
  });
}
