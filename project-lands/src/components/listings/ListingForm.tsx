"use client";

import { useActionState, useState } from "react";
import type { ListingType } from "@prisma/client";
import type { ListingFormState } from "@/lib/actions/listings";
import { LISTING_TYPES, UTILITIES, isLandBased, type Building, type Utility } from "@/lib/property";
import type { ListingPolygon } from "@/types/listing";
import LocationPicker from "@/components/map/LocationPicker";
import BuildingsField from "./BuildingsField";

export type ListingFormDefaults = {
  type?: ListingType;
  title?: string;
  description?: string;
  price?: string;
  pricePerUnit?: string;
  area?: string;
  areaUnit?: string;
  address?: string;
  municipality?: string;
  city?: string;
  landPurpose?: string;
  plotNumber?: string;
  utilities?: Utility[];
  buildings?: Building[];
  location?: { lat: number; lng: number } | null;
  geometry?: ListingPolygon | null;
};

const inputClass = "border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600";

export default function ListingForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (state: ListingFormState, formData: FormData) => Promise<ListingFormState>;
  defaults?: ListingFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [type, setType] = useState<ListingType>(defaults?.type ?? "LAND");
  const landBased = isLandBased(type);

  return (
    <form action={formAction} className="max-w-2xl mx-auto flex flex-col gap-5">
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-brand-800 bg-brand-50 border border-brand-200 rounded px-3 py-2">
          {state.success}
        </p>
      )}

      <SectionTitle>Pagrindinė informacija</SectionTitle>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Tipas</span>
        <select name="type" value={type} onChange={(e) => setType(e.target.value as ListingType)} className={inputClass}>
          {LISTING_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <Field label="Pavadinimas" name="title" required defaultValue={defaults?.title} error={state.fieldErrors?.title} />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Aprašymas</span>
        <textarea name="description" rows={5} defaultValue={defaults?.description} className={inputClass} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Kaina (€)"
          name="price"
          type="number"
          step="0.01"
          required
          defaultValue={defaults?.price}
          error={state.fieldErrors?.price}
        />
        <Field
          label="Kaina už vienetą (€, nebūtina)"
          name="pricePerUnit"
          type="number"
          step="0.01"
          defaultValue={defaults?.pricePerUnit}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label={landBased ? "Sklypo plotas" : "Plotas"}
          name="area"
          type="number"
          step="0.0001"
          required
          defaultValue={defaults?.area}
          error={state.fieldErrors?.area}
        />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Ploto vienetas</span>
          <select name="areaUnit" defaultValue={defaults?.areaUnit ?? "ARE"} className={inputClass}>
            <option value="SQM">m²</option>
            <option value="ARE">a (aras)</option>
            <option value="HECTARE">ha (hektaras)</option>
          </select>
        </label>
      </div>

      <SectionTitle>Vieta</SectionTitle>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Savivaldybė" name="municipality" defaultValue={defaults?.municipality} />
        <Field label="Miestas / gyvenvietė" name="city" defaultValue={defaults?.city} />
      </div>

      <Field label="Adresas" name="address" defaultValue={defaults?.address} />

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Vieta žemėlapyje</span>
        <LocationPicker defaultPoint={defaults?.location} defaultGeometry={defaults?.geometry} />
        {(state.fieldErrors?.latitude || state.fieldErrors?.longitude || state.fieldErrors?.geometry) && (
          <span className="text-xs text-red-600">Neteisinga vieta arba sklypo ribos</span>
        )}
      </div>

      <SectionTitle>{landBased ? "Sklypas ir komunikacijos" : "Komunikacijos"}</SectionTitle>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Žemės paskirtis" name="landPurpose" defaultValue={defaults?.landPurpose} />
        <Field label="Sklypo / unikalus Nr." name="plotNumber" defaultValue={defaults?.plotNumber} />
      </div>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 text-sm font-medium text-gray-700">Komunikacijos</legend>
        {UTILITIES.map((utility) => (
          <label
            key={utility.value}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-800"
          >
            <input
              type="checkbox"
              name="utilities"
              value={utility.value}
              defaultChecked={defaults?.utilities?.includes(utility.value)}
              className="accent-brand-600"
            />
            {utility.label}
          </label>
        ))}
      </fieldset>

      <SectionTitle>Statiniai {landBased && <span className="font-normal text-gray-500">(jei yra)</span>}</SectionTitle>

      <BuildingsField defaultValue={defaults?.buildings} />
      {state.fieldErrors?.buildings && (
        <span className="text-xs text-red-600">Patikrinkite statinių duomenis (plotas, metai).</span>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 cursor-pointer rounded-md bg-brand-600 py-2.5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? "Saugoma..." : submitLabel}
      </button>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">{children}</h2>;
}

function Field({
  label,
  name,
  type = "text",
  step,
  required,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        name={name}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className={inputClass}
      />
      {error && <span className="text-xs text-red-600">{error[0]}</span>}
    </label>
  );
}
