"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, ShieldCheck, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/", label: "All tools" },
  { href: "/split", label: "Split PDF" },
  { href: "/merge", label: "Merge PDF" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          document.getElementById("mobile-menu-toggle")?.focus();
        }
      }}
    >
      <div className="header-inner">
        <Logo onNavigate={() => setOpen(false)} />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "nav-link",
                pathname === link.href && "nav-link--active",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/privacy"
          className="header-privacy"
          onClick={() => setOpen(false)}
        >
          <ShieldCheck size={17} />
          <span>Yours. Always private.</span>
          <ArrowUpRight size={14} />
        </Link>
        <button
          id="mobile-menu-toggle"
          className="icon-button mobile-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {[...links, { href: "/privacy", label: "Privacy" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
