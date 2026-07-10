import { create } from "zustand";

import type { TipoUsuario } from "@/lib/auth";
import type { SlideDirection } from "@/lib/motion";

type AuthUiState = {
  loginTipo: TipoUsuario;
  loginTipoDirection: SlideDirection;

  setLoginTipo: (tipo: TipoUsuario) => void;
  resetLoginUi: () => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
  loginTipo: "empresa",
  loginTipoDirection: "fade",

  setLoginTipo: (tipo) =>
    set((s) => ({
      loginTipo: tipo,
      loginTipoDirection: tipo === "empresa" ? "forward" : "back",
    })),

  resetLoginUi: () =>
    set({ loginTipo: "empresa", loginTipoDirection: "fade" }),
}));
