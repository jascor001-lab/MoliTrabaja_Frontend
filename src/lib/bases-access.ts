import { access } from "fs/promises";
import path from "path";

import type { ArchivoAdjuntoMeta } from "@/types/bolsa";

const BASES_ROOT = path.join(process.cwd(), "public", "uploads", "ofertas");

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain; charset=utf-8",
};

export type BasesFileInfo = {
  absolutePath: string;
  fileName: string;
  ext: string;
  mime: string;
  inline: boolean;
};

export function basesViewUrl(ofertaId: string, version?: string | null): string {
  const base = `/api/ofertas/${ofertaId}/bases`;
  if (!version) return base;
  return `${base}?v=${encodeURIComponent(version)}`;
}

export function parseBasesArchivo(raw: unknown): ArchivoAdjuntoMeta | null {
  if (!raw) return null;
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    if (!raw.trim()) return null;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "path" in parsed &&
    typeof (parsed as ArchivoAdjuntoMeta).path === "string" &&
    (parsed as ArchivoAdjuntoMeta).path.length > 1
  ) {
    return parsed as ArchivoAdjuntoMeta;
  }
  return null;
}

export function serializeBasesArchivo(meta: ArchivoAdjuntoMeta | null): string {
  return meta ? JSON.stringify(meta) : "";
}

export async function resolveBasesFile(
  meta: ArchivoAdjuntoMeta | null
): Promise<BasesFileInfo | null> {
  if (!meta?.path?.startsWith("/uploads/ofertas/")) return null;

  const relative = meta.path.replace(/^\//, "");
  const absolutePath = path.normalize(path.join(process.cwd(), "public", relative));

  if (!absolutePath.startsWith(BASES_ROOT)) return null;

  try {
    await access(absolutePath);
  } catch {
    return null;
  }

  const fileName = meta.name || path.basename(absolutePath);
  const ext = path.extname(fileName).toLowerCase();
  const mime = MIME_BY_EXT[ext] ?? meta.mimeType ?? "application/octet-stream";

  return {
    absolutePath,
    fileName,
    ext,
    mime,
    inline: ext === ".pdf" || ext === ".txt",
  };
}
