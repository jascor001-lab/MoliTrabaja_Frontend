-- Catálogos base
CREATE TABLE "TipoDoc" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreCompleto" TEXT NOT NULL,
    "abrev" TEXT NOT NULL
);
CREATE UNIQUE INDEX "TipoDoc_abrev_key" ON "TipoDoc"("abrev");

CREATE TABLE "Pais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "prefijoCelular" TEXT NOT NULL
);

CREATE TABLE "CatalogoCarrera" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);
CREATE UNIQUE INDEX "CatalogoCarrera_nombre_key" ON "CatalogoCarrera"("nombre");

CREATE TABLE "CatalogoConocimiento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "grupo" TEXT NOT NULL
);
CREATE UNIQUE INDEX "CatalogoConocimiento_nombre_grupo_key" ON "CatalogoConocimiento"("nombre", "grupo");

CREATE TABLE "CatalogoInstitucion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "razonSocial" TEXT NOT NULL,
    "nombre" TEXT NOT NULL
);

INSERT INTO "TipoDoc" ("nombreCompleto", "abrev") VALUES ('Documento Nacional de Identidad', 'DNI');
INSERT INTO "TipoDoc" ("nombreCompleto", "abrev") VALUES ('Carné de Extranjería', 'CE');
INSERT INTO "Pais" ("nombre", "prefijoCelular") VALUES ('Perú', '+51');

-- Dirección
CREATE TABLE "Direccion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "direccionLiteral" TEXT NOT NULL,
    "latitud" TEXT,
    "longitud" TEXT
);

-- Empresa: nuevos campos 
ALTER TABLE "Empresa" ADD COLUMN "razonSocial" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Empresa" ADD COLUMN "telefono" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Empresa" ADD COLUMN "paginaWeb" TEXT NOT NULL DEFAULT '';
UPDATE "Empresa" SET "razonSocial" = "nombre" WHERE "razonSocial" = '';

-- ContactoEmpresa
CREATE TABLE "ContactoEmpresa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresaId" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "esGerente" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ContactoEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ContactoEmpresa_empresaId_idx" ON "ContactoEmpresa"("empresaId");

-- Migrar contactos desde OfertaLaboral (primera oferta por empresa)
INSERT INTO "ContactoEmpresa" ("empresaId", "nombres", "apellidoPaterno", "correo", "celular", "esPrincipal", "esGerente")
SELECT DISTINCT
  o."empresaId",
  COALESCE(NULLIF(trim(o."contactoNombre"), ''), 'Contacto'),
  '',
  COALESCE(o."contactoCorreo", ''),
  COALESCE(o."contactoTelefono", ''),
  1,
  0
FROM "OfertaLaboral" o
WHERE o."contactoNombre" IS NOT NULL AND o."contactoNombre" != ''
GROUP BY o."empresaId";

INSERT INTO "ContactoEmpresa" ("empresaId", "nombres", "apellidoPaterno", "correo", "celular", "esPrincipal", "esGerente")
SELECT DISTINCT
  o."empresaId",
  COALESCE(NULLIF(trim(o."gerenteSupervisor"), ''), 'Gerente'),
  '',
  COALESCE(o."gerenteCorreo", ''),
  COALESCE(o."gerenteCelular", ''),
  0,
  1
FROM "OfertaLaboral" o
WHERE o."gerenteSupervisor" IS NOT NULL AND o."gerenteSupervisor" != ''
GROUP BY o."empresaId";

UPDATE "Empresa" SET "paginaWeb" = COALESCE((
  SELECT o."paginaWeb" FROM "OfertaLaboral" o WHERE o."empresaId" = "Empresa"."id" AND o."paginaWeb" IS NOT NULL AND trim(o."paginaWeb") != '' LIMIT 1
), '') WHERE "paginaWeb" = '';

-- OfertaLaboral: nuevos campos
ALTER TABLE "OfertaLaboral" ADD COLUMN "perfil" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OfertaLaboral" ADD COLUMN "tipoContrato" TEXT NOT NULL DEFAULT 'Indefinido';
ALTER TABLE "OfertaLaboral" ADD COLUMN "direccionTrabajoId" TEXT;

