import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  variant?: "info" | "success";
};

export function SectionHint({ title, children, variant = "info" }: Props) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
      : "bg-slate-50 border-slate-200 text-slate-700";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles}`}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      {children}
    </div>
  );
}
