"use client";

import { useEffect } from "react";
import Link from "next/link";

import { PostulacionForm } from "@/components/postulante/PostulacionForm";
import { BasesConvocatoriaModal } from "@/components/portal/BasesConvocatoriaModal";
import { Button } from "@/components/ui/Button";
import { EmpresaLogo } from "@/components/ui/EmpresaLogo";
import { SlideView } from "@/components/ui/SlideView";
import { useOfertaDetailUiStore } from "@/stores/ofertaDetailUiStore";
import {
  formatFechaCorta,
  formatVigencia,
  lineasComoLista,
  tiempoRelativo,
} from "@/lib/format-fecha";
import { MODALIDAD_LABEL, type OfertaLaboralDTO } from "@/types/bolsa";

type Props = {
  oferta: OfertaLaboralDTO;
  variant?: "panel" | "drawer";
  yaPostulado?: boolean;
  onClose?: () => void;
  onPostulado?: (jobId: string) => void;
};

function MetaBadge({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 min-w-[140px] flex-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 mt-1 leading-snug">{value}</p>
    </div>
  );
}

export function OfertaDetail({
  oferta,
  variant = "panel",
  yaPostulado = false,
  onClose,
  onPostulado,
}: Props) {
  const modo = useOfertaDetailUiStore((s) => s.modo);
  const modoDirection = useOfertaDetailUiStore((s) => s.modoDirection);
  const resultado = useOfertaDetailUiStore((s) => s.resultado);
  const showBases = useOfertaDetailUiStore((s) => s.showBases);
  const changeModo = useOfertaDetailUiStore((s) => s.changeModo);
  const setShowBases = useOfertaDetailUiStore((s) => s.setShowBases);
  const setResultado = useOfertaDetailUiStore((s) => s.setResultado);
  const resetForOferta = useOfertaDetailUiStore((s) => s.resetForOferta);

  useEffect(() => {
    resetForOferta(oferta.id);
  }, [oferta.id, resetForOferta]);

  const empresa =
    oferta.empresa?.razonSocial || oferta.empresa?.nombre || "Empresa";
  const conv = oferta.cronogramas[0];
  const funciones = lineasComoLista(oferta.funciones);
  const beneficios = lineasComoLista(oferta.beneficios);
  const tracking = resultado?.pestaña_personal_view?.tracking;

  const shellClass =
    variant === "drawer"
      ? "flex flex-col h-full min-h-0 bg-white"
      : "flex flex-col h-full min-h-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden";

  return (
    <article className={shellClass}>
      {/* Encabezado sticky */}
      <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-5 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 min-w-0 flex-1">
            <EmpresaLogo
              src={oferta.logoUrl}
              alt={empresa}
              size="lg"
              className="hidden sm:flex shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
                {oferta.titulo}
              </h2>
              <p className="text-sm font-medium text-slate-600 mt-1.5">{empresa}</p>
              <p className="text-xs text-slate-400 mt-1">
                Publicado {tiempoRelativo(oferta.fechaPublicacion)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <EmpresaLogo
              src={oferta.logoUrl}
              alt={empresa}
              size="md"
              className="sm:hidden"
            />
            {variant === "drawer" && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Cerrar"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {modo === "detalle" && (
          <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
            {yaPostulado ? (
              <Link href="/personal" className="flex-1 sm:flex-none min-w-[160px]">
                <Button
                  variant="secondary"
                  className="w-full border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold"
                >
                  Ya postulaste · Ver seguimiento
                </Button>
              </Link>
            ) : (
              <Button
                className="flex-1 sm:flex-none min-w-[160px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                onClick={() => changeModo("postular")}
              >
                Postularme ahora
              </Button>
            )}
            {oferta.basesViewUrl && (
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none min-w-[160px] border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                onClick={() => setShowBases(true)}
              >
                Bases de la convocatoria
              </Button>
            )}
          </div>
        )}
      </header>

      {showBases && oferta.basesViewUrl && (
        <BasesConvocatoriaModal
          titulo={oferta.titulo}
          empresa={empresa}
          viewUrl={oferta.basesViewUrl}
          fileName={oferta.basesArchivo?.name}
          onClose={() => setShowBases(false)}
        />
      )}

      {/* Cuerpo con scroll */}
      <div className="scroll-panel flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 pb-8 lg:px-6 scroll-smooth">
        <SlideView viewKey={modo} direction={modoDirection} className="min-h-0">
          {modo === "detalle" && (
            <div className="space-y-8">
              {/* Metadatos rápidos */}
              <section>
                <div className="flex flex-wrap gap-2">
                  <MetaBadge label="Salario" value={oferta.salario} icon="💰" />
                  <MetaBadge
                    label="Modalidad"
                    value={MODALIDAD_LABEL[oferta.modalidad]}
                    icon="📍"
                  />
                  <MetaBadge
                    label="Vacantes"
                    value={`${oferta.cantidadVacantes} disponible${oferta.cantidadVacantes !== 1 ? "s" : ""}`}
                    icon="👥"
                  />
                  <MetaBadge label="Contrato" value={oferta.tipoContrato} icon="📄" />
                  {oferta.aptoDiscapacidad && (
                    <MetaBadge label="Discapacidad" value="Puesto inclusivo" icon="♿" />
                  )}
                  <MetaBadge
                    label="Inicio convocatoria"
                    value={conv ? formatFechaCorta(conv.inicio) : "—"}
                    icon="📅"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  {conv
                    ? `Vigencia: ${formatVigencia(conv.inicio, conv.fin)}`
                    : "Sin cronograma"}
                  {oferta.tipoPuesto.length > 0 && (
                    <> · {oferta.tipoPuesto.join(" · ")}</>
                  )}
                  {oferta.direccionTrabajo && (
                    <> · {oferta.direccionTrabajo.direccionLiteral}</>
                  )}
                </p>
              </section>

              {oferta.perfil && (
                <section className="border-t border-slate-100 pt-6">
                  <h3 className="text-base font-bold text-slate-900 mb-3">Perfil requerido</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {oferta.perfil}
                  </p>
                </section>
              )}

              {/* Descripción / Funciones */}
              <section className="border-t border-slate-100 pt-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Descripción del puesto
                </h3>
                {funciones.length > 1 ? (
                  <ul className="space-y-2.5">
                    {funciones.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm text-slate-600 leading-relaxed"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {oferta.funciones}
                  </p>
                )}
              </section>

              {/* Requisitos */}
              {(oferta.carrerasRequeridas.length > 0 ||
                oferta.conocimientosRequeridos.length > 0 ||
                oferta.tipoPuesto.length > 0) && (
                <section className="border-t border-slate-100 pt-6">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Requisitos</h3>
                  {oferta.tipoPuesto.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                        Jornada
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {oferta.tipoPuesto.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {oferta.carrerasRequeridas.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                        Carreras
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {oferta.carrerasRequeridas.map((c) => (
                          <span
                            key={c.id}
                            className="rounded-md bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-800"
                          >
                            {c.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {oferta.conocimientosRequeridos.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                        Conocimientos
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {oferta.conocimientosRequeridos.map((r) => (
                          <span
                            key={r.id}
                            className="rounded-md bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                          >
                            {r.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Beneficios */}
              <section className="border-t border-slate-100 pt-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Beneficios de la empresa
                </h3>
                {beneficios.length > 1 ? (
                  <ul className="space-y-2.5">
                    {beneficios.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm text-slate-600 leading-relaxed"
                      >
                        <span className="text-emerald-500 shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {oferta.beneficios}
                  </p>
                )}
              </section>
            </div>
          )}

          {modo === "postular" && (
            <PostulacionForm
              oferta={oferta}
              onCancel={() => changeModo("detalle")}
              onSuccess={(res) => {
                onPostulado?.(oferta.id);
                setResultado(res);
                changeModo("exito");
              }}
            />
          )}

          {modo === "exito" && tracking && resultado && (
            <div className="space-y-4">
              <p className="text-emerald-700 font-bold text-lg">¡Postulación registrada!</p>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">
                  Guarda este código
                </p>
                <p className="font-mono text-2xl font-bold text-emerald-900 mt-2">
                  {resultado.application_id}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Consúltalo en Mis postulaciones con tu DNI o este código.
                </p>
              </div>
              <p className="text-sm text-slate-600">
                Estado: <strong>{tracking.status}</strong>
              </p>
              <p className="text-sm text-slate-500">{tracking.context_message}</p>
              <Link href="/personal">
                <Button className="w-full">Ir a Mis postulaciones</Button>
              </Link>
              {onClose && (
                <Button variant="secondary" className="w-full" onClick={onClose}>
                  Cerrar
                </Button>
              )}
            </div>
          )}
        </SlideView>
      </div>
    </article>
  );
}
