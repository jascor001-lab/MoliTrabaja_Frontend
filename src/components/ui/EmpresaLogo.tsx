"use client";

import { useEffect, useState } from "react";

type Size = "sm" | "md" | "lg";

type Props = {
  src: string | null;
  alt: string;
  size?: Size;
  className?: string;
};

const SIZE_PX: Record<Size, number> = {
  sm: 44,
  md: 56,
  lg: 72,
};

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "EM";
}

function logoSrc(src: string): string {
  if (src.startsWith("blob:") || src.startsWith("data:") || src.startsWith("http")) {
    return src;
  }
  const normalized = src.replace(/\\/g, "/");
  const idx = normalized.toLowerCase().lastIndexOf("/uploads/");
  if (idx >= 0) return normalized.slice(idx);
  if (normalized.startsWith("uploads/")) return `/${normalized}`;
  return src.startsWith("/") ? src : `/${src}`;
}

export function EmpresaLogo({ src, alt, size = "md", className = "" }: Props) {
  const px = SIZE_PX[size];
  const initials = initialsFrom(alt);
  const [broken, setBroken] = useState(false);
  const resolved = src ? logoSrc(src) : null;

  useEffect(() => {
    setBroken(false);
  }, [resolved]);

  const boxClass = `
    relative shrink-0 overflow-hidden rounded-xl border border-emerald-100
    bg-white shadow-sm ${className}
  `;

  if (resolved && !broken) {
    return (
      <div className={boxClass} style={{ width: px, height: px }}>
        <img
          src={resolved}
          alt={`Logo de ${alt}`}
          className="h-full w-full object-contain p-1.5"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${boxClass} flex items-center justify-center bg-emerald-600 text-white font-bold`}
      style={{ width: px, height: px, fontSize: Math.round(px * 0.32) }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
