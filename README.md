# MoliTrabaja

Plataforma de bolsa de trabajo con portal público para postulantes y panel para empresas (Next.js, Prisma, SQLite, Zustand).

## Inicio rápido

```bash
npm install
npm run db:seed
npm run dev
```

- Portal: [http://localhost:3000](http://localhost:3000)
- Panel empresa: [http://localhost:3000/empresa](http://localhost:3000/empresa)
- Seguimiento postulante: [http://localhost:3000/personal](http://localhost:3000/personal)

## API de postulaciones (JSON dual)

| Método | Ruta | Contexto |
|--------|------|----------|
| `POST` | `/api/postulaciones` | Registro + CV → `job_metadata`, `pestaña_empresa_view`, `pestaña_personal_view` |
| `GET` | `/api/postulaciones/seguimiento?dni=&job_id=` | Solo pestaña Personal (sin PII de otros) |
| `GET` | `/api/ofertas/[id]/postulaciones` | Pestaña Empresa (embudo + match %) |
| `PATCH` | `/api/postulaciones/accion` | `{ dni, job_id, action: Aceptar \| Rechazar \| Mover a Entrevista }` |
| `PATCH` | `/api/postulaciones/[id]` | Cambio por código de postulación |

Estados del postulante: `En Revisión`, `Aceptado / Seleccionado`, `No Seleccionado (Fuera del Proceso)`.
Embudo empresa: en_revision, entrevistas, aceptados, no_seleccionados.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:seed` | Datos demo en SQLite |
| `npm run db:studio` | Prisma Studio |
