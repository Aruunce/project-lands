import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "El. paštas", type: "email" },
        password: { label: "Slaptažodis", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          canCreateListings: user.canCreateListings,
        };
      },
    }),
  ],
  callbacks: {
    // Re-reads role/canCreateListings from the DB on every request (not just
    // at sign-in) so an admin revoking/granting listing rights takes effect
    // immediately, instead of waiting for the user's next login.
    jwt: async ({ token, user }) => {
      const userId = (user?.id as string | undefined) ?? (token.id as string | undefined);
      if (!userId) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, canCreateListings: true },
      });
      if (!dbUser) return token;

      token.id = dbUser.id;
      token.role = dbUser.role;
      token.canCreateListings = dbUser.canCreateListings;
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.canCreateListings = token.canCreateListings as boolean;
      return session;
    },
  },
});
