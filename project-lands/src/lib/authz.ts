import type { Session } from "next-auth";

type SessionUser = Session["user"] | null | undefined;

export function canCreateListings(user: SessionUser): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.canCreateListings === true;
}

export function isAdmin(user: SessionUser): boolean {
  return user?.role === "ADMIN";
}
