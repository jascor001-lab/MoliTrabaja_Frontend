"use client";

import { KeyboardEvent } from "react";

type Props = {
  label: string;
  placeholder?: string;
  tags: string[];
  value: string;
  onChange: (value: string) => void;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  suggestions?: string[];
};

export function TagInput({
  label,
  placeholder = "Escribe y presiona Enter",
  tags,
  value,
  onChange,
  onAdd,
  onRemove,
  suggestions = [],
}: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onAdd(value);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>

      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onRemove(tag)}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 hover:bg-emerald-200 transition"
            title="Quitar etiqueta"
          >
            {tag}
            <span aria-hidden>×</span>
          </button>
        ))}
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      />

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs text-slate-500 w-full">Sugerencias:</span>
          {suggestions
            .filter((s) => !tags.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onAdd(s)}
                className="rounded-full border border-dashed border-emerald-300 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
