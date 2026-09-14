"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Nepavyko sukurti paskyros.");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });

    setIsSubmitting(false);

    if (result?.error) {
      router.push("/prisijungti");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-green-800">Registruotis</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Vardas</span>
        <input
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">El. paštas</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Slaptažodis</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <span className="text-xs text-gray-500">Bent 8 simboliai</span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-700 text-white font-semibold rounded-md py-2 hover:bg-green-800 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? "Kuriama..." : "Sukurti paskyrą"}
      </button>

      <p className="text-sm text-gray-600 text-center">
        Jau turite paskyrą?{" "}
        <Link href="/prisijungti" className="text-green-700 font-semibold hover:underline">
          Prisijunkite
        </Link>
      </p>
    </form>
  );
}
