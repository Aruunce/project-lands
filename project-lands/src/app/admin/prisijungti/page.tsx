import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Prisijungimas",
};

// Allow only same-site paths ("//x.com" and "/\x.com" count as external).
function safeCallbackUrl(url: string | undefined): string {
  if (!url || !url.startsWith("/") || /^\/[/\\]/.test(url)) return "/admin";
  return url;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const target = safeCallbackUrl(callbackUrl);

  const session = await auth();
  if (isAdmin(session?.user)) redirect(target);

  return (
    <main className="flex items-center justify-center min-h-[70vh] px-4">
      <LoginForm callbackUrl={target} />
    </main>
  );
}
