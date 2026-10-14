"use client";

import { useState } from "react";
import Form from "next/form";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { LISTING_TYPES, UTILITIES } from "@/lib/property";
import { SORT_OPTIONS, type ListingFilters as Filters } from "@/lib/listing-filters";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-500";

// Leaves empty fields out of the URL (?tipas=&kaina_nuo= …).
function skipEmptyFields(event: React.FormEvent<HTMLFormElement>) {
  const fields = Array.from(event.currentTarget.elements) as HTMLInputElement[];
  const emptied = fields.filter((field) => field.name && !field.disabled && field.value === "");
  emptied.forEach((field) => (field.disabled = true));
  setTimeout(() => emptied.forEach((field) => (field.disabled = false)));
}

// Search box + a "Filtrai" button; the filter panel is shown only when expanded.
export default function ListingFilters({
  filters,
  municipalities,
  activeCount,
}: {
  filters: Filters;
  municipalities: string[];
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);
  const typeSlug = LISTING_TYPES.find((t) => t.value === filters.type)?.slug ?? "";

  return (
    <Form action="/skelbimai" onSubmit={skipEmptyFields} className="w-full max-w-3xl">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-stone-200 focus-within:ring-2 focus-within:ring-brand-500">
          <label className="flex flex-1 items-center gap-3 pl-3">
            <Search className="size-5 shrink-0 text-stone-400" aria-hidden="true" />
            <span className="sr-only">Paieška</span>
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder="Vietovė, savivaldybė ar pavadinimas"
              className="w-full bg-transparent py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="shrink-0 cursor-pointer rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Ieškoti
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="filters-panel"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200 transition-colors hover:bg-stone-50"
        >
          <SlidersHorizontal className="size-4" />
          Filtrai
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-xs text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div
        id="filters-panel"
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-3 grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-stone-700">Tipas</span>
              <select name="tipas" defaultValue={typeSlug} className={inputClass}>
                <option value="">Visi</option>
                {LISTING_TYPES.map((type) => (
                  <option key={type.value} value={type.slug}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-stone-700">Savivaldybė</span>
              <select name="savivaldybe" defaultValue={filters.municipality ?? ""} className={inputClass}>
                <option value="">Visos</option>
                {municipalities.map((municipality) => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>
            </label>

            <RangeField label="Kaina, €" names={["kaina_nuo", "kaina_iki"]} values={[filters.priceMin, filters.priceMax]} />
            <RangeField label="Plotas, a" names={["plotas_nuo", "plotas_iki"]} values={[filters.areaMin, filters.areaMax]} />

            <fieldset className="flex flex-col gap-1.5 sm:col-span-2">
              <legend className="mb-1.5 text-sm font-medium text-stone-700">Komunikacijos</legend>
              <div className="flex flex-wrap gap-2">
                {UTILITIES.map((utility) => (
                  <label
                    key={utility.value}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-stone-300 px-3 py-1.5 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-800"
                  >
                    <input
                      type="checkbox"
                      name="komunikacijos"
                      value={utility.value}
                      defaultChecked={filters.utilities.includes(utility.value)}
                      className="accent-brand-600"
                    />
                    {utility.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-stone-700">Rikiuoti</span>
              <select name="rikiuoti" defaultValue={filters.sort} className={inputClass}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="flex-1 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Rodyti rezultatus
              </button>
              <Link
                href="/skelbimai"
                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 ring-1 ring-stone-300 hover:bg-stone-50"
              >
                Išvalyti
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}

function RangeField({
  label,
  names,
  values,
}: {
  label: string;
  names: [string, string];
  values: [number | undefined, number | undefined];
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium text-stone-700">{label}</legend>
      <div className="flex items-center gap-2">
        <input
          name={names[0]}
          inputMode="decimal"
          placeholder="nuo"
          aria-label={`${label} nuo`}
          defaultValue={values[0] ?? ""}
          className={inputClass}
        />
        <span className="text-stone-400">–</span>
        <input
          name={names[1]}
          inputMode="decimal"
          placeholder="iki"
          aria-label={`${label} iki`}
          defaultValue={values[1] ?? ""}
          className={inputClass}
        />
      </div>
    </fieldset>
  );
}
