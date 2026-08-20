"use client";

import { useEffect, useMemo, useState } from "react";

import { SlideView } from "@/components/ui/SlideView";
import { esOfertaNueva } from "@/lib/format-fecha";
import { listarOfertasVistas, marcarOfertaVista } from "@/lib/ofertas-vistas-storage";
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
  const [ofertas, setOfertas] = useState<OfertaLaboralDTO[]>(initial);
  const [idsPostulados, setIdsPostulados] = useState<Set<string>>(new Set());
  const [idsVistos, setIdsVistos] = useState<Set<string>>(new Set());
  const [esPostulante, setEsPostulante] = useState(false);

  useEffect(() => {
    setOfertas(initial);
  }, [initial]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/login")
      .then((r) => r.json())
      .then(async (session) => {
        if (cancelled) return;
        const postulante = session.authenticated && session.tipo === "postulante";
        setEsPostulante(Boolean(postulante));
        if (!postulante) {
          setIdsPostulados(new Set());
          setIdsVistos(new Set(listarOfertasVistas()));
          return;
        }
        const [resMis, resVistas] = await Promise.all([
          fetch("/api/postulaciones/mis"),
          fetch("/api/ofertas/vistas"),
        ]);
        const json = await resMis.json().catch(() => ({}));
        const items: MisPostulacionItem[] = Array.isArray(json.postulaciones)
          ? json.postulaciones
          : [];
        const ids = items.map((p) => p.job_id).filter(Boolean);
        const vistasJson = await resVistas.json().catch(() => []);
        const vistasApi = Array.isArray(vistasJson)
          ? vistasJson.filter((id) => typeof id === "string")
          : [];
        if (!cancelled) {
          setIdsPostulados(new Set(ids));
          setIdsVistos(new Set([...listarOfertasVistas(), ...vistasApi]));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEsPostulante(false);
          setIdsPostulados(new Set());
          setIdsVistos(new Set(listarOfertasVistas()));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ estado: "Activa" });
      if (query.trim()) params.set("q", query.trim());
      if (filters.empresa) params.set("empresaId", filters.empresa);
      if (filters.modalidad) params.set("modalidad", filters.modalidad);
      if (filters.carrera) params.set("carreraId", filters.carrera);
      if (filters.salario) params.set("salario", filters.salario);
      if (filters.ordenar) params.set("ordenar", filters.ordenar);
      if (filters.fecha) params.set("fecha", filters.fecha);
      if (filters.jornada) params.set("jornada", filters.jornada);
      if (filters.contrato) params.set("contrato", filters.contrato);
      if (filters.conocimiento) params.set("conocimientoId", filters.conocimiento);
      if (filters.discapacidad) params.set("discapacidad", filters.discapacidad);
      if (esPostulante && filters.vistos) params.set("vistos", filters.vistos);

      fetch(`/api/ofertas?${params.toString()}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          if (Array.isArray(data)) setOfertas(data);
        })
        .catch(() => undefined);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query, filters, esPostulante]);

  const marcarPostulado = (jobId: string) => {
    setIdsPostulados((prev) => {
      if (prev.has(jobId)) return prev;
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
    fetch("/api/postulaciones/mis")
      .then((r) => r.json())
      .then((json) => {
        const items: MisPostulacionItem[] = Array.isArray(json.postulaciones)
          ? json.postulaciones
          : [];
        setIdsPostulados(new Set(items.map((p) => p.job_id).filter(Boolean)));
      })
      .catch(() => undefined);
  };

  const marcarVista = (jobId: string) => {
    marcarOfertaVista(jobId);
    if (esPostulante) {
      fetch(`/api/ofertas/${jobId}/visto`, { method: "POST" }).catch(() => undefined);
    }
    setIdsVistos((prev) => {
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

    const result = ofertas.filter((oferta) => {
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
      if (!esPostulante) {
        if (filters.vistos === "vistos" && !idsVistos.has(oferta.id)) return false;
        if (filters.vistos === "no-vistos" && (idsVistos.has(oferta.id) || idsPostulados.has(oferta.id))) {
          return false;
        }
        if (filters.vistos === "postulados" && !idsPostulados.has(oferta.id)) return false;
      }
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
  }, [ofertas, query, filters, idsVistos, idsPostulados, esPostulante]);

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
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 lg:px-6 lg:py-5">
        <div className="mb-4 px-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Encuentra tu próxima oportunidad
          </h1>
          <p className="mt-2 text-sm text-slate-500">
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
        <OfertaFilters
          value={filters}
          empresas={filterOptions.empresas}
          contratos={filterOptions.contratos}
          carreras={filterOptions.carreras}
          conocimientos={filterOptions.conocimientos}
          mostrarFiltroVistos={esPostulante}
          onChange={setFilters}
        />
      </section>

      <div className="flex min-h-0 flex-1 flex-col bg-slate-100 lg:overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-24">
            <div className="max-w-md text-center">
              <p className="text-lg font-semibold text-slate-700">
                No hay ofertas que coincidan
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Prueba con otras palabras clave o cambia la modalidad de trabajo.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
            <aside className="flex min-h-0 w-full flex-1 flex-col bg-slate-100 lg:w-[38%] lg:flex-none lg:border-r lg:border-slate-200">
              <div className="min-h-0 flex-1 overflow-y-auto scroll-panel">
                <ul
                  key={listAnimKey}
                  className="flex flex-col gap-2 p-3 pr-4 lg:p-4 lg:pr-5"
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
                        vista={idsVistos.has(oferta.id)}
                        onSelect={() => {
                          marcarVista(oferta.id);
                          selectOferta(oferta, orderedIds);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="hidden min-h-0 min-w-0 flex-1 bg-slate-100 p-4 lg:flex">
              <div className="flex h-full min-h-0 w-full flex-col">
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
