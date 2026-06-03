-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Postulacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "ofertaId" TEXT NOT NULL,
    "postulanteId" TEXT NOT NULL,
    "estadoSeguimiento" TEXT NOT NULL DEFAULT 'En Revisión',
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "rankingFit" TEXT NOT NULL DEFAULT 'Medium',
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Postulacion_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "OfertaLaboral" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Postulacion_postulanteId_fkey" FOREIGN KEY ("postulanteId") REFERENCES "Postulante" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Postulacion" ("codigo", "createdAt", "estadoSeguimiento", "id", "lastUpdate", "ofertaId", "postulanteId", "rankingFit", "updatedAt") SELECT "codigo", "createdAt", "estadoSeguimiento", "id", "lastUpdate", "ofertaId", "postulanteId", "rankingFit", "updatedAt" FROM "Postulacion";
DROP TABLE "Postulacion";
ALTER TABLE "new_Postulacion" RENAME TO "Postulacion";
CREATE UNIQUE INDEX "Postulacion_codigo_key" ON "Postulacion"("codigo");
CREATE INDEX "Postulacion_ofertaId_idx" ON "Postulacion"("ofertaId");
CREATE INDEX "Postulacion_postulanteId_idx" ON "Postulacion"("postulanteId");
CREATE UNIQUE INDEX "Postulacion_ofertaId_postulanteId_key" ON "Postulacion"("ofertaId", "postulanteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
