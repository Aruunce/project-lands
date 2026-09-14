import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Uses the edge-safe config only (no Prisma/bcrypt) — see auth.config.ts.
// Verifying a JWT session cookie doesn't touch the database, so this only
// checks "is logged in". The canCreateListings permission is intentionally
// NOT checked here: the JWT cookie's claim is only refreshed at sign-in, so
// checking it here would keep redirecting a just-approved user away from
// /skelbimai/naujas until their next login. That page (and the createListing
// action) do their own fresh, database-backed check instead — see
// src/app/skelbimai/naujas/page.tsx and src/lib/actions/listings.ts.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/prisijungti", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/mano-skelbimai/:path*", "/skelbimai/naujas"],
};
