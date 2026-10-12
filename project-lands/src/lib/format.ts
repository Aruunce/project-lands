import type { AreaUnit, ListingStatus, Prisma } from "@prisma/client";

type Numeric = number | string | Prisma.Decimal;

export const AREA_UNIT_LABELS: Record<AreaUnit, string> = { SQM: "m²", ARE: "a", HECTARE: "ha" };

export const STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: "Juodraštis",
  PUBLISHED: "Publikuotas",
  HIDDEN: "Paslėptas",
  SOLD: "Parduotas",
  ARCHIVED: "Archyvuotas",
};

// "45 000 €" for whole amounts, "12,50 €" when there are cents.
export function formatPrice(value: Numeric): string {
  const amount = Number(value);
  return new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Lithuanian plural forms: 1 skelbimas, 2 skelbimai, 10 skelbimų, 21 skelbimas.
export function pluralize(count: number, [one, few, many]: [string, string, string]): string {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 19) return many;
  if (lastDigit === 1) return one;
  if (lastDigit >= 2) return few;
  return many;
}

// "12,5 a", "1 250 m²"
export function formatArea(value: Numeric, unit: AreaUnit): string {
  const amount = new Intl.NumberFormat("lt-LT", { maximumFractionDigits: 4 }).format(Number(value));
  return `${amount} ${AREA_UNIT_LABELS[unit]}`;
}
