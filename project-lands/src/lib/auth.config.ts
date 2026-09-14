import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the auth config: no Prisma adapter, no bcrypt, no
// providers with a Node-only `authorize`. Verifying an existing JWT session
// needs none of that, so this is what middleware (Edge runtime) uses. The
// full config in auth.ts adds the Credentials provider + Prisma adapter and
// only runs in the Node runtime (route handlers).
export const authConfig = {
  pages: {
    signIn: "/prisijungti",
  },
  providers: [],
} satisfies NextAuthConfig;
