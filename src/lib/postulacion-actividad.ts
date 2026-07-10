import { normalizarEstadoPipeline } from "@/lib/dashboard-postulacion";
import type { ActividadPostulacion, EstadoPipeline } from "@/types/postulacion";

function estadoEspera(pipeline: EstadoPipeline): ActividadPostulacion["estado"] {
  if (pipeline === "En Revisión") return "actual";
  return "completado";
}

function estadoEvaluacion(pipeline: EstadoPipeline): ActividadPostulacion["estado"] {
  if (pipeline === "Entrevista") return "actual";
  if (pipeline === "En Revisión") return "pendiente";
  return "completado";
}

function estadoResultado(pipeline: EstadoPipeline): ActividadPostulacion["estado"] {
  if (pipeline === "Aceptado / Seleccionado" || pipeline === "No Seleccionado (Fuera del Proceso)") {
    return "actual";
  }
  return "pendiente";
}

export function construirHistorialActividad(params: {
  estadoSeguimiento: string;
  fechaPostulacion: string;
  lastUpdate: string;
  empresa: string;
}): ActividadPostulacion[] {
  const pipeline = normalizarEstadoPipeline(params.estadoSeguimiento);
  const enviada = params.fechaPostulacion;
  const actualizado = params.lastUpdate;
  const empresa = params.empresa;

  const paso = (
    id: string,
    etiqueta: string,
    descripcion: string,
    fecha: string | null,
    estado: ActividadPostulacion["estado"]
  ): ActividadPostulacion => ({ id, etiqueta, descripcion, fecha, estado });

  const pasoEspera = estadoEspera(pipeline);
  const pasoEval = estadoEvaluacion(pipeline);
  const pasoRes = estadoResultado(pipeline);

  return [
    paso(
      "enviada",
      "Postulación enviada",
      `Tu postulación fue registrada en ${empresa}.`,
      enviada,
      "completado"
    ),
    paso(
      "espera",
      "En espera de evaluación",
      "El reclutador está revisando tu perfil y CV frente a los requisitos de la vacante.",
      pasoEspera === "completado" ? actualizado : enviada,
      pasoEspera
    ),
    paso(
      "evaluacion",
      "Evaluación / preselección",
      "Tu perfil está en fase de evaluación o preselección por parte de la empresa.",
      pasoEval === "completado" || pasoEval === "actual" ? actualizado : null,
      pasoEval
    ),
    paso(
      "resultado",
      pipeline === "Aceptado / Seleccionado"
        ? "Seleccionado"
        : pipeline === "No Seleccionado (Fuera del Proceso)"
          ? "Proceso cerrado"
          : "Resultado del proceso",
      pipeline === "Aceptado / Seleccionado"
        ? "¡Felicitaciones! La empresa te seleccionó para esta vacante."
        : pipeline === "No Seleccionado (Fuera del Proceso)"
          ? "En esta oportunidad no continuas en el proceso. Puedes postular a otras vacantes."
          : "Recibirás aquí el resultado final cuando la empresa cierre la evaluación.",
      pasoRes === "actual" ? actualizado : null,
      pasoRes
    ),
  ];
}
