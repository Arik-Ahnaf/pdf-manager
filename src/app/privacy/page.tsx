import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  EyeOff,
  FileLock2,
  HardDrive,
  ShieldCheck,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = { title: "Privacy" };

const principles = [
  {
    icon: HardDrive,
    title: "Your device. Your documents.",
    text: "Your PDFs are read, previewed, merged, and split entirely in your browser. PDF contents are never uploaded to our servers. Downloads are created right on your device.",
  },
  {
    icon: EyeOff,
    title: "A workspace without an account.",
    text: "There’s no sign-in, account, or document history. This app includes no analytics or advertising trackers, and the typeface is served locally.",
  },
  {
    icon: Database,
    title: "Nothing saved behind the scenes.",
    text: "Your files and generated PDFs live in temporary browser memory. Refreshing or closing the page clears the workspace. We don’t store your PDFs in localStorage or a database.",
  },
  {
    icon: FileLock2,
    title: "You choose what to keep.",
    text: "Arrange your documents, choose your pages, and download the result. Remove files when you’re finished to release them from the workspace. Password-protected PDFs must be unlocked before you add them.",
  },
];

export default function PrivacyPage() {
  return (
    <PageContainer className="privacy-page">
      <Link href="/" className="text-link">
        <ArrowLeft size={15} />
        Back to all tools
      </Link>
      <div className="privacy-hero">
        <span className="privacy-hero-icon">
          <ShieldCheck size={36} strokeWidth={1.4} />
        </span>
        <Badge tone="green">Private by design</Badge>
        <h1>
          Your files are your business.
          <br />
          <span>Let’s keep it that way.</span>
        </h1>
        <p>
          A useful tool shouldn’t need a copy of your documents.
          <br className="hidden sm:block" /> Here’s how Folio treats your files.
        </p>
      </div>
      <div className="privacy-grid">
        {principles.map(({ icon: Icon, title, text }) => (
          <section className="privacy-card" key={title}>
            <Icon size={24} strokeWidth={1.5} />
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
      </div>
      <div className="privacy-bottom">
        <p>Simple tools. A little more peace of mind.</p>
        <Link href="/" className={buttonStyles("secondary")}>
          Explore the tools
          <ArrowLeft size={15} className="rotate-180" />
        </Link>
      </div>
    </PageContainer>
  );
}
