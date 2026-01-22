export default function StepInput({ formik, field }: any) {
  return (
    <input
      type="text"
      name={field}
      value={formik.values[field]}
      onChange={formik.handleChange}
      className="mt-6 w-full rounded-xl border border-green-300 px-4 py-3"
    />
  );
}
