-- AlterTable Empresa: credenciales
ALTER TABLE "Empresa" ADD COLUMN "email" TEXT;
ALTER TABLE "Empresa" ADD COLUMN "passwordHash" TEXT;
UPDATE "Empresa" SET "email" = 'legacy-' || "ruc" || '@molitrabaja.local' WHERE "email" IS NULL;
UPDATE "Empresa" SET "passwordHash" = 'pending' WHERE "passwordHash" IS NULL;

-- AlterTable Postulante: contraseña
ALTER TABLE "Postulante" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT 'pending';

-- CreateTable Sesion
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "tipoUsuario" TEXT NOT NULL,
    "empresaId" TEXT,
    "postulanteId" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sesion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sesion_postulanteId_fkey" FOREIGN KEY ("postulanteId") REFERENCES "Postulante" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Empresa_email_key" ON "Empresa"("email");
CREATE UNIQUE INDEX "Postulante_correo_key" ON "Postulante"("correo");
CREATE UNIQUE INDEX "Sesion_token_key" ON "Sesion"("token");
CREATE INDEX "Sesion_token_idx" ON "Sesion"("token");
CREATE INDEX "Sesion_expiresAt_idx" ON "Sesion"("expiresAt");
