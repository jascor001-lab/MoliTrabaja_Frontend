export default function Navigation({ step, next, prev, isLast }: any) {
  return (
    <footer className="px-6 pb-6 flex gap-3">
      {step > 0 && (
        <button
          onClick={prev}
          className="w-full py-3 rounded-full border border-green-300 text-green-700"
        >
          Atrás
        </button>
      )}

      <button
        onClick={next}
        className="w-full py-3 rounded-full bg-green-600 text-white font-semibold"
      >
        {isLast ? "Finalizar" : "Siguiente"}
      </button>
    </footer>
  );
}
