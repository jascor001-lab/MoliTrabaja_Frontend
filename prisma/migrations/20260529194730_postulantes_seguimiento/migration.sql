-- CreateTable
CREATE TABLE "Postulante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dni" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "genero" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "cvPath" TEXT,
    "cvParsed" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Postulacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "ofertaId" TEXT NOT NULL,
    "postulanteId" TEXT NOT NULL,
    "estadoSeguimiento" TEXT NOT NULL DEFAULT 'Recibido',
    "rankingFit" TEXT NOT NULL DEFAULT 'Medium',
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Postulacion_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "OfertaLaboral" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Postulacion_postulanteId_fkey" FOREIGN KEY ("postulanteId") REFERENCES "Postulante" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Postulante_dni_key" ON "Postulante"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Postulacion_codigo_key" ON "Postulacion"("codigo");

-- CreateIndex
CREATE INDEX "Postulacion_ofertaId_idx" ON "Postulacion"("ofertaId");

-- CreateIndex
CREATE INDEX "Postulacion_postulanteId_idx" ON "Postulacion"("postulanteId");

-- CreateIndex
CREATE UNIQUE INDEX "Postulacion_ofertaId_postulanteId_key" ON "Postulacion"("ofertaId", "postulanteId");
