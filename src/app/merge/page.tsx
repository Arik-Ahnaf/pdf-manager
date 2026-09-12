import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { MergeWorkspace } from "@/components/tools/merge-workspace";

export const metadata: Metadata = { title: "Merge PDF" };

export default function MergePage() {
  return (
    <PageContainer className="tool-page">
      <MergeWorkspace />
    </PageContainer>
  );
}
