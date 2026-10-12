"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Per daug bandymų prisijungti. Bandykite po 15 minučių.",
  totp_invalid: "Neteisingas kodas. Patikrinkite programėlę ir bandykite dar kartą.",
};

const inputClass =
  "border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600";

// Two steps: email + password, then (if 2FA is on) the authenticator code.
export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      code: needsCode ? code : "",
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      if (result.code === "totp_required") {
        setNeedsCode(true);
        return;
      }
      setError(ERROR_MESSAGES[result.code ?? ""] ?? "Neteisingas el. paštas arba slaptažodis.");
      setCode("");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function backToPassword() {
    setNeedsCode(false);
    setCode("");
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-brand-800">Administratoriaus prisijungimas</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {needsCode ? (
        <>
          <p className="text-sm text-gray-600">
            Įveskite 6 skaitmenų kodą iš autentifikavimo programėlės (pvz. Google Authenticator).
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Kodas</span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={7}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className={`${inputClass} text-center text-xl tracking-[0.4em]`}
            />
          </label>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">El. paštas</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Slaptažodis</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </label>
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer bg-brand-600 text-white font-semibold rounded-md py-2 hover:bg-brand-700 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? "Jungiamasi..." : needsCode ? "Patvirtinti" : "Prisijungti"}
      </button>

      {needsCode && (
        <button
          type="button"
          onClick={backToPassword}
          className="cursor-pointer text-sm text-gray-500 hover:text-gray-800"
        >
          ← Atgal
        </button>
      )}
    </form>
  );
}
