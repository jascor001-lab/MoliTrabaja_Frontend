-- Declaración de discapacidad / puestos inclusivos en el perfil del postulante.
ALTER TABLE "Postulante" ADD COLUMN "tieneDiscapacidad" BOOLEAN NOT NULL DEFAULT false;
