// UI selection helpers; these operate on numbers only, never PDF content.
export function rangePages(
  from: string,
  to: string,
  total: number,
): number[] | null {
  if (!Number.isSafeInteger(total) || total < 1) return null;
  if (!/^\d+$/.test(from) || !/^\d+$/.test(to)) return null;
  const start = Number(from);
  const end = Number(to);
  if (start < 1 || end > total || start > end) return null;
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function formatPageSelection(pages: number[]) {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const groups: string[] = [];
  for (let index = 0; index < sorted.length; index++) {
    const start = sorted[index];
    let end = start;
    while (sorted[index + 1] === end + 1) end = sorted[++index];
    groups.push(start === end ? `${start}` : `${start}–${end}`);
  }
  return groups.join(", ");
}
