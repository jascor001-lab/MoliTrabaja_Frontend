"use client";

import { useEffect, useState } from "react";

import { OfertaEditBlocks } from "@/components/empresa/OfertaEditBlocks";
import { useOfertaFormStore } from "@/stores/ofertaFormStore";
import type { OfertaLaboralDTO } from "@/types/bolsa";

type Props = {
  oferta: OfertaLaboralDTO;
  empresaId: string;
};

export function OfertaEditClient({ oferta, empresaId }: Props) {
  const hydrateFromOferta = useOfertaFormStore((s) => s.hydrateFromOferta);
  const reset = useOfertaFormStore((s) => s.reset);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateFromOferta(oferta);
    setReady(true);
    return () => reset();
  }, [oferta.id, hydrateFromOferta, reset, oferta]);

  if (!ready) {
    return (
      <p className="text-sm text-slate-500 animate-pulse">Cargando formulario…</p>
    );
  }

  return (
    <OfertaEditBlocks ofertaId={oferta.id} empresaId={empresaId} />
  );
}
