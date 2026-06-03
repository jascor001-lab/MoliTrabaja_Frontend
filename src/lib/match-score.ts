type OfertaMatchInput = {
  titulo: string;
  funciones: string;
  descripcion: string;
  perfil: string;
  conocimientos: string[];
  carreras: string[];
};

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
  const keywords = Array.from(
    new Set([
      ...oferta.conocimientos,
      ...oferta.carreras,
      ...oferta.titulo.split(/\s+/),
      ...oferta.perfil.split(/\s+/),
    ])
  ).filter((k) => k.length > 2);

  const cvText = [
    ...cv.stack,
    ...cv.skills,
    ...cv.education,
    ...postulanteConocimientos,
    ...postulanteCarreras,
    String(cv.experience.years),
  ]
    .join(" ")
    .toLowerCase();

  if (keywords.length === 0) {
    const base = cv.stack.length * 12 + cv.experience.years * 5;
    return Math.min(100, Math.max(25, base));
  }

  let hits = 0;
  for (const kw of keywords) {
    if (cvText.includes(kw.toLowerCase())) hits++;
  }

  const ratio = hits / keywords.length;
  let score = Math.round(ratio * 85 + Math.min(cv.experience.years * 3, 15));
  if (cv.stack.length >= 5) score = Math.min(100, score + 5);

  return Math.min(100, Math.max(0, score));
}
