import Link from "next/link";
import type { ReactNode } from "react";

import { MOTION_REDUCE, staggerStyleObj } from "@/lib/motion";

type StatProps = {
  label: string;
  value: string | number;
  hint?: string;
  index?: number;
};

export function InicioStatCard({ label, value, hint, index = 0 }: StatProps) {
  return (
    <div
      className={`rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm motion-stagger-in motion-gpu ${MOTION_REDUCE}`}
      style={staggerStyleObj(index, 40, 38)}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

type AccionProps = {
  href: string;
  title: string;
  description: string;
  cta: string;
  primary?: boolean;
  index?: number;
  icon?: ReactNode;
};

export function InicioAccionCard({
  href,
  title,
  description,
  cta,
  primary = false,
  index = 0,
  icon,
}: AccionProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition-colors duration-300 motion-stagger-in motion-gpu ${MOTION_REDUCE} ${
        primary
          ? "border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700"
          : "border-emerald-100 bg-white hover:border-emerald-300"
      }`}
      style={staggerStyleObj(index, 80, 40)}
    >
      <div className="flex items-start gap-3">
        {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
        <div className="min-w-0">
          <p className={`font-bold ${primary ? "text-white" : "text-slate-900"}`}>
            {title}
          </p>
          <p
            className={`mt-1 text-sm ${primary ? "text-emerald-50" : "text-slate-500"}`}
          >
            {description}
          </p>
        </div>
      </div>
      <span
        className={`mt-4 text-sm font-semibold ${
          primary ? "text-white" : "text-emerald-700 group-hover:underline"
        }`}
      >
        {cta} →
      </span>
    </Link>
  );
}
