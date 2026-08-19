import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Textarea({
  label,
  hint,
  error,
  className = "",
  id,
  required,
  ...props
}: Props) {
  const areaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={areaId} className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        id={areaId}
        aria-required={required}
        aria-invalid={Boolean(error)}
        className={`
          w-full rounded-xl border bg-white px-4 py-3
          text-slate-900 placeholder:text-slate-400 resize-y min-h-[120px]
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
