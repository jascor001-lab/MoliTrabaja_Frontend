export default function StepSelect({ formik, field }: any) {
  return (
    <select
      name={field}
      value={formik.values[field]}
      onChange={formik.handleChange}
      className="mt-6 w-full rounded-xl border border-green-300 px-4 py-3"
    >
      <option value="">Seleccione</option>

      <optgroup label="Atención Empresarial">
        <option value="mac_express">MAC Express</option>
        <option value="licencias_comerciales">Licencias Comerciales</option>
        <option value="certificado_itse">Certificado ITSE</option>
      </optgroup>

      <optgroup label="Trámite Documentario">
        <option value="presentacion_documentos">
          Presentación de Documentos
        </option>
      </optgroup>

      <optgroup label="Tributación">
        <option value="recaudacion_tributaria">
          Recaudación Tributaria
        </option>
        <option value="ejecutoria_coactiva">
          Ejecutoría Coactiva
        </option>
        <option value="proceso_tributario">
          Proceso Tributario
        </option>
      </optgroup>

      <optgroup label="Catastro y Obras">
        <option value="orientacion_catastro">
          Orientación de Catastro
        </option>
        <option value="obras_privadas">Obras Privadas</option>
      </optgroup>

      <optgroup label="Atención al Ciudadano">
        <option value="acceso_informacion_publica">
          Acceso a la Información Pública
        </option>
        <option value="libro_reclamaciones">
          Libro de Reclamaciones
        </option>
        <option value="copias">
          Copia Simple / Fedateada / Certificada
        </option>
        <option value="informes">Informes</option>
      </optgroup>

      <optgroup label="Pagos">
        <option value="caja">Caja</option>
      </optgroup>
    </select>
  );
}

