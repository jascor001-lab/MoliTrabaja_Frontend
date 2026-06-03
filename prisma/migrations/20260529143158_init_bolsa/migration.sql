-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "rubro" TEXT NOT NULL,
    "logo" TEXT,
    "descripcion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OfertaLaboral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "salario" TEXT NOT NULL,
    "requisitos" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Activa',
    "fechaPublicacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OfertaLaboral_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_ruc_key" ON "Empresa"("ruc");

-- CreateIndex
CREATE INDEX "OfertaLaboral_empresaId_idx" ON "OfertaLaboral"("empresaId");

-- CreateIndex
CREATE INDEX "OfertaLaboral_estado_idx" ON "OfertaLaboral"("estado");
