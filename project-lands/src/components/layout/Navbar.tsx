import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const session = await auth();
  return <NavbarClient isAdmin={isAdmin(session?.user)} />;
}
