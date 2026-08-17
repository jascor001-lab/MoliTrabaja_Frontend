-- Vacantes inclusivas para el filtro de discapacidad del portal.
ALTER TABLE "OfertaLaboral" ADD COLUMN "aptoDiscapacidad" BOOLEAN NOT NULL DEFAULT false;
