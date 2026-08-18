import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import type { EmpresaDTO, OfertaLaboralDTO } from "@/types/bolsa";

type PerfilPostulante = {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  correo: string;
  numeroDocumento?: string;
  cvDisponible?: boolean;
};

export async function requireEmpresa() {
  const session = await getSession();
  if (!session || session.tipo !== "empresa" || !session.empresaId) {
    redirect("/ingreso");
  }
  try {
    return await backendFetch<EmpresaDTO & { email?: string }>(
      `/empresas/${session.empresaId}`,
      { token: session.token }
    );
  } catch {
    redirect("/ingreso");
  }
}

export async function requirePostulante() {
  const session = await getSession();
  if (!session || session.tipo !== "postulante" || !session.postulanteId) {
    redirect("/ingreso");
  }
  try {
    return await backendFetch<PerfilPostulante>("/auth/perfil/postulante", {
      token: session.token,
    });
  } catch {
    redirect("/ingreso");
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.tipo !== "admin" || !session.usuarioId) {
    redirect("/ingreso");
  }
  return session;
}

export async function assertEmpresaOwnsOferta(empresaId: string, ofertaId: string) {
  const oferta = await backendFetch<OfertaLaboralDTO>(`/ofertas/${ofertaId}`);
  if (!oferta || oferta.empresaId !== empresaId) {
    throw new Error("No autorizado");
  }
}
