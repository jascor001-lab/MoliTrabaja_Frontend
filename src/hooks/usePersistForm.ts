"use client";

import { useEffect } from "react";

const STORAGE_KEY = "encuesta_municipal";

// Hook: guarda automáticamente
export function usePersistForm(values: any) {
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch (e) {
      console.error("Error guardando encuesta", e);
    }
  }, [values]);
}

// Función: carga estado previo
export function loadPersistedForm() {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Función: limpia al finalizar
export function clearPersistedForm() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
