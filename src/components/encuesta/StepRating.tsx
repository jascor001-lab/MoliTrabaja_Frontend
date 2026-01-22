const options = [
  { v: 5, t: "Muy satisfecho", i: "😄", c: "text-green-600" },
  { v: 4, t: "Satisfecho", i: "🙂", c: "text-lime-500" },
  { v: 3, t: "Regular", i: "😐", c: "text-yellow-500" },
  { v: 2, t: "Insatisfecho", i: "🙁", c: "text-orange-500" },
  { v: 1, t: "Nada satisfecho", i: "😞", c: "text-red-500" },
];

export default function StepRating({ formik, field }: any) {
  return (
    <div
      className="flex justify-between mt-6"
      role="group"
      aria-label="Calificación"
    >
      {options.map((o) => {
        const active = formik.values[field] === o.v;

        return (
          <button
            key={o.v}
            type="button"
            aria-pressed={active}
            onClick={() => formik.setFieldValue(field, o.v, false)}
            className={`
              flex flex-col items-center w-14
              transition-all duration-200 ease-out
              ${active ? `${o.c} scale-110` : "text-gray-400"}
              hover:scale-125 hover:${o.c}
              focus:outline-none
            `}
            style={{
              filter: active ? "none" : "grayscale(100%)",
            }}
          >
            <span className="text-3xl leading-none">{o.i}</span>
            <span className="text-[10px] text-center mt-1 leading-tight">
              {o.t}
            </span>
          </button>
        );
      })}
    </div>
  );
}
