import Link from "next/link";
import { ArrowRight, Combine, Scissors } from "lucide-react";
import { pdfTools } from "@/data/tools";

export function ToolCard({ tool }: { tool: (typeof pdfTools)[number] }) {
  const Icon = tool.id === "split" ? Scissors : Combine;
  return (
    <Link href={tool.href} className={`tool-card tool-card--${tool.color}`}>
      <div className="tool-card-top">
        <span className="tool-card-icon">
          <Icon size={25} strokeWidth={1.6} />
        </span>
        <span className="tool-card-arrow">
          <ArrowRight size={20} />
        </span>
      </div>
      <h3>{tool.title}</h3>
      <p>{tool.description}</p>
      <div className="tool-card-bottom">
        <span>{tool.detail}</span>
        <ArrowRight size={15} />
      </div>
    </Link>
  );
}
