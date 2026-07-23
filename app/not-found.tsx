import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <p className="font-display text-6xl font-bold text-energy">404</p>
        <h1 className="mt-2 font-display text-xl font-semibold text-ink">Nothing on this wall</h1>
        <p className="mt-1 text-ink-soft">The page or portrait you&apos;re after doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-energy px-5 py-2.5 font-display text-sm font-semibold text-void"
        >
          Back to gallery
        </Link>
      </div>
    </div>
  );
}
