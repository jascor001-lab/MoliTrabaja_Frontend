export default function StepTextarea({ formik, field }: any) {
  const handleNoSuggestion = () => {
    formik.setFieldValue(field, "No tengo sugerencias");
  };

  return (
    <div className="mt-6 w-full">
      <textarea
        rows={4}
        name={field}
        value={formik.values[field]}
        onChange={formik.handleChange}
        placeholder="Escribe tu sugerencia (opcional)"
        className="w-full rounded-xl border border-green-300 px-4 py-3 resize-none"
      />

      <button
        type="button"
        onClick={handleNoSuggestion}
        className="mt-3 w-full rounded-xl border border-dashed border-green-400 py-2 text-sm text-green-700 hover:bg-green-50 transition"
      >
        No tengo sugerencias
      </button>
    </div>
  );
}
