-- =====================================================================
-- Tizón OS v2.0 — Esquema de Base de Datos
-- Restaurante: Tizón Meats
-- Motor: Supabase (PostgreSQL)
-- Descripción: Sistema de gestión de sala y huéspedes.
--   Módulos: App Staff, Motor de Pacing, SMS Bidireccional, CRM.
-- Todos los textos y comentarios están en español.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensiones necesarias
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- para gen_random_uuid()

-- ---------------------------------------------------------------------
-- Tipos ENUM del dominio
-- ---------------------------------------------------------------------
DO $$
BEGIN
    -- Roles del personal
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_staff') THEN
        CREATE TYPE rol_staff AS ENUM ('hostess', 'mesero', 'gerencia');
    END IF;

    -- Zonas del restaurante
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'zona_mesa') THEN
        CREATE TYPE zona_mesa AS ENUM ('salon_principal', 'terraza', 'privado');
    END IF;

    -- Estados de una mesa
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_mesa') THEN
        CREATE TYPE estado_mesa AS ENUM ('libre', 'ocupada', 'reservada', 'por_salir');
    END IF;

    -- Término de la carne preferido por el cliente
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'termino_carne') THEN
        CREATE TYPE termino_carne AS ENUM ('medio', 'tres_cuartos', 'bien_cocido', 'vuelta_y_vuelta');
    END IF;

    -- Estados de una reserva
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_reserva') THEN
        CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'sentada', 'completada', 'cancelada', 'no_show');
    END IF;

    -- Estados de la lista de espera
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_lista_espera') THEN
        CREATE TYPE estado_lista_espera AS ENUM ('esperando', 'avisado', 'sentado', 'se_fue');
    END IF;

    -- Tipos de mensaje SMS
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_sms') THEN
        CREATE TYPE tipo_sms AS ENUM ('confirmacion', 'recordatorio', 'lista_espera', 'agradecimiento');
    END IF;

    -- Estados de un SMS
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_sms') THEN
        CREATE TYPE estado_sms AS ENUM ('enviado', 'fallido', 'respondido');
    END IF;
END$$;

