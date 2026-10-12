import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { decryptTotpSecret, totpUri } from "@/lib/totp";
import { cancelTotpSetup, confirmTotpSetup, disableTotp, startTotpSetup } from "@/lib/actions/security";
import TotpCodeForm from "@/components/admin/TotpCodeForm";

export const metadata: Metadata = {
  title: "Saugumas",
};

export default async function SecurityPage() {
  const session = await requireAdmin("/admin/saugumas");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { email: true, totpSecret: true, totpEnabledAt: true },
  });

  const enabled = Boolean(user.totpEnabledAt);
  const pendingSecret = !enabled && user.totpSecret ? decryptTotpSecret(user.totpSecret) : null;
  const qrCode = pendingSecret
    ? await QRCode.toDataURL(totpUri(pendingSecret, user.email), { margin: 1, width: 220 })
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-brand-700">
        ← Skelbimų valdymas
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-brand-800">Saugumas</h1>

      <section className="mt-6 rounded-2xl border bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Dviejų žingsnių patvirtinimas</h2>
            <p className="mt-1 text-sm text-gray-600">
              Prisijungiant, be slaptažodžio, reikės 6 skaitmenų kodo iš autentifikavimo programėlės
              (Google Authenticator, Microsoft Authenticator ar kt.).
            </p>
          </div>
          {enabled && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800">
              <ShieldCheck className="size-4" /> Įjungta
            </span>
          )}
        </div>

        {enabled ? (
          <div className="mt-6 border-t pt-6">
            <p className="text-sm text-gray-600">
              Įjungta {user.totpEnabledAt!.toLocaleDateString("lt-LT")}. Norėdami išjungti, įveskite dabartinį
              kodą.
            </p>
            <div className="mt-3">
              <TotpCodeForm action={disableTotp} submitLabel="Išjungti" danger />
            </div>
          </div>
        ) : pendingSecret && qrCode ? (
          <div className="mt-6 grid gap-6 border-t pt-6 sm:grid-cols-[auto_1fr]">
            <img src={qrCode} alt="QR kodas autentifikavimo programėlei" width={220} height={220} className="rounded-lg border" />
            <div className="flex flex-col gap-4 text-sm">
              <p>
                <strong>1.</strong> Programėlėje pasirinkite „Pridėti paskyrą“ ir nuskenuokite QR kodą.
              </p>
              <p className="text-gray-600">
                Jei negalite nuskenuoti, įveskite raktą ranka:
                <code className="mt-1 block break-all rounded bg-gray-100 px-2 py-1 font-mono text-gray-900">
                  {pendingSecret.match(/.{1,4}/g)?.join(" ")}
                </code>
              </p>
              <div>
                <p className="mb-2">
                  <strong>2.</strong> Įveskite programėlėje rodomą kodą:
                </p>
                <TotpCodeForm action={confirmTotpSetup} submitLabel="Patvirtinti ir įjungti" />
              </div>
              <form action={cancelTotpSetup}>
                <button type="submit" className="cursor-pointer text-gray-500 hover:text-gray-800">
                  Atšaukti
                </button>
              </form>
            </div>
          </div>
        ) : (
          <form action={startTotpSetup} className="mt-6 border-t pt-6">
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-brand-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Įjungti
            </button>
          </form>
        )}
      </section>

      <p className="mt-6 text-sm text-gray-500">
        Pametėte telefoną? Paleiskite <code className="rounded bg-gray-100 px-1">npm run create-admin</code> su tuo
        pačiu el. paštu — bus galima pakeisti slaptažodį ir išjungti dviejų žingsnių patvirtinimą.
      </p>
    </main>
  );
}
