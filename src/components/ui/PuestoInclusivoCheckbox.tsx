type Variant = "empresa" | "postulante";

const COPY: Record<Variant, { title: string; description: string }> = {
  empresa: {
    title: "Puesto inclusivo (discapacidad)",
    description:
      "Marca esta vacante si está abierta a personas con discapacidad.",
  },
  postulante: {
    title: "Puestos inclusivos (discapacidad)",
    description:
      "Marca esta opción si eres persona con discapacidad o buscas vacantes inclusivas.",
  },
};

type Props = {
  variant: Variant;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function PuestoInclusivoCheckbox({ variant, checked, onChange }: Props) {
  const copy = COPY[variant];

  return (
    <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 cursor-pointer hover:border-emerald-200">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-semibold text-slate-800">
          {copy.title}
        </span>
        <span className="block text-xs text-slate-500 mt-0.5">
          {copy.description}
        </span>
      </span>
    </label>
  );
}
