# MoliTrabaja

Plataforma de bolsa de trabajo con portal público para postulantes y panel para empresas (Next.js, Prisma, SQLite, Zustand).

## Inicio rápido

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

La base de datos SQLite (`prisma/dev.db`) es **local** y no se sube a GitHub. Si ves *"table does not exist"*, ejecuta `npm run db:setup` y reinicia `npm run dev`.

- Portal: [http://localhost:3002](http://localhost:3002)
- Panel empresa: [http://localhost:3002/empresa](http://localhost:3002/empresa)
- Seguimiento postulante: [http://localhost:3002/personal](http://localhost:3002/personal)

Usuarios demo:

- Empresa: `demo@techmolina.pe` / `Demo1234`
- Postulante extra: `ana.torres@demo.pe` / `Demo1234` (DNI 87654321)

## API de postulaciones (JSON dual)

| Método | Ruta | Contexto |
|--------|------|----------|
| `POST` | `/api/postulaciones` | Envía el CV del perfil (una sola vez por vacante) → dual view |
| `GET` | `/api/postulaciones/seguimiento?dni=&job_id=` | Solo pestaña Personal (sin PII de otros) |
| `GET` | `/api/ofertas/[id]/postulaciones` | Pestaña Empresa (carpetas + match % + CV enviado) |
| `PATCH` | `/api/postulaciones/accion` | `{ dni, job_id, action: Mover a Inscritos \| Mover a En proceso \| Mover a Finalistas \| Descartar }` |
| `PATCH` | `/api/postulaciones/[id]` | Cambio por código de postulación |

Estados del postulante: `En Revisión`, `Aceptado / Seleccionado`, `No Seleccionado (Fuera del Proceso)`.
Carpetas empresa (estilo Computrabajo): Inscritos, En proceso, Finalistas, Descartados.
El CV se edita en el perfil del postulante; al postular se congela una copia por vacante para la empresa.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:seed` | Datos demo en SQLite |
| `npm run db:studio` | Prisma Studio |
