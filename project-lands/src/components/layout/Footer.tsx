import Link from "next/link";
import Logo from "./Logo";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-xs text-stone-900">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-stone-500">{siteConfig.description}</p>
        </div>

        <nav className="flex gap-8 text-sm">
          <Link href="/skelbimai" className="text-stone-600 transition-colors hover:text-brand-700">
            Skelbimai
          </Link>
          <Link href="/#apie" className="text-stone-600 transition-colors hover:text-brand-700">
            Apie
          </Link>
          <Link href="/#kontaktai" className="text-stone-600 transition-colors hover:text-brand-700">
            Kontaktai
          </Link>
        </nav>
      </div>

      <div className="border-t border-stone-100 py-5 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {siteConfig.name}
      </div>
    </footer>
  );
}
