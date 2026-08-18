"use client";

import { useEffect, useMemo, useState } from "react";

import { SlideView } from "@/components/ui/SlideView";
import { esOfertaNueva } from "@/lib/format-fecha";
import { listarPostulacionesLocales } from "@/lib/mis-postulaciones-storage";
import { MOTION_REDUCE, drawerEnterClass, drawerExitClass, staggerStyleObj } from "@/lib/motion";
import { ofertaCumpleFiltroSalario, salarioSortKey } from "@/lib/salario";
import { usePortalUiStore } from "@/stores/portalUiStore";
import type { OfertaLaboralDTO, TipoPuesto } from "@/types/bolsa";
import type { MisPostulacionItem } from "@/types/postulacion";

import { OfertaCard } from "./OfertaCard";
import { OfertaDetail } from "./OfertaDetail";
import {
  OfertaFilters,
  EMPTY_FILTERS,
  filtersAreActive,
  type OfertaFilterValue,
} from "./OfertaFilters";
import { SearchBar } from "./SearchBar";

type FilterOption = { value: string; label: string };

type Props = {
  ofertas: OfertaLaboralDTO[];
  empresasCatalogo?: FilterOption[];
  carrerasCatalogo?: FilterOption[];
  conocimientosCatalogo?: FilterOption[];
};