-- Cronograma (migrar fechas convocatoria)
CREATE TABLE "Cronograma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ofertaId" TEXT NOT NULL,
    "etapa" TEXT NOT NULL,
    "urlConsulta" TEXT NOT NULL DEFAULT '',
    "inicio" DATETIME NOT NULL,
    "fin" DATETIME,
    "responsable" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Cronograma_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "OfertaLaboral" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Cronograma_ofertaId_idx" ON "Cronograma"("ofertaId");

INSERT INTO "Cronograma" ("id", "ofertaId", "etapa", "inicio", "fin", "responsable")
SELECT
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))),
  o."id",
  'Convocatoria',
  o."inicioConvocatoria",
  o."finConvocatoria",
  COALESCE(o."gerenteSupervisor", '')
FROM "OfertaLaboral" o
WHERE o."inicioConvocatoria" IS NOT NULL;

-- Tablas puente oferta
CREATE TABLE "OfertaCarrera" (
    "ofertaId" TEXT NOT NULL,
    "carreraId" INTEGER NOT NULL,
    PRIMARY KEY ("ofertaId", "carreraId"),
    CONSTRAINT "OfertaCarrera_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "OfertaLaboral" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OfertaCarrera_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "CatalogoCarrera" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "OfertaConocimiento" (
    "ofertaId" TEXT NOT NULL,
    "conocimientoId" INTEGER NOT NULL,
    PRIMARY KEY ("ofertaId", "conocimientoId"),
    CONSTRAINT "OfertaConocimiento_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "OfertaLaboral" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OfertaConocimiento_conocimientoId_fkey" FOREIGN KEY ("conocimientoId") REFERENCES "CatalogoConocimiento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Postulante: migrar a modelo UML
ALTER TABLE "Postulante" ADD COLUMN "tipoDocId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Postulante" ADD COLUMN "numeroDocumento" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Postulante" ADD COLUMN "paisId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Postulante" ADD COLUMN "estadoCivil" TEXT NOT NULL DEFAULT 'Soltero';
ALTER TABLE "Postulante" ADD COLUMN "direccionId" TEXT;

UPDATE "Postulante" SET "numeroDocumento" = "dni" WHERE "numeroDocumento" = '';

-- Direcciones postulantes
INSERT INTO "Direccion" ("id", "direccionLiteral")
SELECT
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))),
  p."direccion"
FROM "Postulante" p
WHERE p."direccion" IS NOT NULL AND trim(p."direccion") != '';

UPDATE "Postulante" SET "direccionId" = (
  SELECT d."id" FROM "Direccion" d WHERE d."direccionLiteral" = "Postulante"."direccion" LIMIT 1
) WHERE "direccion" IS NOT NULL AND trim("direccion") != '';

-- Tablas CV postulante
CREATE TABLE "ExpLaboral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postulanteId" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "tiempoMeses" INTEGER NOT NULL DEFAULT 0,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME,
    CONSTRAINT "ExpLaboral_postulanteId_fkey" FOREIGN KEY ("postulanteId") REFERENCES "Postulante" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ExpLaboral_postulanteId_idx" ON "ExpLaboral"("postulanteId");

CREATE TABLE "Educacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postulanteId" TEXT NOT NULL,
    "carreraId" INTEGER NOT NULL,
    "tipoEstudio" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "ordenMerito" TEXT NOT NULL DEFAULT 'No aplica',
    "fechaIngreso" DATETIME NOT NULL,
    "fechaEgreso" DATETIME,
    CONSTRAINT "Educacion_postulanteId_fkey" FOREIGN KEY ("postulanteId") REFERENCES "Postulante" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Educacion_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "CatalogoCarrera" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Educacion_postulanteId_idx" ON "Educacion"("postulanteId");

