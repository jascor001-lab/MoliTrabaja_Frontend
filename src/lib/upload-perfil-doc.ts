import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 10 * 1024 * 1024;

export type PerfilDocTipo = "educacion" | "experiencia" | "conocimiento";

export async function guardarDocumentoPerfil(
  dni: string,
  tipo: PerfilDocTipo,
  itemId: string,
  file: File
): Promise<{ path: string; name: string }> {
  const ext = path.extname(file.name).toLowerCase();
  if (ext !== ".pdf") {
    throw new Error("Solo se permiten archivos PDF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("El PDF no puede superar 10 MB.");
  }

  const dir = path.join(process.cwd(), "public", "uploads", "perfil", dni, tipo);
  await mkdir(dir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${itemId}-${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return {
    path: `/uploads/perfil/${dni}/${tipo}/${filename}`,
    name: file.name,
  };
}
