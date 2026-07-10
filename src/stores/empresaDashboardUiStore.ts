import { create } from "zustand";

import type { SlideDirection } from "@/lib/motion";

type EmpresaDashboardUiState = {
  expandedId: string | null;
  expandDirection: SlideDirection;

  toggleExpand: (ofertaId: string) => void;
  collapseAll: () => void;
};

export const useEmpresaDashboardUiStore = create<EmpresaDashboardUiState>((set, get) => ({
  expandedId: null,
  expandDirection: "forward",

  toggleExpand: (ofertaId) => {
    const { expandedId } = get();
    if (expandedId === ofertaId) {
      set({ expandedId: null, expandDirection: "back" });
      return;
    }
    set({ expandedId: ofertaId, expandDirection: "forward" });
  },

  collapseAll: () => set({ expandedId: null, expandDirection: "back" }),
}));
