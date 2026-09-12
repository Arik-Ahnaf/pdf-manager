import Link from "next/link";
import { ArrowLeft, FileQuestionMark } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageContainer className="not-found">
      <FileQuestionMark size={36} strokeWidth={1.4} />
      <EmptyState
        title="This page is out of order"
        description="We couldn’t find that page. Your PDF tools are right this way."
      >
        <Link href="/" className={buttonStyles("primary")}>
          <ArrowLeft size={16} />
          Back to all tools
        </Link>
      </EmptyState>
    </PageContainer>
  );
}
