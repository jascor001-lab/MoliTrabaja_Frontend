/** Helpers de CV seguros para cliente y servidor (sin fs/path de Node). */

export function cvViewUrl(ofertaId: string, dni: string): string {
  return `/api/ofertas/${ofertaId}/postulaciones/${dni}/cv`;
}

/** Nombre legible del CV guardado (sin timestamp interno). */
export function nombreArchivoCv(cvPath: string | null | undefined): string | null {
  if (!cvPath) return null;
  const base = cvPath.split("/").pop();
  if (!base) return null;
  const parts = base.split("-");
  return parts.length > 1 ? parts.slice(1).join("-") : base;
}

export function perfilCvViewUrl(): string {
  return "/api/auth/perfil/postulante/cv";
}
