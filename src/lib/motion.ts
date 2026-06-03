/** Utilidades de movimiento (respeta prefers-reduced-motion vía clases Tailwind). */

export const MOTION_REDUCE =
  "motion-reduce:animate-none motion-reduce:transition-none";

function routeRank(path: string): number {
  if (path.startsWith("/empresa/ofertas/")) return 40;
  if (path.startsWith("/empresa/publicar")) return 30;
  if (path.startsWith("/empresa")) return 20;
  if (path.startsWith("/personal")) return 10;
  return 0;
}

export type NavDirection = "forward" | "back" | "neutral";

export function getNavDirection(from: string, to: string): NavDirection {
  if (from === to) return "neutral";
  const a = routeRank(from);
  const b = routeRank(to);
  if (b > a) return "forward";
  if (b < a) return "back";
  return "neutral";
}

/** Transición entre páginas/ventanas: solo desvanecido (sin slide lateral). */
export function pageEnterClass(_direction: NavDirection): string {
  return "animate-page-fade-in";
}

/** Cambio de contenido dentro de la misma vista (modal, pasos, paneles). */
export function viewFadeClass(): string {
  return "animate-fade-in";
}

export function staggerDelay(index: number, base = 0, step = 60): number {
  return base + index * step;
}
