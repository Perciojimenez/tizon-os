# Tizón OS — Base de Datos (Supabase / PostgreSQL)

Esquema de base de datos para **Tizón Meats** (Tizón OS v2.0).

## Archivos

| Archivo | Descripción |
|---|---|
| `schema.sql` | Tipos ENUM, 8 tablas, índices, funciones de rol y políticas RLS. |
| `seed.sql` | Datos semilla realistas en español (idempotente). |
| `apply.sh` | Script para aplicar `schema.sql` + `seed.sql` y verificar. |

## Tablas

`staff`, `mesas`, `clientes`, `reservas`, `lista_espera`, `ocupacion_mesas`, `sms_log`, `configuracion`.

## Cómo aplicar

```bash
export DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
cd database
./apply.sh
```

> El proyecto está en la región **us-east-1** (host directo `db.gfrfnnlasgepepocjddu.supabase.co` es solo IPv6; usar el **pooler** para IPv4).

## Estado de la aplicación en Supabase

⚠️ **Pendiente de ejecutar contra Supabase.** El proyecto Supabase responde correctamente
(REST API 200 con la service key) y la conexión de base de datos se resuelve al pooler de
**us-east-1**, pero la contraseña provista (`Sb@2346952026`) es **rechazada** por el servidor
(`FATAL: password authentication failed`). En cuanto se corrija/actualice la contraseña de la
base de datos, basta con ejecutar `./apply.sh` para crear todo.

Los scripts fueron **validados con éxito contra un PostgreSQL 17 local**: las 8 tablas se crean,
RLS queda habilitado en las 8, se generan 21 políticas y los conteos de seed coinciden
(staff 5, mesas 20, clientes 10, reservas 3, configuración 6).

## RLS (resumen por rol)

- **gerencia**: acceso total a todas las tablas.
- **hostess**: ver/editar `mesas`, `reservas`, `lista_espera` (y `clientes`, `ocupacion_mesas`, `sms_log`).
- **mesero**: solo lectura de la sala (`mesas`, `reservas`, `clientes`, etc.).

El rol se determina con `public.rol_actual()` a partir del email del JWT de Supabase en la tabla `staff`.
El `service_role` (backend NestJS) omite RLS automáticamente.
