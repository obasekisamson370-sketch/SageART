import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline/70 bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="SageART home" className="rounded">
          <Logo />
        </Link>
        <a
          href="https://wa.me/2348064165252"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-hairline px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-energy hover:text-energy"
        >
          Contact artist
        </a>
      </div>
    </header>
  );
}
