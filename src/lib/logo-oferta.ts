import type { LogoArchivoMeta, OfertaLaboralDTO } from "@/types/bolsa";

function isImageFile(meta: LogoArchivoMeta): boolean {
  if (!meta.path || meta.path.length < 2) return false;
  if (meta.mimeType.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(meta.name);
}

export function pickLogoFromArchivos(archivos: LogoArchivoMeta[]): string | null {
  const images = archivos.filter(isImageFile);
  return images.at(-1)?.path ?? null;
}

/** URL pública del logo a mostrar en cards y detalle de convocatoria. */
export function getOfertaLogoUrl(oferta: OfertaLaboralDTO): string | null {
  const fromOferta = pickLogoFromArchivos(oferta.logoArchivos);
  if (fromOferta) return fromOferta;
  if (oferta.empresa?.logo) return oferta.empresa.logo;
  return null;
}

/** Normaliza path de logo/portada para <img src>. */
export function resolveLogoSrc(src: string): string {
  if (src.startsWith("blob:") || src.startsWith("data:") || src.startsWith("http")) {
    return src;
  }
  const normalized = src.replace(/\\/g, "/");
  const idx = normalized.toLowerCase().lastIndexOf("/uploads/");
  if (idx >= 0) return normalized.slice(idx);
  if (normalized.startsWith("uploads/")) return `/${normalized}`;
  return src.startsWith("/") ? src : `/${src}`;
}

