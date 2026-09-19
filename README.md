# Folio

A private PDF workspace built with Next.js App Router, TypeScript, Tailwind CSS, and Lucide. Merge and split PDFs entirely in your browser, with real page previews and downloadable results. No accounts, backend PDF APIs, database, or cloud storage.

## Development

Use the latest Node.js **22.x** (at least 22.13).

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Routes: `/`, `/merge`, `/split`, and `/privacy`.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

The dev and production build scripts copy PDF.js's worker, fonts, character maps, and rendering assets into a versioned `public/pdfjs/` directory. These generated assets are ignored by Git and recreated automatically; no PDF.js CDN is used. The worker is PDF.js's required rendering infrastructure, not a custom processing-worker system.

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Use the repository root as the root directory and the Next.js framework preset.
3. Deploy. `vercel.json` specifies `npm ci` and `npm run build`; `package.json` selects Node.js 22.x. Leave the output directory at its framework default.

No environment variables, storage services, or backend configuration are required. The build must run via `npm run build` so its `prebuild` step includes the local PDF.js assets. See [Vercel's build configuration documentation](https://vercel.com/docs/builds/configure-a-build).

## Features

- Upload or drop up to 20 PDFs, each up to 100 MB. Filenames, sizes, and page counts come from the actual documents. Corrupt, unsupported, empty, and encrypted PDFs produce readable errors.
- Dark theme by default, with a light/dark toggle beside the header privacy link on desktop and mobile. Only the theme preference is saved in localStorage; PDF contents are never persisted.
- Merge in the exact displayed order. Drag files, use keyboard-accessible move buttons, sort by name, remove files, or clear the workspace. Download the result as `merged.pdf`.
- Split using real PDF.js thumbnails. Select individual pages into one PDF, or enable the existing one-PDF-per-page option.
- Enter ranges such as `1-3, 5, 8-10`, or use the From/To controls. Each range creates a separate PDF, matching the existing interface. Download multiple outputs individually from the result links.
- Processing and import states disable conflicting actions. Generated downloads are cleared when their source files or selections change.
- Responsive navigation, file and page grids, visible keyboard focus, accessible control labels, and preserved empty states. No sample documents or footer.

## Privacy and implementation

`File` objects, source bytes, parsed documents, and generated blobs remain in browser memory. Refreshing or closing the tab clears the workspace. PDF bytes are never sent over the network or written to localStorage. Fonts and preview resources are served from the same origin as the app.

`pdf-lib` parses metadata and creates merged/split documents. Parsed sources are cached with weak keys and reused, never edited in place. PDF.js only renders previews; it receives a copy of source bytes so worker transfers cannot detach the originals. Visible thumbnails render serially at a maximum edge of 360 pixels. Preview tasks are canceled on cleanup, and generated object URLs are revoked when superseded or their workspace is unmounted.

## Structure

```text
src/
  app/                 App Router pages, global styles, metadata, favicon
  components/
    layout/            Navigation, page containers, workspace layout
    pdf/               Upload shells, file/page cards, thumbnails, ranges, actions
    tools/             Home, merge, and split workflow interfaces
    ui/                Buttons, badges, empty states
  data/                Tool definitions
  hooks/               In-memory selection, export state, preview lifecycle
  lib/
    pdf/               Parsing, merge/split, range parsing, previews, downloads
    utils/             File validation, formatting, numeric selection
  types/               File, download, and range types
scripts/               Build-time preparation of local PDF.js assets
tests/                 PDF utility tests and generated test-only fixtures
reference/             Original layout wireframes
```

## Design

The supplied wireframes define the composition: import first, two tool cards below, then a viewer on the left and options on the right in tool workspaces. Folio introduces original typography, a document mark, warm neutrals, teal actions, and quiet green document canvases. Workspaces stack on tablet and mobile, where toolbars and grids adapt to available space. There is no footer.

The app uses small native, accessible UI primitives; no component framework or state library is needed. DM Sans is bundled locally with `@fontsource-variable/dm-sans`; no font CDN request is made by visitors. Tailwind v4 is configured with its PostCSS plugin, with shared design styles in `globals.css`.

ESLint stays on version 9 because the React and accessibility plugins bundled by the current Next.js ESLint configuration do not yet support ESLint 10.

## Testing and limitations

Tests generate their own PDF fixtures and verify real page counts, merge order, page dimensions and rotation, split selections and multiple outputs, invalid ranges, file validation, encryption rejection, parsed-document caching, and object-URL cleanup.

Password-protected PDFs must be unlocked elsewhere before importing. Large documents may take time and consume significant browser memory; manipulation runs on the main thread. Downloads are individual PDFs, not ZIP archives. Copying pages does not promise preservation of document-level bookmarks, interactive form behavior, digital signatures, or all metadata. Review generated documents before relying on those features. OCR, compression, password handling, and other PDF tools are outside this phase.
