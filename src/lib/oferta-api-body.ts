import type { CrearOfertaInput } from "@/types/bolsa";

export type PayloadConFlags = CrearOfertaInput & {
  enviarLogoPorCorreo?: boolean;
  estado?: string;
};

export async function parseOfertaBody(request: Request): Promise<{
  payload: PayloadConFlags;
  logoFiles: File[];
  basesFile: File | null;
}> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const raw = form.get("data");
    if (typeof raw !== "string") {
      throw new Error("Datos de la solicitud inválidos");
    }
    const payload = JSON.parse(raw) as PayloadConFlags;
    const logoFiles = form
      .getAll("logoFiles")
      .filter((f): f is File => f instanceof File);
    const basesRaw = form.get("basesFile");
    const basesFile =
      basesRaw instanceof File && basesRaw.size > 0 ? basesRaw : null;
    return { payload, logoFiles, basesFile };
  }

  const payload = (await request.json()) as PayloadConFlags;
  return { payload, logoFiles: [], basesFile: null };
}

export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const raw = String(iso).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
