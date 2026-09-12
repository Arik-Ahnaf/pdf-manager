import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeading({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/">All tools</Link>
        <ChevronRight size={13} />
        <span aria-current="page">{title}</span>
      </nav>
      <div className="page-heading-row">
        <div className="page-heading-content">
          {icon && <span className="tool-heading-icon">{icon}</span>}
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
