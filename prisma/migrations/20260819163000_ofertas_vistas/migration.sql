-- Ofertas abiertas/vistas por el postulante (filtro Vistos / No vistos del portal).
CREATE TABLE IF NOT EXISTS "ofertas_vistas" (
  "postulante_id" UUID NOT NULL,
  "oferta_id" UUID NOT NULL,
  "visto_en" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "ofertas_vistas_pkey" PRIMARY KEY ("postulante_id", "oferta_id"),
  CONSTRAINT "ofertas_vistas_postulante_fkey"
    FOREIGN KEY ("postulante_id") REFERENCES "postulantes"("id") ON DELETE CASCADE,
  CONSTRAINT "ofertas_vistas_oferta_fkey"
    FOREIGN KEY ("oferta_id") REFERENCES "ofertas_laborales"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ofertas_vistas_oferta_idx" ON "ofertas_vistas"("oferta_id");
CREATE INDEX IF NOT EXISTS "ofertas_vistas_postulante_idx" ON "ofertas_vistas"("postulante_id");
