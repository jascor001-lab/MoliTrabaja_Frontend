"use client";

import { useEffect, useId, useState } from "react";

import {
  displayToIso,
  formatDateMask,
  isoToDisplay,
} from "@/lib/date-format";

type Props = {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function DateInput({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  disabled,
  className = "",
}: Props) {
  const inputId = useId();
  const [display, setDisplay] = useState(() => isoToDisplay(value));

  useEffect(() => {
    setDisplay(isoToDisplay(value));
  }, [value]);

  const handleChange = (raw: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const formatted = isoToDisplay(raw);
      setDisplay(formatted);
      onChange(raw);
      return;
    }

    const masked = formatDateMask(raw);
    setDisplay(masked);

    if (masked.length === 10) {
      onChange(displayToIso(masked) ?? "");
    } else {
      onChange("");
    }
  };

  return (
    <label htmlFor={inputId} className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="DD/MM/AAAA"
        maxLength={10}
        disabled={disabled}
        aria-required={required}
        value={display}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => {
          if (display.length > 0 && display.length < 10) {
            onChange("");
          }
        }}
        className={`
          w-full rounded-xl border border-emerald-100 bg-white px-4 py-3
          text-slate-900 placeholder:text-slate-400
          focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200
          disabled:bg-slate-50 disabled:text-slate-500
          ${className}
        `}
      />
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
