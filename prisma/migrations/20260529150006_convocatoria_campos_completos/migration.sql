/*
  Warnings:

  - Added the required column `beneficios` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactoCorreo` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactoNombre` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactoTelefono` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `funciones` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gerenteCelular` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gerenteCorreo` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gerenteSupervisor` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inicioConvocatoria` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `razonSocial` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ruc` to the `OfertaLaboral` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OfertaLaboral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "salario" TEXT NOT NULL DEFAULT 'A convenir',
    "requisitos" TEXT NOT NULL DEFAULT '[]',
    "estado" TEXT NOT NULL DEFAULT 'Activa',
    "fechaPublicacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "inicioConvocatoria" DATETIME NOT NULL,
    "finConvocatoria" DATETIME,
    "logoArchivos" TEXT NOT NULL DEFAULT '[]',
    "tipoPuesto" TEXT NOT NULL DEFAULT '[]',
    "cantidadVacantes" INTEGER NOT NULL DEFAULT 1,
    "funciones" TEXT NOT NULL,
    "beneficios" TEXT NOT NULL,
    "contactoNombre" TEXT NOT NULL,
    "contactoCorreo" TEXT NOT NULL,
    "contactoTelefono" TEXT NOT NULL,
    "paginaWeb" TEXT NOT NULL DEFAULT '',
    "gerenteSupervisor" TEXT NOT NULL,
    "gerenteCelular" TEXT NOT NULL,
    "gerenteCorreo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OfertaLaboral_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OfertaLaboral" ("createdAt", "descripcion", "empresaId", "estado", "fechaPublicacion", "id", "modalidad", "requisitos", "salario", "titulo", "updatedAt") SELECT "createdAt", "descripcion", "empresaId", "estado", "fechaPublicacion", "id", "modalidad", "requisitos", "salario", "titulo", "updatedAt" FROM "OfertaLaboral";
DROP TABLE "OfertaLaboral";
ALTER TABLE "new_OfertaLaboral" RENAME TO "OfertaLaboral";
CREATE INDEX "OfertaLaboral_empresaId_idx" ON "OfertaLaboral"("empresaId");
CREATE INDEX "OfertaLaboral_estado_idx" ON "OfertaLaboral"("estado");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
