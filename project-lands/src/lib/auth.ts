import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/lib/auth.config";
import { clientIp, rateLimit } from "@/lib/rate-limit";

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

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
      authorize: async (credentials, request) => {
        // Slow down password guessing.
        if (!rateLimit(`login:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
          throw new RateLimitedError();
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;

        // Only admins may sign in.
        if (user.role !== "ADMIN") return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // Re-read the role on every request, so revoking admin works immediately.
    jwt: async ({ token, user }) => {
      const userId = (user?.id as string | undefined) ?? (token.id as string | undefined);
      if (!userId) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });
      if (!dbUser) return null; // user was deleted: end the session

      token.id = dbUser.id;
      token.role = dbUser.role;
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
});
