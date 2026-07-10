import { create } from "zustand";

import { DRAWER_DURATION_MS, type SlideDirection } from "@/lib/motion";
import { useOfertaDetailUiStore } from "@/stores/ofertaDetailUiStore";
import type { OfertaLaboralDTO } from "@/types/bolsa";

function pickDetailDirection(
  prevId: string | null,
  nextId: string,
  orderedIds: string[]
): SlideDirection {
  if (!prevId || prevId === nextId) return "fade";
  const prevIdx = orderedIds.indexOf(prevId);
  const nextIdx = orderedIds.indexOf(nextId);
  if (prevIdx < 0 || nextIdx < 0) return "fade";
  if (nextIdx > prevIdx) return "forward";
  if (nextIdx < prevIdx) return "back";
  return "fade";
}

type PortalUiState = {
  query: string;
  modalidad: string;
  selected: OfertaLaboralDTO | null;
  detailDirection: SlideDirection;
  prevSelectedId: string | null;
  mobileOpen: boolean;
  drawerClosing: boolean;
  listAnimKey: number;

  setQuery: (query: string) => void;
  setModalidad: (modalidad: string) => void;
  selectOferta: (oferta: OfertaLaboralDTO, orderedIds: string[]) => void;
  syncFiltered: (filtered: OfertaLaboralDTO[]) => void;
  closeMobileDrawer: () => void;
  reset: () => void;
};

const initial = {
  query: "",
  modalidad: "",
  selected: null as OfertaLaboralDTO | null,
  detailDirection: "fade" as SlideDirection,
  prevSelectedId: null as string | null,
  mobileOpen: false,
  drawerClosing: false,
  listAnimKey: 0,
};

let drawerTimer: ReturnType<typeof setTimeout> | null = null;

export const usePortalUiStore = create<PortalUiState>((set, get) => ({
  ...initial,

  setQuery: (query) => {
    set({ query, listAnimKey: get().listAnimKey + 1 });
  },

  setModalidad: (modalidad) => {
    set({ modalidad, listAnimKey: get().listAnimKey + 1 });
  },

  selectOferta: (oferta, orderedIds) => {
    const { prevSelectedId } = get();
    const direction = pickDetailDirection(prevSelectedId, oferta.id, orderedIds);
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches;

    if (drawerTimer) {
      clearTimeout(drawerTimer);
      drawerTimer = null;
    }

    set({
      selected: oferta,
      detailDirection: direction,
      prevSelectedId: oferta.id,
      drawerClosing: false,
      mobileOpen: isMobile ? true : get().mobileOpen,
    });
    useOfertaDetailUiStore.getState().resetForOferta(oferta.id);
  },

  syncFiltered: (filtered) => {
    const { selected } = get();
    if (filtered.length === 0) {
      set({ selected: null, detailDirection: "fade" });
      return;
    }
    if (selected && filtered.some((o) => o.id === selected.id)) return;

    const next = filtered[0];
    set({
      selected: next,
      detailDirection: "fade",
      prevSelectedId: next.id,
      listAnimKey: get().listAnimKey + 1,
    });
  },

  closeMobileDrawer: () => {
    const { drawerClosing } = get();
    if (drawerClosing) return;

    set({ drawerClosing: true });
    if (drawerTimer) clearTimeout(drawerTimer);

    drawerTimer = setTimeout(() => {
      set({ mobileOpen: false, drawerClosing: false });
      drawerTimer = null;
    }, DRAWER_DURATION_MS);
  },

  reset: () => {
    if (drawerTimer) {
      clearTimeout(drawerTimer);
      drawerTimer = null;
    }
    set({ ...initial });
  },
}));
