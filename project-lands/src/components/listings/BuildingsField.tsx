"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  BUILDING_CONDITIONS,
  BUILDING_KINDS,
  type Building,
  type BuildingCondition,
  type BuildingKind,
} from "@/lib/property";

type Row = { kind: BuildingKind; area: string; yearBuilt: string; condition: string; description: string };

const inputClass = "border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600";

function toRow(building: Building): Row {
  return {
    kind: building.kind,
    area: building.area?.toString() ?? "",
    yearBuilt: building.yearBuilt?.toString() ?? "",
    condition: building.condition ?? "",
    description: building.description ?? "",
  };
}

function toBuilding(row: Row): Building {
  const area = Number.parseFloat(row.area.replace(",", "."));
  const yearBuilt = Number.parseInt(row.yearBuilt, 10);
  return {
    kind: row.kind,
    ...(area > 0 && { area }),
    ...(yearBuilt > 0 && { yearBuilt }),
    ...(row.condition && { condition: row.condition as BuildingCondition }),
    ...(row.description.trim() && { description: row.description.trim() }),
  };
}

// Buildings on the property (house, sauna, barn…). Submitted as a JSON `buildings` field.
export default function BuildingsField({ defaultValue }: { defaultValue?: Building[] }) {
  const [rows, setRows] = useState<Row[]>(() => (defaultValue ?? []).map(toRow));

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={index} className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:grid-cols-6">
          <label className="flex flex-col gap-1 sm:col-span-3">
            <span className="text-sm font-medium text-gray-700">Statinys</span>
            <select
              value={row.kind}
              onChange={(e) => update(index, { kind: e.target.value as BuildingKind })}
              className={inputClass}
            >
              {BUILDING_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 sm:col-span-3">
            <span className="text-sm font-medium text-gray-700">Būklė</span>
            <select
              value={row.condition}
              onChange={(e) => update(index, { condition: e.target.value })}
              className={inputClass}
            >
              <option value="">—</option>
              {BUILDING_CONDITIONS.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 sm:col-span-3">
            <span className="text-sm font-medium text-gray-700">Plotas (m²)</span>
            <input
              inputMode="decimal"
              value={row.area}
              onChange={(e) => update(index, { area: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-3">
            <span className="text-sm font-medium text-gray-700">Statybos metai</span>
            <input
              inputMode="numeric"
              maxLength={4}
              value={row.yearBuilt}
              onChange={(e) => update(index, { yearBuilt: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-6">
            <span className="text-sm font-medium text-gray-700">Aprašymas (nebūtina)</span>
            <textarea
              rows={2}
              value={row.description}
              onChange={(e) => update(index, { description: e.target.value })}
              placeholder="Pvz. medinis, 2 aukštai, šildymas krosnimi, renovuotas stogas…"
              className={inputClass}
            />
          </label>
          <div className="sm:col-span-6">
            <button
              type="button"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
            >
              <Trash2 className="size-4" /> Pašalinti statinį
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRows((current) => [...current, toRow({ kind: "house" })])}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        <Plus className="size-4" /> Pridėti statinį
      </button>

      <input type="hidden" name="buildings" value={JSON.stringify(rows.map(toBuilding))} />
    </div>
  );
}
