import Link from "next/link";
import { Sprout } from "lucide-react";

// Inherits its text color from the parent, so it works on light and dark backgrounds.
export default function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="LANDs.lt — pradžia"
      className="group flex items-center gap-2.5 font-display text-xl font-bold tracking-tight"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <Sprout className="size-5" strokeWidth={2.25} />
      </span>
      <span>
        LANDs<span className="opacity-55">.lt</span>
      </span>
    </Link>
  );
}
