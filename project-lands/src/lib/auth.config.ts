import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config for middleware (no Prisma/bcrypt). Full config: auth.ts.
export const authConfig = {
  pages: {
    signIn: "/admin/prisijungti",
  },
  providers: [],
} satisfies NextAuthConfig;
