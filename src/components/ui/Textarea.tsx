import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function Textarea({ label, hint, className = "", id, ...props }: Props) {
  const areaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={areaId} className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        id={areaId}
        className={`
          w-full rounded-xl border border-emerald-100 bg-white px-4 py-3
          text-slate-900 placeholder:text-slate-400 resize-y min-h-[120px]
          focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200
          ${className}
        `}
        {...props}
      />
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
