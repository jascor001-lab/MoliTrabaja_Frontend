"use client";

import Link from "next/link";

import { APP_NAME } from "@/lib/brand";
import { MOTION_REDUCE, staggerDelay } from "@/lib/motion";
import { SlideView } from "@/components/ui/SlideView";
import { useEmpresaDashboardUiStore } from "@/stores/empresaDashboardUiStore";
import { Button } from "@/components/ui/Button";
import { PostulantesOfertaPanel } from "@/components/empresa/PostulantesOfertaPanel";
import { EmpresaLogo } from "@/components/ui/EmpresaLogo";
import { MODALIDAD_LABEL, type OfertaLaboralDTO } from "@/types/bolsa";

type Props = {
  empresaNombre: string;
  ofertas: OfertaLaboralDTO[];
};

export function EmpresaDashboard({ empresaNombre, ofertas }: Props) {
  const expandedId = useEmpresaDashboardUiStore((s) => s.expandedId);
  const expandDirection = useEmpresaDashboardUiStore((s) => s.expandDirection);
  const toggleExpand = useEmpresaDashboardUiStore((s) => s.toggleExpand);
  const activas = ofertas.filter((o) => o.estado === "Activa").length;

  return (
    <div className="space-y-8">
      <header
        className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 motion-enter-fade motion-gpu ${MOTION_REDUCE}`}
      >
        <div>
          <p className="text-sm font-medium text-emerald-600">{APP_NAME} · Mis ofertas</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
            {empresaNombre}
          </h1>
          <p className="text-slate-500 mt-2">
            {ofertas.length} oferta{ofertas.length !== 1 ? "s" : ""} publicada
            {ofertas.length !== 1 ? "s" : ""} · {activas} activa
            {activas !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/empresa/publicar">
          <Button>+ Publicar empleo</Button>
        </Link>
      </header>

      {ofertas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-10 text-center">
          <p className="text-slate-600">Aún no tienes ofertas publicadas.</p>
          <Link href="/empresa/publicar" className="inline-block mt-4">
            <Button>Crear primera oferta</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4">
          {ofertas.map((oferta, i) => (
            <li
              key={oferta.id}
              className={`rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-500 ease-fluid motion-stagger-in motion-gpu ${MOTION_REDUCE}`}
              style={{ animationDelay: `${staggerDelay(i, 40, 38)}ms`, animationFillMode: "both" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <EmpresaLogo
                    src={oferta.logoUrl}
                    alt={oferta.empresa?.razonSocial ?? oferta.empresa?.nombre ?? "Empresa"}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-900">{oferta.titulo}</h2>
                    <p className="text-sm text-emerald-700 mt-1">
                      {MODALIDAD_LABEL[oferta.modalidad]} · {oferta.salario} ·{" "}
                      {oferta.cantidadVacantes} vac.
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {oferta.tipoContrato} · {oferta.tipoPuesto.join(" · ")}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    oferta.estado === "Activa"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {oferta.estado}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                {oferta.funciones}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <Link
                  href={`/empresa/ofertas/${oferta.id}/postulantes`}
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Ver postulantes →
                </Link>
                <Link
                  href={`/empresa/ofertas/${oferta.id}/editar`}
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Editar oferta
                </Link>
                <button
                  type="button"
                  onClick={() => toggleExpand(oferta.id)}
                  className="text-sm text-slate-500 hover:text-emerald-700"
                >
                  {expandedId === oferta.id ? "Ocultar panel" : "Vista rápida"}
                </button>
              </div>
              {expandedId === oferta.id && (
                <SlideView viewKey={oferta.id} direction={expandDirection}>
                  <div className="mt-4 border-t border-emerald-50 pt-4 overflow-hidden">
                    <PostulantesOfertaPanel ofertaId={oferta.id} />
                  </div>
                </SlideView>
              )}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {oferta.conocimientosRequeridos.slice(0, 5).map((r) => (
                  <span
                    key={r.id}
                    className="text-xs rounded-full px-2 py-0.5 text-emerald-800 bg-emerald-50"
                  >
                    {r.nombre}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
