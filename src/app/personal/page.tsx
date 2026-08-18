import { AppShell } from "@/components/layout/AppShell";
import { PostulanteInicio } from "@/components/postulante/PostulanteInicio";
import { backendFetch } from "@/lib/backend";
import { requirePostulante } from "@/lib/require-auth";
import type { OfertaLaboralDTO } from "@/types/bolsa";
import type { MisPostulacionItem } from "@/types/postulacion";

export const dynamic = "force-dynamic";

type MisPostulacionesRes = {
  postulaciones?: MisPostulacionItem[];
};

export default async function PersonalInicioPage() {
  const postulante = await requirePostulante();

  let postulaciones: MisPostulacionItem[] = [];
  let ofertas: OfertaLaboralDTO[] = [];
  let cvDisponible = Boolean(postulante.cvDisponible);

  try {
    const mis = await backendFetch<MisPostulacionesRes>("/postulaciones/mis");
    postulaciones = mis.postulaciones ?? [];
  } catch {
    postulaciones = [];
  }

  try {
    ofertas = await backendFetch<OfertaLaboralDTO[]>("/ofertas?estado=Activa");
  } catch {
    ofertas = [];
  }

  return (
    <AppShell variant="postulante">
      <PostulanteInicio
        nombres={postulante.nombres}
        postulaciones={postulaciones}
        ofertas={ofertas}
        cvDisponible={cvDisponible}
      />
    </AppShell>
  );
}