CREATE TABLE "ConocimientoPostulante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postulanteId" TEXT NOT NULL,
    "conocimientoId" INTEGER NOT NULL,
    "institucion" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "ConocimientoPostulante_postulanteId_fkey" FOREIGN KEY ("postulanteId") REFERENCES "Postulante" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConocimientoPostulante_conocimientoId_fkey" FOREIGN KEY ("conocimientoId") REFERENCES "CatalogoConocimiento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "ConocimientoPostulante_postulanteId_idx" ON "ConocimientoPostulante"("postulanteId");

-- FK Postulante
CREATE UNIQUE INDEX "Postulante_tipoDocId_numeroDocumento_key" ON "Postulante"("tipoDocId", "numeroDocumento");

-- Eliminar columnas legacy OfertaLaboral
CREATE TABLE "new_OfertaLaboral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "direccionTrabajoId" TEXT,
    "titulo" TEXT NOT NULL,
    "perfil" TEXT NOT NULL DEFAULT '',
    "descripcion" TEXT NOT NULL,
    "tipoContrato" TEXT NOT NULL DEFAULT 'Indefinido',
    "modalidad" TEXT NOT NULL,
    "salario" TEXT NOT NULL DEFAULT 'A convenir',
    "estado" TEXT NOT NULL DEFAULT 'Activa',
    "fechaPublicacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoArchivos" TEXT NOT NULL DEFAULT '[]',
    "basesArchivo" TEXT NOT NULL DEFAULT '',
    "tipoPuesto" TEXT NOT NULL DEFAULT '[]',
    "cantidadVacantes" INTEGER NOT NULL DEFAULT 1,
    "funciones" TEXT NOT NULL,
    "beneficios" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OfertaLaboral_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OfertaLaboral_direccionTrabajoId_fkey" FOREIGN KEY ("direccionTrabajoId") REFERENCES "Direccion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_OfertaLaboral" SELECT
  "id", "empresaId", "direccionTrabajoId", "titulo", "perfil", "descripcion", "tipoContrato",
  "modalidad", "salario", "estado", "fechaPublicacion", "logoArchivos", "basesArchivo",
  "tipoPuesto", "cantidadVacantes", "funciones", "beneficios", "createdAt", "updatedAt"
FROM "OfertaLaboral";

DROP TABLE "OfertaLaboral";
ALTER TABLE "new_OfertaLaboral" RENAME TO "OfertaLaboral";
CREATE INDEX "OfertaLaboral_empresaId_idx" ON "OfertaLaboral"("empresaId");
CREATE INDEX "OfertaLaboral_estado_idx" ON "OfertaLaboral"("estado");

-- Eliminar columnas legacy Postulante
CREATE TABLE "new_Postulante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoDocId" INTEGER NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "paisId" INTEGER NOT NULL,
    "genero" TEXT NOT NULL,
    "estadoCivil" TEXT NOT NULL DEFAULT 'Soltero',
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccionId" TEXT,
    "cvPath" TEXT,
    "cvParsed" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Postulante_tipoDocId_fkey" FOREIGN KEY ("tipoDocId") REFERENCES "TipoDoc" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Postulante_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "Pais" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Postulante_direccionId_fkey" FOREIGN KEY ("direccionId") REFERENCES "Direccion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Postulante" SELECT
  "id", "tipoDocId", "numeroDocumento", "nombres", "apellidoPaterno", "apellidoMaterno",
  "fechaNacimiento", "paisId", "genero", "estadoCivil", "correo", "passwordHash", "telefono",
  "direccionId", "cvPath", "cvParsed", "createdAt", "updatedAt"
FROM "Postulante";

DROP TABLE "Postulante";
ALTER TABLE "new_Postulante" RENAME TO "Postulante";
CREATE UNIQUE INDEX "Postulante_correo_key" ON "Postulante"("correo");
CREATE UNIQUE INDEX "Postulante_tipoDocId_numeroDocumento_key" ON "Postulante"("tipoDocId", "numeroDocumento");

-- Re-attach FKs for Postulacion and Sesion (SQLite preserves them if table names match)
