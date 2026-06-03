type Props = {
  current: number;
  labels: string[];
};

export function StepIndicator({ current, labels }: Props) {
  return (
    <ol className="flex items-center justify-between gap-1 sm:gap-2">
      {labels.map((label, index) => {
        const step = index + 1;
        const active = step === current;
        const done = step < current;

        return (
          <li key={label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div
              className={`
                flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs sm:text-sm font-bold shrink-0
                transition-all duration-300 ease-fluid
                ${done ? "bg-emerald-600 text-white" : ""}
                ${active ? "bg-emerald-500 text-white ring-4 ring-emerald-100 scale-105" : ""}
                ${!done && !active ? "bg-emerald-50 text-emerald-400 border border-emerald-100" : ""}
              `}
            >
              {done ? "✓" : step}
            </div>
            <span
              className={`text-[10px] sm:text-xs text-center font-medium leading-tight px-0.5 transition-colors duration-300 ${
                active ? "text-emerald-700" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
