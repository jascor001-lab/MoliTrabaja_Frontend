import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = [".pdf"];

export async function guardarCvPostulante(
  dni: string,
  file: File
): Promise<{ path: string; name: string }> {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED.includes(ext)) {
    throw new Error("Formato de CV no permitido. Solo se acepta PDF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("El CV no puede superar 10 MB.");
  }

  const dir = path.join(process.cwd(), "public", "uploads", "cv", dni);
  await mkdir(dir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return {
    path: `/uploads/cv/${dni}/${filename}`,
    name: file.name,
  };
}
