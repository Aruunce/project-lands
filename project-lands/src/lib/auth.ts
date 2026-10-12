import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/lib/auth.config";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeCode, verifyStoredTotp } from "@/lib/totp";

// The `code` values are shown as messages by the login form.
class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

class TotpRequiredError extends CredentialsSignin {
  code = "totp_required";
}

class TotpInvalidError extends CredentialsSignin {
  code = "totp_invalid";
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
        code: { label: "Kodas", type: "text" },
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

        // Second step: code from the authenticator app, if 2FA is enabled.
        if (user.totpEnabledAt && user.totpSecret) {
          const code = normalizeCode(credentials.code);
          if (!code) throw new TotpRequiredError();

          const step = verifyStoredTotp(user.totpSecret, code, user.totpLastStep);
          if (step === null) throw new TotpInvalidError();

          await prisma.user.update({ where: { id: user.id }, data: { totpLastStep: step } });
        }

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
