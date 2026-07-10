import type { CandidatePerfilResumen } from "@/types/postulacion";

type DocViewerTarget = {
  viewUrl: string;
  title: string;
  fileName?: string;
};

type Props = {
  perfil: CandidatePerfilResumen;
  candidateName: string;
  onViewDocument: (doc: DocViewerTarget) => void;
};

function formatPeriodo(inicio: string, fin: string | null): string {
  const year = (iso: string) => iso.slice(0, 4);
  if (fin) return `${year(inicio)} – ${year(fin)}`;
  return `${year(inicio)} – actual`;
}

function formatMeses(meses: number): string {
  if (meses < 1) return "menos de 1 mes";
  const años = Math.floor(meses / 12);
  const resto = meses % 12;
  if (años === 0) return `${resto} mes${resto === 1 ? "" : "es"}`;
  if (resto === 0) return `${años} año${años === 1 ? "" : "s"}`;
  return `${años} año${años === 1 ? "" : "s"} ${resto} mes${resto === 1 ? "" : "es"}`;
}

function VerPdfButton({
  label,
  viewUrl,
  fileName,
  title,
  candidateName,
  onView,
}: {
  label?: string;
  viewUrl: string;
  fileName?: string;
  title: string;
  candidateName: string;
  onView: (doc: DocViewerTarget) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onView({
          viewUrl,
          fileName,
          title: `${title} · ${candidateName}`,
        })
      }
      className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
    >
      {label ?? "Ver PDF"}
    </button>
  );
}

function RequisitoChips({
  requeridos,
  cumplidos,
  vacio,
}: {
  requeridos: string[];
  cumplidos: string[];
  vacio: string;
}) {
  if (requeridos.length === 0) {
    return <p className="text-xs text-slate-500 italic">{vacio}</p>;
  }

  const cumplidosSet = new Set(cumplidos.map((c) => c.trim().toLowerCase()));

  return (
    <div className="flex flex-wrap gap-1.5">
      {requeridos.map((item) => {
        const ok = cumplidosSet.has(item.trim().toLowerCase());
        return (
          <span
            key={item}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              ok
                ? "bg-emerald-50 text-emerald-800 border border-emerald-400"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                ok ? "bg-emerald-600" : "bg-slate-400"
              }`}
            />
            {item}
          </span>
        );
      })}
    </div>
  );
}

export function PostulantePerfilResumen({
  perfil,
  candidateName,
  onViewDocument,
}: Props) {
  const { educaciones, conocimientos, experiencias, requisitos } = perfil;
  const tieneRequisitos =
    requisitos.carreras_requeridas.length > 0 ||
    requisitos.conocimientos_requeridos.length > 0;

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
      {tieneRequisitos && (
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">
            Cumplimiento de requisitos
          </h4>
          {requisitos.carreras_requeridas.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-slate-600 mb-1">Carreras requeridas</p>
              <RequisitoChips
                requeridos={requisitos.carreras_requeridas}
                cumplidos={requisitos.carreras_cumplidas}
                vacio="Sin carreras requeridas"
              />
            </div>
          )}
          {requisitos.conocimientos_requeridos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Conocimientos requeridos</p>
              <RequisitoChips
                requeridos={requisitos.conocimientos_requeridos}
                cumplidos={requisitos.conocimientos_cumplidos}
                vacio="Sin conocimientos requeridos"
              />
            </div>
          )}
        </section>
      )}

      <section>
        <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">
          Formación académica
        </h4>
        {educaciones.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            El postulante no registró formación académica en su perfil. Revisa el CV
            adjunto si necesitas más detalle.
          </p>
        ) : (
          <ul className="space-y-2">
            {educaciones.map((e) => (
              <li
                key={e.id}
                className="rounded-lg bg-white border border-emerald-100 px-3 py-2"
              >
                <p className="text-sm font-semibold text-slate-900">{e.carrera}</p>
                <p className="text-xs text-slate-600">
                  {e.tipo_estudio} · {e.institucion}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatPeriodo(e.fecha_ingreso, e.fecha_egreso)}
                  {e.orden_merito !== "No aplica" && ` · ${e.orden_merito} puesto`}
                </p>
                {e.documento_disponible && e.documento_view_url && (
                  <VerPdfButton
                    viewUrl={e.documento_view_url}
                    fileName={e.documento_filename}
                    title="Formación académica"
                    candidateName={candidateName}
                    onView={onViewDocument}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">
          Conocimientos
        </h4>
        {conocimientos.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Sin conocimientos registrados.</p>
        ) : (
          <ul className="space-y-2">
            {conocimientos.map((c) => (
              <li
                key={c.id}
                className="rounded-lg bg-white border border-emerald-100 px-3 py-2"
              >
                <p className="text-sm font-semibold text-slate-900">{c.nombre}</p>
                <p className="text-xs text-slate-500">{c.grupo}</p>
                {c.documento_disponible && c.documento_view_url && (
                  <VerPdfButton
                    viewUrl={c.documento_view_url}
                    fileName={c.documento_filename}
                    title="Certificado de conocimiento"
                    candidateName={candidateName}
                    onView={onViewDocument}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">
          Experiencia laboral
        </h4>
        {experiencias.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Sin experiencia registrada.</p>
        ) : (
          <ul className="space-y-2">
            {experiencias.map((x) => (
              <li
                key={x.id}
                className="rounded-lg bg-white border border-emerald-100 px-3 py-2"
              >
                <p className="text-sm font-semibold text-slate-900">{x.puesto}</p>
                <p className="text-xs text-slate-600">
                  {x.empresa} · {x.sector}
                </p>
                <p className="text-xs text-slate-500">{formatMeses(x.meses)}</p>
                {x.documento_disponible && x.documento_view_url && (
                  <VerPdfButton
                    viewUrl={x.documento_view_url}
                    fileName={x.documento_filename}
                    title="Experiencia laboral"
                    candidateName={candidateName}
                    onView={onViewDocument}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
