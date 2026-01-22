"use client";

import { useEffect, useState } from "react";

type Props = {
  step: number;
  total: number;
};

export default function ProgressBar({ step, total }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ⛔ Evita hydration mismatch
  if (!mounted) {
    return (
      <div className="mt-4">
        <div className="w-full h-2 bg-white/30 rounded-full" />
      </div>
    );
  }

  const percentage = Math.round(((step + 1) / total) * 100);

  return (
    <div className="mt-4">
      <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-2 bg-yellow-400 rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="text-right text-[10px] text-white/70 mt-1">
        {step + 1} / {total}
      </div>
    </div>
  );
}
