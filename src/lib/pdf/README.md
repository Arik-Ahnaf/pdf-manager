# Browser-only PDF boundary

Keep PDF parsing and manipulation here, outside React components. Never call these utilities from server components, API routes, or server actions with uploaded document data.

- `documents.ts`: validates and reads files, rejects encrypted/corrupt PDFs, and caches read-only parsed sources using `pdf-lib`.
- `operations.ts`: creates new merge/split outputs with `pdf-lib`, preserving displayed file order and original page order within each split output.
- `ranges.ts`: parses comma-separated 1-based page ranges with strict document bounds.
- `previews.ts`: loads PDF.js lazily in the browser and provides a shared, cancellable preview session. Uses a local PDF.js worker and versioned same-origin assets prepared by the build script.
- `downloads.ts`: creates, triggers, and revokes blob-URL downloads. Owning hooks release URLs when inputs change or the workspace unmounts.
- `errors.ts`: safe user-facing processing errors.

Source files and bytes stay in memory. PDF.js receives a byte copy because its worker may transfer the supplied buffer. React hooks manage lifecycle and UI state; components invoke operations without importing PDF manipulation APIs. Utility tests and generated fixtures live in `tests/` and are not bundled into the app.
