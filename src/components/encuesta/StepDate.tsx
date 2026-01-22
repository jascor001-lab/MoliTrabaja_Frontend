export default function StepDate({ formik, field }: any) {
  return (
    <input
      type="date"
      name={field}
      value={formik.values[field]}
      onChange={formik.handleChange}
      className="mt-6 w-full rounded-xl border border-green-300 px-4 py-3"
    />
  );
}
