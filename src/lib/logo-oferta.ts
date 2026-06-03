import type { LogoArchivoMeta, OfertaLaboralDTO } from "@/types/bolsa";

function isImageFile(meta: LogoArchivoMeta): boolean {
  if (!meta.path || meta.path.length < 2) return false;
  if (meta.mimeType.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(meta.name);
}

export function pickLogoFromArchivos(archivos: LogoArchivoMeta[]): string | null {
  const image = archivos.find(isImageFile);
  return image?.path ?? null;
}

/** URL pública del logo a mostrar en cards y detalle de convocatoria. */
export function getOfertaLogoUrl(oferta: OfertaLaboralDTO): string | null {
  const fromOferta = pickLogoFromArchivos(oferta.logoArchivos);
  if (fromOferta) return fromOferta;
  if (oferta.empresa?.logo) return oferta.empresa.logo;
  return null;
}
