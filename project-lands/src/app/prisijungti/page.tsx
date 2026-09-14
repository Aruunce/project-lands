import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex items-center justify-center min-h-[70vh] px-4">
      <LoginForm callbackUrl={callbackUrl ?? "/"} />
    </main>
  );
}
