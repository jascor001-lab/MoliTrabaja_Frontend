import { create } from "zustand";

import type { SlideDirection } from "@/lib/motion";
import type { DashboardDualResponse } from "@/types/postulacion";

export type OfertaDetailModo = "detalle" | "postular" | "exito";

const MODO_ORDER: OfertaDetailModo[] = ["detalle", "postular", "exito"];

function directionForModo(from: OfertaDetailModo, to: OfertaDetailModo): SlideDirection {
  return MODO_ORDER.indexOf(to) >= MODO_ORDER.indexOf(from) ? "forward" : "back";
}

type OfertaDetailUiState = {
  ofertaId: string | null;
  modo: OfertaDetailModo;
  modoDirection: SlideDirection;
  showBases: boolean;
  resultado: DashboardDualResponse | null;

  resetForOferta: (ofertaId: string) => void;
  changeModo: (next: OfertaDetailModo) => void;
  setShowBases: (show: boolean) => void;
  setResultado: (resultado: DashboardDualResponse | null) => void;
};

export const useOfertaDetailUiStore = create<OfertaDetailUiState>((set, get) => ({
  ofertaId: null,
  modo: "detalle",
  modoDirection: "fade",
  showBases: false,
  resultado: null,

  resetForOferta: (ofertaId) => {
    set({
      ofertaId,
      modo: "detalle",
      modoDirection: "fade",
      showBases: false,
      resultado: null,
    });
  },

  changeModo: (next) => {
    const prev = get().modo;
    set({
      modo: next,
      modoDirection: directionForModo(prev, next),
    });
  },

  setShowBases: (showBases) => set({ showBases }),

  setResultado: (resultado) => set({ resultado }),
}));
