import { access } from "fs/promises";
import path from "path";

import type { PerfilDocTipo } from "@/lib/upload-perfil-doc";

const PERFIL_ROOT = path.join(process.cwd(), "public", "uploads", "perfil");

export type PerfilDocFileInfo = {
  absolutePath: string;
  fileName: string;
  mime: string;
};

export function perfilDocumentoViewUrl(
  ofertaId: string,
  dni: string,
  tipo: PerfilDocTipo,
  itemId: string
): string {
  const params = new URLSearchParams({ tipo, itemId });
  return `/api/ofertas/${ofertaId}/postulaciones/${dni}/documento?${params}`;
}

export async function resolvePerfilDocumento(
  docPath: string | null | undefined
): Promise<PerfilDocFileInfo | null> {
  if (!docPath?.startsWith("/uploads/perfil/")) return null;

  const relative = docPath.replace(/^\//, "");
  const absolutePath = path.normalize(path.join(process.cwd(), "public", relative));

  if (!absolutePath.startsWith(PERFIL_ROOT)) return null;

  try {
    await access(absolutePath);
  } catch {
    return null;
  }

  const fileName = path.basename(absolutePath);
  const ext = path.extname(fileName).toLowerCase();
  if (ext !== ".pdf") return null;

  return {
    absolutePath,
    fileName,
    mime: "application/pdf",
  };
}

export function nombreArchivoDocumento(docPath: string | null | undefined): string | undefined {
  if (!docPath) return undefined;
  const base = path.basename(docPath);
  const parts = base.split("-");
  return parts.length > 2 ? parts.slice(2).join("-") : base;
}
