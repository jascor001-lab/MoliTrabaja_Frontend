export const ROLES = ["admin", "empresa", "postulante"] as const;
export type RolNombre = (typeof ROLES)[number];

export const ROL_ETIQUETA: Record<RolNombre, string> = {
  admin: "Administrador",
  empresa: "Empresa",
  postulante: "Postulante",
};

export const PERMISOS_POR_ROL: Record<
  RolNombre,
  { codigo: string; descripcion: string }[]
> = {
  admin: [
    { codigo: "usuarios.crear", descripcion: "Crear usuarios y asignarles un rol" },
    { codigo: "usuarios.listar", descripcion: "Ver y desactivar usuarios" },
    { codigo: "roles.gestionar", descripcion: "Ver roles y permisos del sistema" },
    { codigo: "empresas.ver", descripcion: "Ver todas las empresas" },
    { codigo: "ofertas.ver", descripcion: "Ver todas las ofertas" },
    { codigo: "postulantes.ver", descripcion: "Ver postulantes" },
  ],
  empresa: [
    { codigo: "ofertas.crear", descripcion: "Publicar ofertas laborales" },
    { codigo: "ofertas.editar", descripcion: "Editar sus ofertas" },
    { codigo: "postulaciones.gestionar", descripcion: "Gestionar postulaciones de sus vacantes" },
    { codigo: "perfil.empresa.editar", descripcion: "Editar el perfil de la empresa" },
  ],
  postulante: [
    { codigo: "ofertas.ver", descripcion: "Ver ofertas del portal" },
    { codigo: "postulaciones.crear", descripcion: "Postular a vacantes" },
    { codigo: "perfil.postulante.editar", descripcion: "Editar su perfil y CV" },
  ],
};

export function esRol(valor: string): valor is RolNombre {
  return (ROLES as readonly string[]).includes(valor);
}

export function rolPrincipal(nombres: string[]): RolNombre {
  if (nombres.includes("admin")) return "admin";
  if (nombres.includes("empresa")) return "empresa";
  if (nombres.includes("postulante")) return "postulante";
  return "postulante";
}
