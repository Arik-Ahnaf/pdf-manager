import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";

export function WorkspaceLayout({
  viewer,
  options,
}: {
  viewer: ReactNode;
  options: ReactNode;
}) {
  return (
    <>
      <div className="workspace-layout">
        <section className="workspace-viewer" aria-label="Document workspace">
          {viewer}
        </section>
        <aside className="options-panel" aria-label="Tool options">
          {options}
        </aside>
      </div>
      <p className="workspace-privacy">
        <LockKeyhole size={13} />
        Your files stay on your device.
        <Link href="/privacy">
          Learn about privacy
          <Arrow />
        </Link>
      </p>
    </>
  );
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
