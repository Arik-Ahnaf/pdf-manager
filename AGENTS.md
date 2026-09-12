# Architecture

- Next.js App Router with TypeScript.
- All PDF processing must happen client-side.
- Never upload PDF content to our servers.
- Do not introduce a database or authentication.
- Use pdf-lib for manipulation.
- Use PDF.js only for rendering previews.
- PDF logic belongs in src/lib/pdf/.
- React components should not directly manipulate PDFs.
- Never store PDF contents in localStorage.
- Revoke object URLs when they are no longer needed.
- Prefer small composable components.
- Add tests for PDF utilities.
