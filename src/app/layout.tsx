import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { FileSelectionProvider } from "@/hooks/use-file-selection";
import { themeInitScript } from "@/lib/utils/theme";

export const metadata: Metadata = {
  title: {
    default: "Folio — Your PDFs, in good order",
    template: "%s · Folio",
  },
  description:
    "A simpler space for everyday PDF tasks. Explore private, browser-based merge and split workspaces with Folio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <FileSelectionProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </FileSelectionProvider>
      </body>
    </html>
  );
}
