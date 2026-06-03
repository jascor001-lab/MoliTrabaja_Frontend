export type PostulacionGuardada = {
  application_id: string;
  job_id: string;
  job_title: string;
  empresa: string;
  created_at: string;
};

const STORAGE_KEY = "molitrabaja_mis_postulaciones";

export function guardarPostulacionLocal(item: PostulacionGuardada): void {
  if (typeof window === "undefined") return;
  const list = listarPostulacionesLocales();
  const sinDuplicado = list.filter(
    (p) => p.application_id !== item.application_id
  );
  sinDuplicado.unshift(item);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(sinDuplicado.slice(0, 20))
  );
}

export function listarPostulacionesLocales(): PostulacionGuardada[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PostulacionGuardada[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function sincronizarDni(dni: string): void {
  if (typeof window !== "undefined" && dni) {
    localStorage.setItem("molitrabaja_dni", dni);
  }
}
