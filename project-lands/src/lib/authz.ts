import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

type SessionUser = Session["user"] | null | undefined;

export function isAdmin(user: SessionUser): boolean {
  return user?.role === "ADMIN";
}

// Real authorization check for admin pages and actions (the role comes fresh from the DB).
export async function requireAdmin(callbackUrl = "/admin"): Promise<Session> {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user)) {
    redirect(`/admin/prisijungti?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}
