/** Utilidades de movimiento (respeta prefers-reduced-motion vía clases). */

export type SlideDirection = "forward" | "back" | "fade";

export const MOTION_REDUCE =
  "motion-reduce:animate-none motion-reduce:[animation:none]";

export const MOTION_DURATION_MS = 520;
export const DRAWER_DURATION_MS = 380;
export const PAGE_DURATION_MS = 560;

const SLIDE_DURATION_MS = MOTION_DURATION_MS;
export { SLIDE_DURATION_MS };

function routeRank(path: string): number {
  if (path.startsWith("/empresa/ofertas/")) return 40;
  if (path.startsWith("/empresa/ofertas")) return 35;
  if (path.startsWith("/empresa/publicar")) return 30;
  if (path.startsWith("/empresa")) return 20;
  if (path.startsWith("/personal/postulaciones")) return 16;
  if (path.startsWith("/personal/perfil")) return 14;
  if (path.startsWith("/personal")) return 10;
  if (path.startsWith("/ingresar") || path.startsWith("/registro")) return 5;
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

export function motionEnterClass(direction: SlideDirection): string {
  if (direction === "back") return "motion-enter-back";
  if (direction === "fade") return "motion-enter-fade";
  return "motion-enter-forward";
}

export function motionExitClass(direction: SlideDirection): string {
  if (direction === "back") return "motion-exit-back";
  if (direction === "fade") return "motion-exit-fade";
  return "motion-exit-forward";
}

/** Transición entre páginas. */
export function pageEnterClass(direction: NavDirection): string {
  if (direction === "forward") return "motion-page-forward motion-gpu";
  if (direction === "back") return "motion-page-back motion-gpu";
  return "motion-page-neutral motion-gpu";
}

/** @deprecated Usar motionEnterClass vía SlideView */
export function viewSlideClass(direction: SlideDirection = "forward"): string {
  return `${motionEnterClass(direction)} motion-gpu`;
}

export function viewFadeClass(): string {
  return "motion-enter-fade motion-gpu";
}

export function drawerEnterClass(): string {
  return "motion-drawer-in motion-gpu";
}

export function drawerExitClass(): string {
  return "motion-drawer-out motion-gpu";
}

export function staggerDelay(index: number, base = 0, step = 42): number {
  return Math.min(base + index * step, 360);
}

export type StaggerStyle = {
  animationDelay: string;
  animationFillMode: "both";
};

export function staggerStyleObj(index: number, base = 0, step = 42): StaggerStyle {
  return {
    animationDelay: `${staggerDelay(index, base, step)}ms`,
    animationFillMode: "both",
  };
}
