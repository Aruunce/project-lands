"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-3 py-1 rounded-md text-green-700 font-semibold hover:bg-green-100 transition-colors duration-200"
    >
      Atsijungti
    </button>
  );
}
