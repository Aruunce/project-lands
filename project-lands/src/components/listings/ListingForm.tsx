"use client";

import { useActionState } from "react";
import type { ListingFormState } from "@/lib/actions/listings";
import LocationPicker from "@/components/map/LocationPicker";

export type ListingFormDefaults = {
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
  location?: { lat: number; lng: number } | null;
};

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

      <Field label="Pavadinimas" name="title" required defaultValue={defaults?.title} error={state.fieldErrors?.title} />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Aprašymas</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={defaults?.description}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
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
          label="Kaina už arą/ha (€, nebūtina)"
          name="pricePerUnit"
          type="number"
          step="0.01"
          defaultValue={defaults?.pricePerUnit}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Plotas"
          name="area"
          type="number"
          step="0.0001"
          required
          defaultValue={defaults?.area}
          error={state.fieldErrors?.area}
        />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Ploto vienetas</span>
          <select
            name="areaUnit"
            defaultValue={defaults?.areaUnit ?? "ARE"}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="SQM">m²</option>
            <option value="ARE">a (aras)</option>
            <option value="HECTARE">ha (hektaras)</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Savivaldybė" name="municipality" defaultValue={defaults?.municipality} />
        <Field label="Miestas / gyvenvietė" name="city" defaultValue={defaults?.city} />
      </div>

      <Field label="Adresas" name="address" defaultValue={defaults?.address} />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Žemės paskirtis" name="landPurpose" defaultValue={defaults?.landPurpose} />
        <Field label="Sklypo Nr." name="plotNumber" defaultValue={defaults?.plotNumber} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Vieta žemėlapyje</span>
        <LocationPicker defaultValue={defaults?.location} />
        {(state.fieldErrors?.latitude || state.fieldErrors?.longitude) && (
          <span className="text-xs text-red-600">Neteisingos koordinatės</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-green-700 text-white font-semibold rounded-md py-2 hover:bg-green-800 transition-colors disabled:opacity-60"
      >
        {isPending ? "Saugoma..." : submitLabel}
      </button>
    </form>
  );
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
        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
      />
      {error && <span className="text-xs text-red-600">{error[0]}</span>}
    </label>
  );
}