export function PortalHome({
  ofertas: initial,
  empresasCatalogo,
  carrerasCatalogo,
  conocimientosCatalogo,
}: Props) {
  const query = usePortalUiStore((s) => s.query);
  const selected = usePortalUiStore((s) => s.selected);
  const detailDirection = usePortalUiStore((s) => s.detailDirection);
  const mobileOpen = usePortalUiStore((s) => s.mobileOpen);
  const drawerClosing = usePortalUiStore((s) => s.drawerClosing);
  const listAnimKey = usePortalUiStore((s) => s.listAnimKey);
  const setQuery = usePortalUiStore((s) => s.setQuery);
  const selectOferta = usePortalUiStore((s) => s.selectOferta);
  const syncFiltered = usePortalUiStore((s) => s.syncFiltered);
  const closeMobileDrawer = usePortalUiStore((s) => s.closeMobileDrawer);
  const [filters, setFilters] = useState<OfertaFilterValue>(EMPTY_FILTERS);
  const [idsPostulados, setIdsPostulados] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const locales = listarPostulacionesLocales().map((p) => p.job_id);

    fetch("/api/auth/login")
      .then((r) => r.json())
      .then(async (session) => {
        if (cancelled) return;
        if (!session.authenticated || session.tipo !== "postulante") {
          setIdsPostulados(new Set(locales));
          return;
        }
        const res = await fetch("/api/postulaciones/mis");
        const json = await res.json().catch(() => ({}));
        const items: MisPostulacionItem[] = Array.isArray(json.postulaciones)
          ? json.postulaciones
          : [];
        const ids = [
          ...locales,
          ...items.map((p) => p.job_id).filter(Boolean),
        ];
        if (!cancelled) setIdsPostulados(new Set(ids));
      })
      .catch(() => {
        if (!cancelled) setIdsPostulados(new Set(locales));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const marcarPostulado = (jobId: string) => {
    setIdsPostulados((prev) => {
      if (prev.has(jobId)) return prev;
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
  };

  const filterOptions = useMemo(() => {
    const empresas =
      empresasCatalogo && empresasCatalogo.length > 0
        ? empresasCatalogo
        : Array.from(
            new Map(
              initial
                .map((oferta) => oferta.empresa)
                .filter((empresa): empresa is NonNullable<typeof empresa> => Boolean(empresa))
                .map((empresa) => [
                  empresa.id,
                  {
                    value: empresa.id,
                    label: empresa.razonSocial || empresa.nombre,
                  },
                ])
            ).values()
          ).sort((a, b) => a.label.localeCompare(b.label, "es"));

    const contratos = Array.from(
      new Set(initial.map((oferta) => oferta.tipoContrato).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "es"));

    const carreras =
      carrerasCatalogo && carrerasCatalogo.length > 0
        ? carrerasCatalogo
        : Array.from(
            new Map(
              initial
                .flatMap((oferta) => oferta.carrerasRequeridas)
                .map((item) => [String(item.id), { value: String(item.id), label: item.nombre }])
            ).values()
          ).sort((a, b) => a.label.localeCompare(b.label, "es"));

    const conocimientos =
      conocimientosCatalogo && conocimientosCatalogo.length > 0
        ? conocimientosCatalogo
        : Array.from(
            new Map(
              initial
                .flatMap((oferta) => oferta.conocimientosRequeridos)
                .map((item) => [
                  String(item.id),
                  { value: String(item.id), label: item.nombre },
                ])
            ).values()
          ).sort((a, b) => a.label.localeCompare(b.label, "es"));

    return { empresas, contratos, carreras, conocimientos };
  }, [initial, empresasCatalogo, carrerasCatalogo, conocimientosCatalogo]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();

    const result = initial.filter((oferta) => {
      if (filters.empresa && oferta.empresaId !== filters.empresa) return false;
      if (filters.modalidad && oferta.modalidad !== filters.modalidad) return false;
      if (
        filters.jornada &&
        !oferta.tipoPuesto.includes(filters.jornada as TipoPuesto)
      ) {
        return false;
      }
      if (filters.contrato && oferta.tipoContrato !== filters.contrato) return false;
      if (
        filters.carrera &&
        !oferta.carrerasRequeridas.some((item) => String(item.id) === filters.carrera)
      ) {
        return false;
      }
      if (
        filters.conocimiento &&
        !oferta.conocimientosRequeridos.some(
          (item) => String(item.id) === filters.conocimiento
        )
      ) {
        return false;
      }
      if (filters.salario && !ofertaCumpleFiltroSalario(oferta.salario, filters.salario)) {
        return false;
      }
      if (filters.discapacidad === "si" && !oferta.aptoDiscapacidad) return false;
      if (filters.fecha) {
        const days = Number(filters.fecha);
        const publishedAt = new Date(oferta.fechaPublicacion).getTime();
        if (!Number.isFinite(publishedAt) || now - publishedAt > days * 86_400_000) {
          return false;
        }
      }

      if (!q) return true;
      const text = [
        oferta.titulo,
        oferta.descripcion,
        oferta.empresa?.nombre,
        oferta.empresa?.razonSocial,
        ...oferta.carrerasRequeridas.map((c) => c.nombre),
        ...oferta.conocimientosRequeridos.map((c) => c.nombre),
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });

    return result.sort((a, b) => {
      if (filters.ordenar === "salario-asc") {
        return salarioSortKey(a.salario) - salarioSortKey(b.salario);
      }
      if (filters.ordenar === "antiguas") {
        return (
          new Date(a.fechaPublicacion).getTime() -
          new Date(b.fechaPublicacion).getTime()
        );
      }
      if (filters.ordenar === "titulo") {
        return a.titulo.localeCompare(b.titulo, "es");
      }
      if (filters.ordenar === "recientes") {
        return (
          new Date(b.fechaPublicacion).getTime() -
          new Date(a.fechaPublicacion).getTime()
        );
      }
      return 0;
    });
  }, [initial, query, filters]);

  const hasActiveFilters = filtersAreActive(filters);

  const nuevasCount = useMemo(
    () => filtered.filter((oferta) => esOfertaNueva(oferta.fechaPublicacion)).length,
    [filtered]
  );

  const ofertasLabel =
    filtered.length > 0 && nuevasCount === filtered.length
      ? `nueva${filtered.length !== 1 ? "s" : ""}`
      : `activa${filtered.length !== 1 ? "s" : ""}`;

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
            {filtered.length} oferta{filtered.length !== 1 ? "s" : ""} {ofertasLabel}
            {nuevasCount > 0 && nuevasCount !== filtered.length
              ? ` · ${nuevasCount} nueva${nuevasCount !== 1 ? "s" : ""}`
              : ""}
            {query || hasActiveFilters ? " que coinciden con tu búsqueda" : ""}
          </p>
        </div>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
        />
        <div className="mx-auto max-w-4xl">
          <OfertaFilters
            value={filters}
            empresas={filterOptions.empresas}
            contratos={filterOptions.contratos}
            carreras={filterOptions.carreras}
            conocimientos={filterOptions.conocimientos}
            onChange={setFilters}
          />
        </div>
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
                        yaPostulado={idsPostulados.has(oferta.id)}
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
                    <OfertaDetail
                      oferta={selected}
                      variant="panel"
                      yaPostulado={idsPostulados.has(selected.id)}
                      onPostulado={marcarPostulado}
                    />
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
              yaPostulado={idsPostulados.has(selected!.id)}
              onPostulado={marcarPostulado}
              onClose={closeMobileDrawer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
