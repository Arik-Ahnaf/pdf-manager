import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PageContainer({
  children,
  className,
  narrow = false,
}: {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        "page-container",
        narrow && "page-container--narrow",
        className,
      )}
    >
      {children}
    </div>
  );
}
