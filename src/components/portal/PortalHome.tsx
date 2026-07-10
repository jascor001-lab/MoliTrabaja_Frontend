"use client";

import { useEffect, useMemo } from "react";

import { SlideView } from "@/components/ui/SlideView";
import {
  MOTION_REDUCE,
  drawerEnterClass,
  drawerExitClass,
  staggerStyleObj,
} from "@/lib/motion";
import { usePortalUiStore } from "@/stores/portalUiStore";
import type { OfertaLaboralDTO } from "@/types/bolsa";

import { OfertaCard } from "./OfertaCard";
import { OfertaDetail } from "./OfertaDetail";
import { SearchBar } from "./SearchBar";

type Props = {
  ofertas: OfertaLaboralDTO[];
};

export function PortalHome({ ofertas: initial }: Props) {
  const query = usePortalUiStore((s) => s.query);
  const modalidad = usePortalUiStore((s) => s.modalidad);
  const selected = usePortalUiStore((s) => s.selected);
  const detailDirection = usePortalUiStore((s) => s.detailDirection);
  const mobileOpen = usePortalUiStore((s) => s.mobileOpen);
  const drawerClosing = usePortalUiStore((s) => s.drawerClosing);
  const listAnimKey = usePortalUiStore((s) => s.listAnimKey);
  const setQuery = usePortalUiStore((s) => s.setQuery);
  const setModalidad = usePortalUiStore((s) => s.setModalidad);
  const selectOferta = usePortalUiStore((s) => s.selectOferta);
  const syncFiltered = usePortalUiStore((s) => s.syncFiltered);
  const closeMobileDrawer = usePortalUiStore((s) => s.closeMobileDrawer);

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
        ...o.carrerasRequeridas.map((c) => c.nombre),
        ...o.conocimientosRequeridos.map((c) => c.nombre),
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [initial, query, modalidad]);

  const orderedIds = useMemo(() => filtered.map((o) => o.id), [filtered]);

  useEffect(() => {
    syncFiltered(filtered);
  }, [filtered, syncFiltered]);

  useEffect(() => {
    if (!mobileOpen && !drawerClosing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileDrawer();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, drawerClosing, closeMobileDrawer]);

  const showDrawer = (mobileOpen || drawerClosing) && selected;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section
        className={`shrink-0 bg-white border-b border-slate-200 px-4 py-6 lg:py-8 motion-enter-fade motion-gpu ${MOTION_REDUCE}`}
      >
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

      <div className="flex-1 bg-slate-100">
        {filtered.length === 0 ? (
          <div
            className={`flex items-center justify-center py-24 px-4 motion-enter-fade motion-gpu ${MOTION_REDUCE}`}
          >
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
          <div className="flex flex-col lg:flex-row lg:gap-0 lg:min-h-[520px] lg:h-[calc(100vh-13rem)] lg:max-h-[calc(100vh-13rem)] lg:overflow-hidden">
            <aside className="w-full lg:w-[40%] lg:shrink-0 lg:min-h-0 lg:border-r lg:border-slate-200 bg-slate-100">
              <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto scroll-panel">
                <ul
                  key={listAnimKey}
                  className="flex flex-col gap-2 p-3 lg:p-4"
                >
                  {filtered.map((oferta, index) => (
                    <li
                      key={oferta.id}
                      className={`motion-stagger-in motion-gpu ${MOTION_REDUCE}`}
                      style={staggerStyleObj(index, 30, 38)}
                    >
                      <OfertaCard
                        oferta={oferta}
                        selected={selected?.id === oferta.id}
                        onSelect={() => selectOferta(oferta, orderedIds)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="hidden lg:flex lg:w-[60%] lg:min-w-0 lg:min-h-0 p-4 bg-slate-100 h-full">
              <div className="flex flex-col w-full h-full min-h-0 max-h-full">
                {selected ? (
                  <SlideView
                    viewKey={selected.id}
                    direction={detailDirection}
                    className="h-full min-h-0 flex-1"
                  >
                    <OfertaDetail oferta={selected} variant="panel" />
                  </SlideView>
                ) : (
                  <div
                    className={`flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white motion-enter-fade motion-gpu ${MOTION_REDUCE}`}
                  >
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

      {showDrawer && (
        <div
          className={`lg:hidden fixed inset-0 z-50 flex flex-col bg-white ${MOTION_REDUCE}`}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`h-full w-full ${
              drawerClosing ? drawerExitClass() : drawerEnterClass()
            } ${MOTION_REDUCE}`}
          >
            <OfertaDetail
              oferta={selected!}
              variant="drawer"
              onClose={closeMobileDrawer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
