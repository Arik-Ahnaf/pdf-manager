import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SplitWorkspace } from "@/components/tools/split-workspace";

export const metadata: Metadata = { title: "Split PDF" };

export default function SplitPage() {
  return (
    <PageContainer className="tool-page">
      <SplitWorkspace />
    </PageContainer>
  );
}
