import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({
  label,
  hint,
  error,
  className = "",
  id,
  required,
  ...props
}: Props) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        id={inputId}
        aria-required={required}
        aria-invalid={Boolean(error)}
        className={`
          h-12 w-full min-w-0 rounded-xl border bg-white px-4 py-3
          text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2
          ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
              : "border-emerald-100 focus:border-emerald-400 focus:ring-emerald-200"
          }
          ${className}
        `}
        {...props}
      />
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
