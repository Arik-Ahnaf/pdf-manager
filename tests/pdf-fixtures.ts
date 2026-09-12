import {
  PDFDocument,
  PDFHexString,
  StandardFonts,
  degrees,
  rgb,
} from "pdf-lib";

// Generated test fixtures only; never included in the application bundle.
export async function fixturePdf(name: string, widths: number[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  widths.forEach((width, index) => {
    const page = pdf.addPage([width, 420]);
    page.drawRectangle({
      x: 20,
      y: 250,
      width: width - 40,
      height: 120,
      color: rgb(0.1 + index * 0.05, 0.5, 0.4),
    });
    page.drawText(`${name} PAGE ${index + 1}`, {
      x: 25,
      y: 210,
      size: 16,
      font,
    });
    if (index === 1) page.setRotation(degrees(90));
  });
  return new File(
    [Uint8Array.from(await pdf.save({ addDefaultPage: false })).buffer],
    name,
    { type: "application/pdf" },
  );
}

export async function encryptedFixture() {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  // A standard encryption dictionary exercises rejection before any content
  // processing; the app never asks pdf-lib to ignore encryption.
  pdf.context.trailerInfo.Encrypt = pdf.context.register(
    pdf.context.obj({
      Filter: "Standard",
      V: 1,
      R: 2,
      Length: 40,
      P: -4,
      O: PDFHexString.of("00".repeat(32)),
      U: PDFHexString.of("00".repeat(32)),
    }),
  );
  return new File(
    [Uint8Array.from(await pdf.save({ useObjectStreams: false })).buffer],
    "protected.pdf",
    { type: "application/pdf" },
  );
}
