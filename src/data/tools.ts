export const pdfTools = [
  {
    id: "split",
    href: "/split",
    title: "Split PDF",
    description:
      "A few pages. A fresh start. Extract the pages you need from a single PDF.",
    action: "Split a document",
    detail: "One PDF, just the pages you need",
    color: "peach",
  },
  {
    id: "merge",
    href: "/merge",
    title: "Merge PDF",
    description:
      "Everything in one place. Bring multiple PDFs together in the order you choose.",
    action: "Bring files together",
    detail: "Multiple PDFs, one tidy document",
    color: "teal",
  },
] as const;
