import { create } from "zustand";

import type { SlideDirection } from "@/lib/motion";
import type {
  CatalogoCarreraDTO,
  CatalogoConocimientoDTO,
  CatalogoInstitucionDTO,
  ConocimientoPostulanteDTO,
  EducacionDTO,
  ExpLaboralDTO,
  PaisDTO,
  TipoDocDTO,
} from "@/types/catalogos";
import type { Genero } from "@/types/postulacion";

export type PerfilSection =
  | "personal"
  | "curriculum"
  | "educacion"
  | "experiencia"
  | "conocimientos";

const SECTION_ORDER: PerfilSection[] = [
  "personal",
  "curriculum",
  "educacion",
  "experiencia",
  "conocimientos",
];

export type PerfilPersonal = {
  tipoDocId: number;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  paisId: number;
  genero: Genero;
  estadoCivil: string;
  correo: string;
  telefono: string;
  direccionLiteral: string;
  latitud: string;
  longitud: string;
  tieneDiscapacidad: boolean;
};

export type CatalogosPerfil = {
  tiposDoc: TipoDocDTO[];
  paises: PaisDTO[];
  carreras: CatalogoCarreraDTO[];
  conocimientos: CatalogoConocimientoDTO[];
  instituciones: CatalogoInstitucionDTO[];
};

type PerfilPostulanteState = {
  loading: boolean;
  saving: boolean;
  error: string | null;
  message: string | null;
  section: PerfilSection;
  sectionDirection: SlideDirection;
  catalogos: CatalogosPerfil | null;
  personal: PerfilPersonal | null;
  cvDisponible: boolean;
  cvFilename: string | null;
  educaciones: EducacionDTO[];
  experiencias: ExpLaboralDTO[];
  conocimientos: ConocimientoPostulanteDTO[];
  educacionFormOpen: boolean;
  editingEducacionId: string | null;

  setSection: (section: PerfilSection) => void;
  setPersonalField: <K extends keyof PerfilPersonal>(
    key: K,
    value: PerfilPersonal[K]
  ) => void;
  setEducacionFormOpen: (open: boolean, editingId?: string | null) => void;
  loadAll: () => Promise<void>;
  savePersonal: () => Promise<boolean>;
  uploadCv: (file: File) => Promise<boolean>;
  addEducacion: (
    payload: Record<string, unknown>,
    documento: File | null
  ) => Promise<boolean>;
  updateEducacion: (
    id: string,
    payload: Record<string, unknown>,
    documento: File | null
  ) => Promise<boolean>;
  removeEducacion: (id: string) => Promise<boolean>;
  addExperiencia: (
    payload: Record<string, unknown>,
    documento: File | null
  ) => Promise<boolean>;
  removeExperiencia: (id: string) => Promise<boolean>;
  addConocimiento: (
    payload: Record<string, unknown>,
    documento: File | null
  ) => Promise<boolean>;
  removeConocimiento: (id: string) => Promise<boolean>;
  clearFeedback: () => void;
};

function directionForSection(from: PerfilSection, to: PerfilSection): SlideDirection {
  return SECTION_ORDER.indexOf(to) >= SECTION_ORDER.indexOf(from) ? "forward" : "back";
}

function buildPerfilFormData(
  payload: Record<string, unknown>,
  documento: File | null
): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value != null && value !== "") {
      fd.append(key, String(value));
    }
  }
  if (documento) {
    fd.append("documento", documento);
  }
  return fd;
}

