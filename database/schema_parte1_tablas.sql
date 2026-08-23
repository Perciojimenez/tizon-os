-- =====================================================================
-- Tizón OS — PARTE 1: Extensiones, ENUMs y Tablas
-- Ejecuta esto primero en el SQL Editor de Supabase
-- =====================================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMs
DO $do$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_staff') THEN
        CREATE TYPE rol_staff AS ENUM ('hostess', 'mesero', 'gerencia');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'zona_mesa') THEN
        CREATE TYPE zona_mesa AS ENUM ('salon_principal', 'terraza', 'privado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_mesa') THEN
        CREATE TYPE estado_mesa AS ENUM ('libre', 'ocupada', 'reservada', 'por_salir');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'termino_carne') THEN
        CREATE TYPE termino_carne AS ENUM ('medio', 'tres_cuartos', 'bien_cocido', 'vuelta_y_vuelta');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_reserva') THEN
        CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'sentada', 'completada', 'cancelada', 'no_show');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_lista_espera') THEN
        CREATE TYPE estado_lista_espera AS ENUM ('esperando', 'avisado', 'sentado', 'se_fue');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_sms') THEN
        CREATE TYPE tipo_sms AS ENUM ('confirmacion', 'recordatorio', 'lista_espera', 'agradecimiento');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_sms') THEN
        CREATE TYPE estado_sms AS ENUM ('enviado', 'fallido', 'respondido');
    END IF;
END$do$;

-- Tabla: staff
CREATE TABLE IF NOT EXISTS public.staff (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre       TEXT        NOT NULL,
    email        TEXT        NOT NULL UNIQUE,
    rol          rol_staff   NOT NULL,
    pin_acceso   TEXT        NOT NULL,
    activo       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: mesas
CREATE TABLE IF NOT EXISTS public.mesas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero      INTEGER     NOT NULL UNIQUE,
    capacidad   INTEGER     NOT NULL CHECK (capacidad > 0),
    zona        zona_mesa   NOT NULL,
    estado      estado_mesa NOT NULL DEFAULT 'libre',
    activa      BOOLEAN     NOT NULL DEFAULT TRUE
);

-- Tabla: clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                    TEXT          NOT NULL,
    telefono                  TEXT,
    email                     TEXT,
    termino_carne_preferido   termino_carne,
    alergias                  TEXT[]        NOT NULL DEFAULT '{}',
    mesa_favorita_id          UUID          REFERENCES public.mesas(id) ON DELETE SET NULL,
    total_visitas             INTEGER       NOT NULL DEFAULT 0,
    total_gastado             NUMERIC(12,2) NOT NULL DEFAULT 0,
    etiquetas                 TEXT[]        NOT NULL DEFAULT '{}',
    notas                     TEXT,
    created_at                TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Tabla: reservas
CREATE TABLE IF NOT EXISTS public.reservas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id      UUID           REFERENCES public.clientes(id) ON DELETE SET NULL,
    mesa_id         UUID           REFERENCES public.mesas(id) ON DELETE SET NULL,
    fecha           DATE           NOT NULL,
    hora_inicio     TIME           NOT NULL,
    hora_fin        TIME,
    num_comensales  INTEGER        NOT NULL CHECK (num_comensales > 0),
    estado          estado_reserva NOT NULL DEFAULT 'pendiente',
    codigo_unico    TEXT           NOT NULL UNIQUE,
    notas_servicio  TEXT,
    creado_por      UUID           REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservas_fecha    ON public.reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_estado   ON public.reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_cliente  ON public.reservas(cliente_id);

-- Tabla: lista_espera
CREATE TABLE IF NOT EXISTS public.lista_espera (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id             UUID                REFERENCES public.clientes(id) ON DELETE SET NULL,
    nombre_grupo           TEXT                NOT NULL,
    num_personas           INTEGER             NOT NULL CHECK (num_personas > 0),
    telefono               TEXT,
    hora_llegada           TIMESTAMPTZ         NOT NULL DEFAULT now(),
    estado                 estado_lista_espera NOT NULL DEFAULT 'esperando',
    tiempo_espera_estimado INTEGER,
    mesa_asignada_id       UUID                REFERENCES public.mesas(id) ON DELETE SET NULL,
    created_at             TIMESTAMPTZ         NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lista_espera_estado ON public.lista_espera(estado);

-- Tabla: ocupacion_mesas
CREATE TABLE IF NOT EXISTS public.ocupacion_mesas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_id         UUID        NOT NULL REFERENCES public.mesas(id) ON DELETE CASCADE,
    reserva_id      UUID        REFERENCES public.reservas(id) ON DELETE SET NULL,
    hora_inicio     TIMESTAMPTZ NOT NULL,
    hora_fin        TIMESTAMPTZ,
    num_comensales  INTEGER     NOT NULL CHECK (num_comensales > 0)
);

CREATE INDEX IF NOT EXISTS idx_ocupacion_mesa        ON public.ocupacion_mesas(mesa_id);
CREATE INDEX IF NOT EXISTS idx_ocupacion_hora_inicio ON public.ocupacion_mesas(hora_inicio);

-- Tabla: sms_log
CREATE TABLE IF NOT EXISTS public.sms_log (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id        UUID        REFERENCES public.clientes(id) ON DELETE SET NULL,
    telefono          TEXT        NOT NULL,
    tipo              tipo_sms    NOT NULL,
    mensaje           TEXT        NOT NULL,
    estado            estado_sms  NOT NULL DEFAULT 'enviado',
    respuesta_cliente TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_log_cliente ON public.sms_log(cliente_id);

-- Tabla: configuracion
CREATE TABLE IF NOT EXISTS public.configuracion (
    clave        TEXT PRIMARY KEY,
    valor        TEXT NOT NULL,
    descripcion  TEXT
);
