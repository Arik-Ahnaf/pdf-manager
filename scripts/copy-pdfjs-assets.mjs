import { cp, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "node_modules/pdfjs-dist");
const { version } = JSON.parse(
  await readFile(path.join(source, "package.json"), "utf8"),
);
const destination = path.join(root, "public/pdfjs", version);
await mkdir(destination, { recursive: true });
await cp(
  path.join(source, "build/pdf.worker.min.mjs"),
  path.join(destination, "pdf.worker.min.mjs"),
);
for (const folder of ["cmaps", "standard_fonts", "wasm", "iccs"]) {
  await cp(path.join(source, folder), path.join(destination, folder), {
    recursive: true,
  });
}
console.log(`PDF.js ${version} assets prepared for same-origin rendering.`);
