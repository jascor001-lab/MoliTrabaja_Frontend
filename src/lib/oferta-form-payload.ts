import { formatSalarioForSave } from "@/lib/salario";
import type { OfertaFormState } from "@/stores/ofertaFormStore";

export function buildOfertaPayload(
  state: OfertaFormState,
  empresaId: string,
  isEdit: boolean
) {
  return {
    empresaId,
    enviarLogoPorCorreo: state.enviarLogoPorCorreo,
    cronogramas: state.cronogramas,
    nombrePuesto: state.nombrePuesto,
    perfil: state.perfil,
    tipoContrato: state.tipoContrato,
    tipoPuesto: state.tipoPuesto,
    cantidadVacantes: Number(state.cantidadVacantes),
    funciones: state.funciones,
    beneficios: state.beneficios,
    modalidad: state.modalidad,
    salario: formatSalarioForSave(state.salarioAConvenir, state.salarioMonto),
    direccionLiteral: state.direccionLiteral,
    latitud: state.latitud || undefined,
    longitud: state.longitud || undefined,
    carreraIds: state.carreraIds,
    conocimientoIds: state.conocimientoIds,
    aptoDiscapacidad: state.aptoDiscapacidad,
    contactoPrincipal: state.contactoPrincipal,
    contactoGerente: state.contactoGerente,
    ...(isEdit ? { estado: state.estado } : {}),
  };
}

export function buildOfertaFormData(
  state: OfertaFormState,
  empresaId: string,
  isEdit: boolean
): FormData {
  const formData = new FormData();
  formData.append("data", JSON.stringify(buildOfertaPayload(state, empresaId, isEdit)));
  state.logoFiles.forEach((file) => formData.append("logoFiles", file));
  if (state.basesFile) {
    formData.append("basesFile", state.basesFile);
  }
  return formData;
}
