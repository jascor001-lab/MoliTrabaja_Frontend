"use client";

import { useId } from "react";

import { displayToIso } from "@/lib/date-format";

type Props = {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
};

function toIsoDate(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return displayToIso(raw) ?? "";
}

export function DateInput({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  disabled,
  min,
  max,
  className = "",
}: Props) {
  const inputId = useId();
  const iso = toIsoDate(value);

  return (
    <label htmlFor={inputId} className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        id={inputId}
        type="date"
        autoComplete="off"
        disabled={disabled}
        aria-required={required}
        aria-invalid={Boolean(error)}
        min={min}
        max={max}
        value={iso}
        onChange={(e) => onChange(e.target.value)}
        className={`
          h-12 w-full min-w-0 max-w-full rounded-xl border bg-white px-3 py-2.5
          text-slate-900 [color-scheme:light]
          focus:outline-none focus:ring-2
          disabled:bg-slate-50 disabled:text-slate-500
          [&::-webkit-calendar-picker-indicator]:ml-1
          [&::-webkit-datetime-edit]:min-w-0
          ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
              : "border-emerald-100 focus:border-emerald-400 focus:ring-emerald-200"
          }
          ${className}
        `}
      />
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
