import Link from "next/link";
import { auth } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow-md sticky top-0 bg-white z-50">
      <Link href="/" className="text-2xl font-bold text-green-700">
        🌱 LANDs.lt
      </Link>
      <nav className="space-x-2 hidden md:flex items-center">
        <a
          href="#lands"
          className="inline-block px-3 py-1 rounded-md text-green-700 font-semibold hover:bg-green-100 transition-colors duration-200"
        >
          Skelbimai
        </a>
        <a
          href="#about"
          className="inline-block px-3 py-1 rounded-md text-green-700 font-semibold hover:bg-green-100 transition-colors duration-200"
        >
          Apie
        </a>
        <a
          href="#contact"
          className="inline-block px-3 py-1 rounded-md text-green-700 font-semibold hover:bg-green-100 transition-colors duration-200"
        >
          Kontaktai
        </a>

        {session?.user ? (
          <>
            <Link
              href="/mano-skelbimai"
              className="inline-block px-3 py-1 rounded-md text-green-700 font-semibold hover:bg-green-100 transition-colors duration-200"
            >
              Mano skelbimai
            </Link>
            <span className="px-3 text-sm text-gray-500">{session.user.name ?? session.user.email}</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link
              href="/prisijungti"
              className="inline-block px-3 py-1 rounded-md text-green-700 font-semibold hover:bg-green-100 transition-colors duration-200"
            >
              Prisijungti
            </Link>
            <Link
              href="/registruotis"
              className="inline-block px-3 py-1 rounded-md bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors duration-200"
            >
              Registruotis
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
