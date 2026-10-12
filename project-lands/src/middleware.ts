import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const LOGIN_PATH = "/admin/prisijungti";

// Only redirects anonymous visitors; the real check is requireAdmin() in src/lib/authz.ts.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (req.nextUrl.pathname === LOGIN_PATH) return;

  if (!req.auth) {
    const loginUrl = new URL(LOGIN_PATH, req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
