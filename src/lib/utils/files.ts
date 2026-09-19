export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_FILES = 20;

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Metadata checks before reading a file. PDF validity is checked in lib/pdf/.
export function validateFiles(files: Pick<File, "name" | "type" | "size">[]) {
  if (files.length > MAX_FILES)
    return `Choose up to ${MAX_FILES} PDFs at a time.`;
  for (const file of files) {
    if (
      !/\.pdf$/i.test(file.name) ||
      (file.type && file.type !== "application/pdf")
    ) {
      return `“${file.name}” isn’t a PDF. Please choose a .pdf file.`;
    }
    if (file.size === 0)
      return `“${file.name}” is empty. Please choose another PDF.`;
    if (file.size > MAX_FILE_SIZE)
      return `“${file.name}” is too large. The limit is ${MAX_FILE_SIZE_MB} MB per file.`;
  }
  return null;
}
