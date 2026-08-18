# MoliTrabaja

Plataforma de bolsa de trabajo (Next.js + API Nest + PostgreSQL).

El **frontend** (puerto 3002) consume el **backend Nest** (puerto 3001), que es quien habla con PostgreSQL (`bd_btrabaja`).

## Arranque

**1. Backend** (en `moli_trabaja_backend`):

```bash
npm install
npm run start:dev
```

Debe quedar en http://localhost:3001/api

**2. Frontend** (en `Moli_Trabaja_Frontend`):

```bash
cp .env.example .env
npm install
npm run dev
```

Portal: http://localhost:3002

## Login

Las cuentas están en la tabla `usuarios` de PostgreSQL. El login va a `POST /api/auth/login` del backend Nest.
No hay registro público; un administrador crea usuarios.

## Scripts front

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo (3002) |
| `npm run dev:clean` | Borra `.next` y arranca de nuevo |
| `npm run build` | Build producción |
