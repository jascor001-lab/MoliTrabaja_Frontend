"use client";

import { useEffect } from "react";

import { OfertaDetail } from "./OfertaDetail";
import type { OfertaLaboralDTO } from "@/types/bolsa";

type Props = {
  oferta: OfertaLaboralDTO | null;
  onClose: () => void;
};

/** @deprecated Prefer OfertaDetail con variant="drawer" desde PortalHome. */
export function OfertaDetailModal({ oferta, onClose }: Props) {
  useEffect(() => {
    if (!oferta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [oferta, onClose]);

  if (!oferta) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden animate-fade-in motion-reduce:animate-none"
      role="dialog"
      aria-modal="true"
    >
      <OfertaDetail oferta={oferta} variant="drawer" onClose={onClose} />
    </div>
  );
}
