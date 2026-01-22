import * as Yup from "yup";

export const encuestaValidationSchema = Yup.object({
  servicio: Yup.string().required("Seleccione un servicio"),
  ventanilla: Yup.string().required("Ingrese la ventanilla"),
  terminalista: Yup.string().required("Ingrese el nombre"),
  fecha: Yup.string().required("Seleccione la fecha"),

  amabilidad: Yup.number().min(1).required(),
  claridad: Yup.number().min(1).required(),
  conocimiento: Yup.number().min(1).required(),
  tiempoEspera: Yup.number().min(1).required(),
  tiempoTotal: Yup.number().min(1).required(),
  comodidad: Yup.number().min(1).required(),
  facilidad: Yup.number().min(1).required(),
  percepcion: Yup.number().min(1).required(),

  sugerencia1: Yup.string().nullable(),
  sugerencia2: Yup.string().nullable(),
  sugerencia3: Yup.string().nullable(),
  sugerencia4: Yup.string().nullable(),
  sugerencia5: Yup.string().nullable(),
});
