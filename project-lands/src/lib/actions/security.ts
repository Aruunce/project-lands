"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { rateLimit } from "@/lib/rate-limit";
import { encryptTotpSecret, generateTotpSecret, normalizeCode, verifyStoredTotp } from "@/lib/totp";

const PAGE = "/admin/saugumas";

export type TotpFormState = { error?: string };

async function currentAdmin() {
  const session = await requireAdmin(PAGE);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { id: true, totpSecret: true, totpEnabledAt: true, totpLastStep: true },
  });
  return user;
}

function tooManyAttempts(userId: string): boolean {
  return !rateLimit(`totp-settings:${userId}`, 10, 15 * 60 * 1000);
}

// Step 1: create a new secret (not active until a code is confirmed).
export async function startTotpSetup(): Promise<void> {
  const user = await currentAdmin();
  if (user.totpEnabledAt) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: encryptTotpSecret(generateTotpSecret()), totpLastStep: null },
  });
  revalidatePath(PAGE);
}

// Step 2: the first valid code turns 2FA on.
export async function confirmTotpSetup(_prev: TotpFormState, formData: FormData): Promise<TotpFormState> {
  const user = await currentAdmin();
  if (user.totpEnabledAt || !user.totpSecret) return { error: "Pradėkite nustatymą iš naujo." };
  if (tooManyAttempts(user.id)) return { error: "Per daug bandymų. Bandykite po 15 minučių." };

  const step = verifyStoredTotp(user.totpSecret, normalizeCode(formData.get("code")), null);
  if (step === null) return { error: "Neteisingas kodas. Patikrinkite programėlę ir bandykite dar kartą." };

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabledAt: new Date(), totpLastStep: step },
  });
  revalidatePath(PAGE);
  return {};
}

export async function cancelTotpSetup(): Promise<void> {
  const user = await currentAdmin();
  if (user.totpEnabledAt) return;

  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null } });
  revalidatePath(PAGE);
}

// Turning 2FA off requires a current code.
export async function disableTotp(_prev: TotpFormState, formData: FormData): Promise<TotpFormState> {
  const user = await currentAdmin();
  if (!user.totpEnabledAt || !user.totpSecret) return {};
  if (tooManyAttempts(user.id)) return { error: "Per daug bandymų. Bandykite po 15 minučių." };

  const step = verifyStoredTotp(user.totpSecret, normalizeCode(formData.get("code")), user.totpLastStep);
  if (step === null) return { error: "Neteisingas kodas." };

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: null, totpEnabledAt: null, totpLastStep: null },
  });
  revalidatePath(PAGE);
  return {};
}
