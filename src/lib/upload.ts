import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

import type { ArchivoAdjuntoMeta, LogoArchivoMeta } from "@/types/bolsa";

const BASES_MAX_BYTES = 15 * 1024 * 1024;
const BASES_ACCEPT_EXT = [".pdf", ".doc", ".docx", ".txt"];

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "ofertas");

export async function guardarArchivosOferta(
  ofertaId: string,
  files: File[]
): Promise<LogoArchivoMeta[]> {
  if (!files.length) return [];

  const dir = path.join(UPLOAD_ROOT, ofertaId);
  await mkdir(dir, { recursive: true });

  const metas: LogoArchivoMeta[] = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${safeName}`;
    const diskPath = path.join(dir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(diskPath, buffer);

    metas.push({
      name: file.name,
      path: `/uploads/ofertas/${ofertaId}/${filename}`,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
    });
  }

  return metas;
}

async function limpiarBasesAnteriores(dir: string): Promise<void> {
  try {
    const entries = await readdir(dir);
    await Promise.all(
      entries
        .filter((name) => name.startsWith("bases-"))
        .map((name) => unlink(path.join(dir, name)).catch(() => undefined))
    );
  } catch {
    /* directorio nuevo */
  }
}

export async function guardarBasesOferta(
  ofertaId: string,
  file: File
): Promise<ArchivoAdjuntoMeta> {
  const ext = path.extname(file.name).toLowerCase();
  if (!BASES_ACCEPT_EXT.includes(ext)) {
    throw new Error("Formato no permitido. Usa PDF, Word o TXT.");
  }
  if (file.size > BASES_MAX_BYTES) {
    throw new Error("Las bases no pueden superar 15 MB.");
  }

  const dir = path.join(UPLOAD_ROOT, ofertaId);
  await mkdir(dir, { recursive: true });
  // Solo se conserva el último archivo de bases.
  await limpiarBasesAnteriores(dir);

  const filename = `bases-${Date.now()}${ext}`;
  const diskPath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  return {
    name: file.name,
    path: `/uploads/ofertas/${ofertaId}/${filename}`,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}
