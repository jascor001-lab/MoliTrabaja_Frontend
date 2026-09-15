import type { CvParsed } from "@/types/postulacion";

export type OfertaMatchInput = {
  titulo: string;
  funciones: string;
  descripcion: string;
  perfil: string;
  conocimientos: string[];
  carreras: string[];
};

export type MatchBreakdown = {
  percentage: number;
  carreras: {
    weight: number;
    score: number;
    matched: string[];
    missing: string[];
  };
  conocimientos: {
    weight: number;
    score: number;
    matched: string[];
    missing: string[];
  };
  cv: {
    weight: number;
    score: number;
    hits: string[];
  };
  experiencia: {
    weight: number;
    score: number;
    years: number;
  };
};

function norm(s: string) {
  return s.trim().toLowerCase();
}

function includesLoose(haystack: string, needle: string) {
  const n = norm(needle);
  if (n.length < 2) return false;
  return haystack.includes(n);
}

function ratioScore(matched: number, total: number, weight: number) {
  if (total <= 0) return 0;
  return Math.round((matched / total) * weight);
}

/**
 * Encaje interactivo:
 * - Carreras del perfil vs oferta (hasta 30)
 * - Conocimientos del perfil vs oferta (hasta 35)
 * - Skills/texto del CV parseado (hasta 25)
 * - Años de experiencia detectados en el CV (hasta 10)
 */
export function calcularMatchDetalle(
  cv: {
    stack: string[];
    skills: string[];
    education: string[];
    experience: { years: number };
  },
  oferta: OfertaMatchInput,
  postulanteConocimientos: string[] = [],
  postulanteCarreras: string[] = []
): MatchBreakdown {
  const reqCarreras = oferta.carreras.filter((c) => c.trim().length > 0);
  const reqConoc = oferta.conocimientos.filter((c) => c.trim().length > 0);

  const carrerasSet = new Set(postulanteCarreras.map(norm));
  const conocSet = new Set(postulanteConocimientos.map(norm));

  const carrerasMatched = reqCarreras.filter((c) => carrerasSet.has(norm(c)));
  const carrerasMissing = reqCarreras.filter((c) => !carrerasSet.has(norm(c)));
  const conocMatched = reqConoc.filter((c) => conocSet.has(norm(c)));
  const conocMissing = reqConoc.filter((c) => !conocSet.has(norm(c)));

  const hasCarreras = reqCarreras.length > 0;
  const hasConoc = reqConoc.length > 0;

  let wCarreras = hasCarreras ? 30 : 0;
  let wConoc = hasConoc ? 35 : 0;
  let wCv = 25;
  let wExp = 10;

  // Redistribuir pesos si la oferta no pide carreras/conocimientos.
  const liberados = (hasCarreras ? 0 : 30) + (hasConoc ? 0 : 35);
  if (liberados > 0) {
    wCv += Math.round(liberados * 0.7);
    wExp += liberados - Math.round(liberados * 0.7);
  }

  const cvBag = [
    ...cv.stack,
    ...cv.skills,
    ...cv.education,
    ...postulanteConocimientos,
    ...postulanteCarreras,
  ]
    .join(" ")
    .toLowerCase();

  const ofertaKeywords = Array.from(
    new Set([
      ...reqConoc,
      ...reqCarreras,
      ...oferta.titulo.split(/\s+/),
      ...oferta.perfil.split(/\s+/),
      ...oferta.funciones.split(/\s+/),
    ])
  ).filter((k) => k.trim().length > 2);

  const cvHits = ofertaKeywords.filter((kw) => includesLoose(cvBag, kw));
  const years = Math.max(0, Number(cv.experience?.years) || 0);

  const carrerasScore = hasCarreras
    ? ratioScore(carrerasMatched.length, reqCarreras.length, wCarreras)
    : 0;
  const conocScore = hasConoc
    ? ratioScore(conocMatched.length, reqConoc.length, wConoc)
    : 0;
  const cvScore =
    ofertaKeywords.length > 0
      ? ratioScore(cvHits.length, ofertaKeywords.length, wCv)
      : Math.min(wCv, cv.stack.length * 4);
  const expScore = Math.min(wExp, Math.round(Math.min(years, 8) * (wExp / 8)));

  const percentage = Math.min(
    100,
    Math.max(0, carrerasScore + conocScore + cvScore + expScore)
  );

  return {
    percentage,
    carreras: {
      weight: wCarreras,
      score: carrerasScore,
      matched: carrerasMatched,
      missing: carrerasMissing,
    },
    conocimientos: {
      weight: wConoc,
      score: conocScore,
      matched: conocMatched,
      missing: conocMissing,
    },
    cv: {
      weight: wCv,
      score: cvScore,
      hits: cvHits.slice(0, 12),
    },
    experiencia: {
      weight: wExp,
      score: expScore,
      years,
    },
  };
}

export function calcularMatchScorePercentage(
  cv: {
    stack: string[];
    skills: string[];
    education: string[];
    experience: { years: number };
  },
  oferta: OfertaMatchInput,
  postulanteConocimientos: string[] = [],
  postulanteCarreras: string[] = []
): number {
  return calcularMatchDetalle(
    cv,
    oferta,
    postulanteConocimientos,
    postulanteCarreras
  ).percentage;
}

export function resumenCvParsed(cv: CvParsed) {
  return {
    skills: cv.stack?.length ? cv.stack : cv.skills ?? [],
    experience_years: cv.experience?.years ?? cv.experience_years ?? 0,
    education: cv.education ?? [],
  };
}
