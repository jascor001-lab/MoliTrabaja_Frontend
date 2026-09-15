import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { backendUrl } from "@/lib/backend";
import { parseCvParsed } from "@/lib/dashboard-postulacion";
import { prisma } from "@/lib/db";
import {
  calcularMatchDetalle,
  type MatchBreakdown,
} from "@/lib/match-score";
import type { CandidateActionable, DashboardDualResponse } from "@/types/postulacion";

export const runtime = "nodejs";

type Params = { params: { id: string } };

async function enrichPool(
  ofertaId: string,
  pool: CandidateActionable[]
): Promise<CandidateActionable[]> {
  if (pool.length === 0) return pool;

  const oferta = await prisma.ofertaLaboral.findUnique({
    where: { id: ofertaId },
    include: {
      carreras: { include: { carrera: true } },
      conocimientos: { include: { conocimiento: true } },
    },
  });
  if (!oferta) return pool;

  const dnis = pool.map((p) => p.dni);
  const postulantes = await prisma.postulante.findMany({
    where: { numeroDocumento: { in: dnis } },
    include: {
      educaciones: { include: { carrera: true } },
      conocimientos: { include: { conocimiento: true } },
    },
  });
  const byDni = new Map(postulantes.map((p) => [p.numeroDocumento, p]));

  const matchOferta = {
    titulo: oferta.titulo,
    funciones: oferta.funciones,
    descripcion: oferta.descripcion,
    perfil: oferta.perfil,
    carreras: oferta.carreras.map((c) => c.carrera.nombre),
    conocimientos: oferta.conocimientos.map((k) => k.conocimiento.nombre),
  };

  return pool.map((candidate) => {
    const post = byDni.get(candidate.dni);
    if (!post) return candidate;

    const cv = parseCvParsed(post.cvParsed);
    const postCarr = post.educaciones.map((e) => e.carrera.nombre);
    const postConoc = post.conocimientos.map((k) => k.conocimiento.nombre);
    const detalle = calcularMatchDetalle(cv, matchOferta, postConoc, postCarr);

    return {
      ...candidate,
      match_score_percentage: detalle.percentage,
      match_detalle: detalle,
      requisitos: {
        carreras_requeridas: matchOferta.carreras,
        carreras_cumplidas: detalle.carreras.matched,
        conocimientos_requeridos: matchOferta.conocimientos,
        conocimientos_cumplidos: detalle.conocimientos.matched,
      },
    };
  });
}

export async function GET(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = `${backendUrl()}/ofertas/${params.id}/postulaciones${request.nextUrl.search}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el API" },
      { status: 503 }
    );
  }

  const json = (await res.json().catch(() => ({}))) as DashboardDualResponse & {
    error?: string;
  };
  if (!res.ok) {
    return NextResponse.json(json, { status: res.status });
  }

  try {
    const pool = json.pestaña_empresa_view?.candidate_pool_actionable ?? [];
    const enriched = await enrichPool(params.id, pool);
    return NextResponse.json({
      ...json,
      pestaña_empresa_view: {
        ...json.pestaña_empresa_view,
        candidate_pool_actionable: enriched,
      },
    });
  } catch {
    return NextResponse.json(json);
  }
}

export type { MatchBreakdown };
