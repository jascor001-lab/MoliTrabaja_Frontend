import { access } from "fs/promises";
import path from "path";

const CV_ROOT = path.join(process.cwd(), "public", "uploads", "cv");

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain; charset=utf-8",
};

export type CvFileInfo = {
  absolutePath: string;
  fileName: string;
  ext: string;
  mime: string;
  inline: boolean;
};

export function cvViewUrl(ofertaId: string, dni: string): string {
  return `/api/ofertas/${ofertaId}/postulaciones/${dni}/cv`;
}

export async function resolveCvFile(cvPath: string | null): Promise<CvFileInfo | null> {
  if (!cvPath?.startsWith("/uploads/cv/")) return null;

  const relative = cvPath.replace(/^\//, "");
  const absolutePath = path.normalize(path.join(process.cwd(), "public", relative));

  if (!absolutePath.startsWith(CV_ROOT)) return null;

  try {
    await access(absolutePath);
  } catch {
    return null;
  }

  const fileName = path.basename(absolutePath);
  const ext = path.extname(fileName).toLowerCase();
  const mime = MIME_BY_EXT[ext] ?? "application/octet-stream";

  return {
    absolutePath,
    fileName,
    ext,
    mime,
    inline: ext === ".pdf" || ext === ".txt",
  };
}
