"use client";

import { useId } from "react";

type Props = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  existingFileName?: string;
  value: File | null;
  onChange: (file: File | null) => void;
};

export function PdfFileInput({
  label,
  hint,
  error,
  required,
  existingFileName,
  value,
  onChange,
}: Props) {
  const inputId = useId();

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
        {required && !existingFileName ? " *" : ""}
      </label>
      <input
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {value ? (
        <p className="text-xs text-emerald-700">Seleccionado: {value.name}</p>
      ) : existingFileName ? (
        <p className="text-xs text-slate-500">PDF actual: {existingFileName}</p>
      ) : null}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
