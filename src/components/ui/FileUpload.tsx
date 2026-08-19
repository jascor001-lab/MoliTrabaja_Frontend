"use client";

import { useRef, type ChangeEvent } from "react";

const DEFAULT_MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

const DEFAULT_ACCEPT =
  ".png,.jpg,.jpeg,.gif,.webp,.pdf,image/*,application/pdf";

type Props = {
  label: string;
  hint?: string;
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
  error?: string;
};

export function FileUpload({
  label,
  hint,
  files,
  onAdd,
  onRemove,
  disabled,
  maxFiles = DEFAULT_MAX_FILES,
  accept = DEFAULT_ACCEPT,
  multiple = maxFiles > 1,
  error,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of selected) {
      if (files.length + valid.length >= maxFiles) {
        errors.push(`Máximo ${maxFiles} archivo${maxFiles > 1 ? "s" : ""}.`);
        break;
      }
      if (file.size > MAX_BYTES) {
        errors.push(`${file.name} supera 10 MB.`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length) onAdd(valid);
    if (errors.length) alert(errors.join("\n"));
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        disabled={disabled || files.length >= maxFiles}
        onChange={onChange}
      />

      <button
        type="button"
        disabled={disabled || files.length >= maxFiles}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 transition"
      >
        {maxFiles === 1
          ? files.length
            ? "Cambiar archivo"
            : "Seleccionar archivo"
          : `Seleccionar archivos (${files.length}/${maxFiles})`}
      </button>

      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between rounded-lg border border-emerald-100 px-3 py-2 text-sm"
            >
              <span className="break-all pr-2 text-slate-700">
                {file.name}{" "}
                <span className="text-slate-400">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="shrink-0 text-xs text-red-600 hover:underline"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