export const usePerfilPostulanteStore = create<PerfilPostulanteState>((set, get) => ({
  loading: true,
  saving: false,
  error: null,
  message: null,
  section: "personal",
  sectionDirection: "fade",
  catalogos: null,
  personal: null,
  cvDisponible: false,
  cvFilename: null,
  educaciones: [],
  experiencias: [],
  conocimientos: [],
  educacionFormOpen: false,
  editingEducacionId: null,

  setSection: (section) => {
    const prev = get().section;
    set({
      section,
      sectionDirection: directionForSection(prev, section),
      educacionFormOpen: false,
      editingEducacionId: null,
      message: null,
      error: null,
    });
  },

  setPersonalField: (key, value) => {
    const personal = get().personal;
    if (!personal) return;
    set({ personal: { ...personal, [key]: value } });
  },

  setEducacionFormOpen: (open, editingId = null) => {
    set({ educacionFormOpen: open, editingEducacionId: editingId });
  },

  clearFeedback: () => set({ error: null, message: null }),

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const [perfilRes, catRes] = await Promise.all([
        fetch("/api/auth/perfil/postulante"),
        fetch("/api/catalogos"),
      ]);
      const perfil = await perfilRes.json();
      const cat = await catRes.json();
      if (!perfilRes.ok) throw new Error(perfil.error ?? "Error al cargar perfil");

      set({
        catalogos: {
          tiposDoc: cat.tiposDoc ?? [],
          paises: cat.paises ?? [],
          carreras: cat.carreras ?? [],
          conocimientos: cat.conocimientos ?? [],
          instituciones: cat.instituciones ?? [],
        },
        personal: {
          tipoDocId: perfil.tipoDocId ?? 1,
          numeroDocumento: perfil.numeroDocumento ?? perfil.dni ?? "",
          nombres: perfil.nombres ?? "",
          apellidoPaterno: perfil.apellidoPaterno ?? "",
          apellidoMaterno: perfil.apellidoMaterno ?? "",
          fechaNacimiento: perfil.fechaNacimiento ?? "",
          paisId: perfil.paisId ?? 1,
          genero: perfil.genero ?? "Masculino",
          estadoCivil: perfil.estadoCivil ?? "Soltero",
          correo: perfil.correo ?? "",
          telefono: perfil.telefono ?? "",
          direccionLiteral: perfil.direccionLiteral ?? perfil.direccion ?? "",
          latitud: perfil.latitud ?? "",
          longitud: perfil.longitud ?? "",
          tieneDiscapacidad: Boolean(perfil.tieneDiscapacidad),
        },
        cvDisponible: Boolean(perfil.cvDisponible),
        cvFilename: perfil.cvFilename ?? null,
        educaciones: perfil.educaciones ?? [],
        experiencias: perfil.experiencias ?? [],
        conocimientos: perfil.conocimientos ?? [],
        loading: false,
      });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Error al cargar",
      });
    }
  },

  savePersonal: async () => {
    const { personal } = get();
    if (!personal) return false;
    set({ saving: true, error: null, message: null });
    try {
      const res = await fetch("/api/auth/perfil/postulante", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personal),
      });
      const data = await res.json();
      if (!res.ok) {
        const err =
          data.errors?.numeroDocumento ??
          data.errors?.tipoDocId ??
          data.errors?.direccionLiteral ??
          data.errors?.telefono ??
          data.error ??
          "No se pudo guardar";
        throw new Error(err);
      }
      set({
        personal: {
          ...personal,
          tipoDocId: data.tipoDocId,
          numeroDocumento: data.numeroDocumento,
          nombres: data.nombres,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          tieneDiscapacidad: Boolean(data.tieneDiscapacidad),
        },
        cvDisponible: Boolean(data.cvDisponible ?? get().cvDisponible),
        cvFilename: data.cvFilename ?? get().cvFilename,
        educaciones: data.educaciones ?? get().educaciones,
        experiencias: data.experiencias ?? get().experiencias,
        conocimientos: data.conocimientos ?? get().conocimientos,
        message: "Datos personales guardados.",
        saving: false,
      });
      return true;
    } catch (e) {
      set({
        saving: false,
        error: e instanceof Error ? e.message : "Error al guardar",
      });
      return false;
    }
  },

  uploadCv: async (file) => {
    set({ saving: true, error: null, message: null });
    try {
      const fd = new FormData();
      fd.append("cv", file);
      const res = await fetch("/api/auth/perfil/postulante/cv", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar el CV");
      set({
        cvDisponible: true,
        cvFilename: data.cvFilename ?? file.name,
        message: data.message ?? "CV guardado en tu perfil.",
        saving: false,
      });
      return true;
    } catch (e) {
      set({
        saving: false,
        error: e instanceof Error ? e.message : "Error al subir el CV",
      });
      return false;
    }
  },

  addEducacion: async (payload, documento) => {
    set({ saving: true, error: null, message: null });
    try {
      const res = await fetch("/api/auth/perfil/postulante/educaciones", {
        method: "POST",
        body: buildPerfilFormData(payload, documento),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.errors?.carreraId ??
            data.errors?.institucion ??
            data.error ??
            "No se pudo guardar"
        );
      }
      set((s) => ({
        educaciones: [...s.educaciones, data.educacion],
        catalogos:
          s.catalogos &&
          data.institucion &&
          !s.catalogos.instituciones.some(
            (institucion) => institucion.id === data.institucion.id
          )
            ? {
                ...s.catalogos,
                instituciones: [
                  ...s.catalogos.instituciones,
                  data.institucion,
                ].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
              }
            : s.catalogos,
        educacionFormOpen: false,
        editingEducacionId: null,
        message: "Formación académica agregada.",
        saving: false,
      }));
      return true;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "Error" });
      return false;
    }
  },

  updateEducacion: async (id, payload, documento) => {
    set({ saving: true, error: null, message: null });
    try {
      const res = await fetch(`/api/auth/perfil/postulante/educaciones/${id}`, {
        method: "PATCH",
        body: buildPerfilFormData(payload, documento),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo actualizar");
      set((s) => ({
        educaciones: s.educaciones.map((e) =>
          e.id === id ? data.educacion : e
        ),
        catalogos:
          s.catalogos &&
          data.institucion &&
          !s.catalogos.instituciones.some(
            (institucion) => institucion.id === data.institucion.id
          )
            ? {
                ...s.catalogos,
                instituciones: [
                  ...s.catalogos.instituciones,
                  data.institucion,
                ].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
              }
            : s.catalogos,
        educacionFormOpen: false,
        editingEducacionId: null,
        message: "Formación académica actualizada.",
        saving: false,
      }));
      return true;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "Error" });
      return false;
    }
  },

  removeEducacion: async (id) => {
    set({ saving: true, error: null });
    try {
      const res = await fetch(`/api/auth/perfil/postulante/educaciones/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "No se pudo eliminar");
      }
      set((s) => ({
        educaciones: s.educaciones.filter((e) => e.id !== id),
        message: "Registro eliminado.",
        saving: false,
      }));
      return true;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "Error" });
      return false;
    }
  },

  addExperiencia: async (payload, documento) => {
    set({ saving: true, error: null, message: null });
    try {
      const res = await fetch("/api/auth/perfil/postulante/experiencias", {
        method: "POST",
        body: buildPerfilFormData(payload, documento),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo guardar");
      }
      set((s) => ({
        experiencias: [...s.experiencias, data.experiencia],
        message: "Experiencia laboral agregada.",
        saving: false,
      }));
      return true;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "Error" });
      return false;
    }
  },

  removeExperiencia: async (id) => {
    set({ saving: true, error: null });
    try {
      const res = await fetch(`/api/auth/perfil/postulante/experiencias/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error");
      set((s) => ({
        experiencias: s.experiencias.filter((e) => e.id !== id),
        message: "Experiencia eliminada.",
        saving: false,
      }));
      return true;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "Error" });
      return false;
    }
  },

  addConocimiento: async (payload, documento) => {
    set({ saving: true, error: null, message: null });
    try {
      const res = await fetch("/api/auth/perfil/postulante/conocimientos", {
        method: "POST",
        body: buildPerfilFormData(payload, documento),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.errors?.conocimientoId ??
            data.errors?.institucion ??
            data.error ??
            "No se pudo guardar"
        );
      }
      set((s) => {
        let catalogos = s.catalogos;

        if (
          catalogos &&
          data.catalogoConocimiento &&
          !catalogos.conocimientos.some(
            (item) => item.id === data.catalogoConocimiento.id
          )
        ) {
          catalogos = {
            ...catalogos,
            conocimientos: [
              ...catalogos.conocimientos,
              data.catalogoConocimiento,
            ].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
          };
        }

        if (
          catalogos &&
          data.institucion &&
          !catalogos.instituciones.some(
            (item) => item.id === data.institucion.id
          )
        ) {
          catalogos = {
            ...catalogos,
            instituciones: [...catalogos.instituciones, data.institucion].sort(
              (a, b) => a.nombre.localeCompare(b.nombre, "es")
            ),
          };
        }

        return {
          conocimientos: [...s.conocimientos, data.conocimiento],
          catalogos,
          message: "Conocimiento agregado.",
          saving: false,
        };
      });
      return true;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "Error" });
      return false;
    }
  },

  removeConocimiento: async (id) => {
    set({ saving: true, error: null });
    try {
      const res = await fetch(`/api/auth/perfil/postulante/conocimientos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error");
      set((s) => ({
        conocimientos: s.conocimientos.filter((c) => c.id !== id),
        message: "Conocimiento eliminado.",
        saving: false,
      }));
      return true;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : "Error" });
      return false;
    }
  },
}));
