"use client";

import { useEffect, useMemo, useState } from "react";

import type { OfertaLaboralDTO } from "@/types/bolsa";

import { OfertaCard } from "./OfertaCard";
import { OfertaDetail } from "./OfertaDetail";
import { SearchBar } from "./SearchBar";

type Props = {
  ofertas: OfertaLaboralDTO[];
};

export function PortalHome({ ofertas: initial }: Props) {
  const [query, setQuery] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [selected, setSelected] = useState<OfertaLaboralDTO | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initial.filter((o) => {
      if (modalidad && o.modalidad !== modalidad) return false;
      if (!q) return true;
      const text = [
        o.titulo,
        o.descripcion,
        o.empresa?.nombre,
        o.empresa?.razonSocial,
        o.empresa?.nombre,
        ...o.carrerasRequeridas.map((c) => c.nombre),
        ...o.conocimientosRequeridos.map((c) => c.nombre),
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [initial, query, modalidad]);

  useEffect(() => {
    setSelected((prev) => {
      if (filtered.length === 0) return null;
      if (prev && filtered.some((o) => o.id === prev.id)) return prev;
      return filtered[0];
    });
  }, [filtered]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const handleSelect = (oferta: OfertaLaboralDTO) => {
    setSelected(oferta);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setMobileOpen(true);
    }
  };

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Zona de búsqueda */}
      <section className="shrink-0 bg-white border-b border-slate-200 px-4 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto text-center mb-6 px-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Encuentra tu próxima oportunidad
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {filtered.length} oferta{filtered.length !== 1 ? "s" : ""} activa
            {filtered.length !== 1 ? "s" : ""}
            {query || modalidad ? " que coinciden con tu búsqueda" : ""}
          </p>
        </div>
        <SearchBar
          query={query}
          modalidad={modalidad}
          onQueryChange={setQuery}
          onModalidadChange={setModalidad}
        />
      </section>

      {/* Layout dos columnas */}
      <div className="flex-1 bg-slate-100">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24 px-4">
            <div className="text-center max-w-md">
              <p className="text-lg font-semibold text-slate-700">
                No hay ofertas que coincidan
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Prueba con otras palabras clave o cambia la modalidad de trabajo.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:gap-0 lg:h-[calc(100vh-13rem)] lg:min-h-[520px]">
            {/* Feed izquierdo — 40% */}
            <aside className="w-full lg:w-[40%] lg:shrink-0 lg:border-r lg:border-slate-200 bg-slate-100">
              <div className="lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-13rem)] lg:overflow-y-auto">
                <ul className="flex flex-col gap-2 p-3 lg:p-4">
                  {filtered.map((oferta) => (
                    <li key={oferta.id}>
                      <OfertaCard
                        oferta={oferta}
                        selected={selected?.id === oferta.id}
                        onSelect={handleSelect}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Panel derecho — 60% (solo desktop) */}
            <div className="hidden lg:flex lg:w-[60%] lg:min-w-0 p-4 bg-slate-100">
              <div className="sticky top-[4.5rem] w-full h-[calc(100vh-13rem)]">
                {selected ? (
                  <OfertaDetail oferta={selected} variant="panel" />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
                    <p className="text-sm text-slate-400">
                      Selecciona una oferta del listado
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer móvil — pantalla completa */}
      {mobileOpen && selected && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white animate-fade-in motion-reduce:animate-none"
          role="dialog"
          aria-modal="true"
        >
          <OfertaDetail
            oferta={selected}
            variant="drawer"
            onClose={handleCloseMobile}
          />
        </div>
      )}
    </div>
  );
}