-- =====================================================================
-- TABLA: staff — Personal del restaurante
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.staff (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre       TEXT        NOT NULL,
    email        TEXT        NOT NULL UNIQUE,
    rol          rol_staff   NOT NULL,
    pin_acceso   TEXT        NOT NULL,             -- PIN de acceso rápido a la app
    activo       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.staff IS 'Personal de Tizón Meats: hostess, meseros y gerencia.';

-- =====================================================================
-- TABLA: mesas — Mesas físicas del restaurante
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.mesas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero      INTEGER     NOT NULL UNIQUE,       -- Número visible de la mesa
    capacidad   INTEGER     NOT NULL CHECK (capacidad > 0),
    zona        zona_mesa   NOT NULL,
    estado      estado_mesa NOT NULL DEFAULT 'libre',
    activa      BOOLEAN     NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE public.mesas IS 'Mesas de Tizón Meats con su capacidad, zona y estado actual.';

-- =====================================================================
-- TABLA: clientes — CRM de huéspedes (estilo SevenRooms)
-- =====================================================================
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
    etiquetas                 TEXT[]        NOT NULL DEFAULT '{}',  -- p.ej. VIP, cumpleanos, corporativo
    notas                     TEXT,
    created_at                TIMESTAMPTZ   NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.clientes IS 'Ficha de huéspedes: preferencias, alergias, historial y etiquetas.';

-- =====================================================================
-- TABLA: reservas — Reservaciones
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.reservas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id      UUID           REFERENCES public.clientes(id) ON DELETE SET NULL,
    mesa_id         UUID           REFERENCES public.mesas(id) ON DELETE SET NULL,
    fecha           DATE           NOT NULL,
    hora_inicio     TIME           NOT NULL,
    hora_fin        TIME,
    num_comensales  INTEGER        NOT NULL CHECK (num_comensales > 0),
    estado          estado_reserva NOT NULL DEFAULT 'pendiente',
    codigo_unico    TEXT           NOT NULL UNIQUE,     -- Código para el comensal (SMS)
    notas_servicio  TEXT,
    creado_por      UUID           REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.reservas IS 'Reservaciones de Tizón Meats con código único para el comensal.';
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON public.reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON public.reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON public.reservas(cliente_id);

-- =====================================================================
-- TABLA: lista_espera — Walk-ins y lista de espera
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.lista_espera (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id                UUID                REFERENCES public.clientes(id) ON DELETE SET NULL, -- nullable (walk-in sin ficha)
    nombre_grupo              TEXT                NOT NULL,
    num_personas              INTEGER             NOT NULL CHECK (num_personas > 0),
    telefono                  TEXT,
    hora_llegada              TIMESTAMPTZ         NOT NULL DEFAULT now(),
    estado                    estado_lista_espera NOT NULL DEFAULT 'esperando',
    tiempo_espera_estimado    INTEGER,            -- minutos estimados de espera
    mesa_asignada_id          UUID                REFERENCES public.mesas(id) ON DELETE SET NULL,
    created_at                TIMESTAMPTZ         NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.lista_espera IS 'Lista de espera / walk-ins con tiempo estimado y mesa asignada.';
CREATE INDEX IF NOT EXISTS idx_lista_espera_estado ON public.lista_espera(estado);

-- =====================================================================
-- TABLA: ocupacion_mesas — Motor de Pacing (control de ocupación)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.ocupacion_mesas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_id         UUID        NOT NULL REFERENCES public.mesas(id) ON DELETE CASCADE,
    reserva_id      UUID        REFERENCES public.reservas(id) ON DELETE SET NULL, -- nullable (walk-in)
    hora_inicio     TIMESTAMPTZ NOT NULL,
    hora_fin        TIMESTAMPTZ,
    num_comensales  INTEGER     NOT NULL CHECK (num_comensales > 0)
);
COMMENT ON TABLE public.ocupacion_mesas IS 'Registro de ocupación de mesas usado por el motor de pacing anti-colisión de cocina.';
CREATE INDEX IF NOT EXISTS idx_ocupacion_mesa ON public.ocupacion_mesas(mesa_id);
CREATE INDEX IF NOT EXISTS idx_ocupacion_hora_inicio ON public.ocupacion_mesas(hora_inicio);

-- =====================================================================
-- TABLA: sms_log — Registro de mensajería SMS bidireccional (Twilio)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.sms_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id          UUID        REFERENCES public.clientes(id) ON DELETE SET NULL,
    telefono            TEXT        NOT NULL,
    tipo                tipo_sms    NOT NULL,
    mensaje             TEXT        NOT NULL,
    estado              estado_sms  NOT NULL DEFAULT 'enviado',
    respuesta_cliente   TEXT,       -- respuesta entrante del comensal (bidireccional)
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.sms_log IS 'Historial de SMS enviados/recibidos vía Twilio (confirmaciones, recordatorios, etc.).';
CREATE INDEX IF NOT EXISTS idx_sms_log_cliente ON public.sms_log(cliente_id);

-- =====================================================================
-- TABLA: configuracion — Parámetros del sistema (clave/valor)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.configuracion (
    clave        TEXT PRIMARY KEY,
    valor        TEXT NOT NULL,
    descripcion  TEXT
);
COMMENT ON TABLE public.configuracion IS 'Parámetros configurables del sistema (pacing, duración de turnos, etc.).';

-- =====================================================================
-- FUNCIÓN AUXILIAR: rol del usuario autenticado
-- Lee el rol desde la tabla staff usando el email del JWT de Supabase.
-- SECURITY DEFINER para evitar recursión en las políticas RLS.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.rol_actual()
RETURNS rol_staff
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT rol
    FROM public.staff
    WHERE email = (auth.jwt() ->> 'email')
      AND activo = TRUE
    LIMIT 1;
$$;
COMMENT ON FUNCTION public.rol_actual() IS 'Devuelve el rol (hostess/mesero/gerencia) del staff autenticado según su email en el JWT.';

CREATE OR REPLACE FUNCTION public.es_gerencia()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(public.rol_actual() = 'gerencia', FALSE);
$$;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- Reglas por rol:
--   * gerencia: acceso total a todas las tablas.
--   * hostess : ver/editar mesas, reservas, lista_espera (+ clientes/ocupación de apoyo).
--   * mesero  : ver mesas (asignadas / lectura de sala).
-- Nota: el service_role (backend NestJS) omite RLS automáticamente.
-- =====================================================================

ALTER TABLE public.staff           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_espera    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocupacion_mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion   ENABLE ROW LEVEL SECURITY;

-- ---------- staff ----------
-- Solo gerencia administra al personal; cada quien puede verse a sí mismo.
DROP POLICY IF EXISTS staff_gerencia_total ON public.staff;
CREATE POLICY staff_gerencia_total ON public.staff
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS staff_ver_propio ON public.staff;
CREATE POLICY staff_ver_propio ON public.staff
    FOR SELECT USING (email = (auth.jwt() ->> 'email'));

-- ---------- mesas ----------
-- gerencia: total. hostess: ver + editar. mesero: solo ver.
DROP POLICY IF EXISTS mesas_gerencia_total ON public.mesas;
CREATE POLICY mesas_gerencia_total ON public.mesas
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS mesas_hostess_editar ON public.mesas;
CREATE POLICY mesas_hostess_editar ON public.mesas
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS mesas_ver_todos ON public.mesas;
CREATE POLICY mesas_ver_todos ON public.mesas
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- ---------- clientes ----------
-- gerencia: total. hostess: ver + editar (apoyo a reservas y CRM). mesero: solo ver.
DROP POLICY IF EXISTS clientes_gerencia_total ON public.clientes;
CREATE POLICY clientes_gerencia_total ON public.clientes
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS clientes_hostess_editar ON public.clientes;
CREATE POLICY clientes_hostess_editar ON public.clientes
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS clientes_ver_todos ON public.clientes;
CREATE POLICY clientes_ver_todos ON public.clientes
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- ---------- reservas ----------
-- gerencia: total. hostess: ver + editar. mesero: solo ver.
DROP POLICY IF EXISTS reservas_gerencia_total ON public.reservas;
CREATE POLICY reservas_gerencia_total ON public.reservas
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS reservas_hostess_editar ON public.reservas;
CREATE POLICY reservas_hostess_editar ON public.reservas
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS reservas_ver_todos ON public.reservas;
CREATE POLICY reservas_ver_todos ON public.reservas
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- ---------- lista_espera ----------
-- gerencia: total. hostess: ver + editar. mesero: solo ver.
DROP POLICY IF EXISTS lista_espera_gerencia_total ON public.lista_espera;
CREATE POLICY lista_espera_gerencia_total ON public.lista_espera
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS lista_espera_hostess_editar ON public.lista_espera;
CREATE POLICY lista_espera_hostess_editar ON public.lista_espera
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS lista_espera_ver_todos ON public.lista_espera;
CREATE POLICY lista_espera_ver_todos ON public.lista_espera
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- ---------- ocupacion_mesas ----------
-- gerencia: total. hostess: ver + editar (gestiona el pacing). mesero: solo ver.
DROP POLICY IF EXISTS ocupacion_gerencia_total ON public.ocupacion_mesas;
CREATE POLICY ocupacion_gerencia_total ON public.ocupacion_mesas
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS ocupacion_hostess_editar ON public.ocupacion_mesas;
CREATE POLICY ocupacion_hostess_editar ON public.ocupacion_mesas
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS ocupacion_ver_todos ON public.ocupacion_mesas;
CREATE POLICY ocupacion_ver_todos ON public.ocupacion_mesas
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- ---------- sms_log ----------
-- gerencia: total. hostess: ver + registrar. mesero: sin acceso.
DROP POLICY IF EXISTS sms_gerencia_total ON public.sms_log;
CREATE POLICY sms_gerencia_total ON public.sms_log
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS sms_hostess ON public.sms_log;
CREATE POLICY sms_hostess ON public.sms_log
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

-- ---------- configuracion ----------
-- gerencia: total. hostess/mesero: solo lectura.
DROP POLICY IF EXISTS config_gerencia_total ON public.configuracion;
CREATE POLICY config_gerencia_total ON public.configuracion
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS config_ver_todos ON public.configuracion;
CREATE POLICY config_ver_todos ON public.configuracion
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- =====================================================================
-- FIN DEL ESQUEMA
-- =====================================================================
