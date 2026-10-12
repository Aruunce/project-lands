"use client";

import { useActionState } from "react";
import type { TotpFormState } from "@/lib/actions/security";

export default function TotpCodeForm({
  action,
  submitLabel,
  danger = false,
}: {
  action: (state: TotpFormState, formData: FormData) => Promise<TotpFormState>;
  submitLabel: string;
  danger?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={7}
          placeholder="123456"
          aria-label="6 skaitmenų kodas"
          className="w-full rounded-md border px-3 py-2 text-center text-lg tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-brand-600 sm:w-44"
        />
        <button
          type="submit"
          disabled={isPending}
          className={`cursor-pointer rounded-md px-4 py-2 font-semibold transition-colors disabled:opacity-60 ${
            danger
              ? "border border-red-600 text-red-600 hover:bg-red-50"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {isPending ? "Tikrinama..." : submitLabel}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
