"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import LogoutButton from "@/components/LogoutButton";

const LINKS = [
  { href: "/skelbimai", label: "Skelbimai" },
  { href: "/#apie", label: "Apie" },
];

export default function NavbarClient({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  // Transparent over the homepage hero; solid everywhere else and once scrolled.
  const solid = !isHome || scrolled || menuOpen;
  const closeMenu = () => setMenuOpen(false);

  const linkClass = `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    solid ? "text-stone-600 hover:bg-stone-100 hover:text-stone-900" : "text-white/80 hover:bg-white/10 hover:text-white"
  }`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-300 ${
          menuOpen
            ? "bg-white text-stone-900 shadow-lg"
            : solid
              ? "bg-white/85 text-stone-900 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md"
              : "bg-transparent text-white"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo onClick={closeMenu} />

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <Link href="/admin" className={linkClass}>
                  Valdymas
                </Link>
                <LogoutButton className={`${linkClass} cursor-pointer`} />
              </>
            )}

            <Link
              href="/#kontaktai"
              className={`ml-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                solid
                  ? "bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md"
                  : "bg-white text-brand-900 hover:bg-brand-50"
              }`}
            >
              Susisiekti
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Uždaryti meniu" : "Atidaryti meniu"}
            className={`grid size-10 place-items-center rounded-lg transition-colors md:hidden ${
              solid ? "hover:bg-stone-100" : "hover:bg-white/10"
            }`}
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden ${
            menuOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}
        >
          <nav className="overflow-hidden">
            <div className="flex flex-col gap-1 border-t border-stone-200/70 px-4 pb-5 pt-3">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-base font-medium text-stone-700 hover:bg-stone-100"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-3 text-base font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Valdymas
                  </Link>
                  <LogoutButton className="rounded-lg px-3 py-3 text-left text-base font-medium text-stone-700 hover:bg-stone-100" />
                </>
              )}
              <Link
                href="/#kontaktai"
                onClick={closeMenu}
                className="mt-2 rounded-full bg-brand-600 px-5 py-3 text-center font-semibold text-white hover:bg-brand-700"
              >
                Susisiekti
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Spacer for the fixed header (on the homepage the hero sits under it). */}
      {!isHome && <div className="h-16" aria-hidden="true" />}
    </>
  );
}
