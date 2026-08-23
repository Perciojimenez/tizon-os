-- =====================================================================
-- Tizón OS — PARTE 3: Row Level Security (RLS)
-- Ejecuta esto DESPUÉS de las Partes 1 y 2
-- =====================================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.staff           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_espera    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocupacion_mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion   ENABLE ROW LEVEL SECURITY;

-- STAFF
DROP POLICY IF EXISTS staff_gerencia_total ON public.staff;
CREATE POLICY staff_gerencia_total ON public.staff
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS staff_ver_propio ON public.staff;
CREATE POLICY staff_ver_propio ON public.staff
    FOR SELECT USING (email = (auth.jwt() ->> 'email'));

-- MESAS
DROP POLICY IF EXISTS mesas_gerencia_total ON public.mesas;
CREATE POLICY mesas_gerencia_total ON public.mesas
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS mesas_hostess_editar ON public.mesas;
CREATE POLICY mesas_hostess_editar ON public.mesas
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS mesas_ver_todos ON public.mesas;
CREATE POLICY mesas_ver_todos ON public.mesas
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- CLIENTES
DROP POLICY IF EXISTS clientes_gerencia_total ON public.clientes;
CREATE POLICY clientes_gerencia_total ON public.clientes
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS clientes_hostess_editar ON public.clientes;
CREATE POLICY clientes_hostess_editar ON public.clientes
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS clientes_ver_todos ON public.clientes;
CREATE POLICY clientes_ver_todos ON public.clientes
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- RESERVAS
DROP POLICY IF EXISTS reservas_gerencia_total ON public.reservas;
CREATE POLICY reservas_gerencia_total ON public.reservas
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS reservas_hostess_editar ON public.reservas;
CREATE POLICY reservas_hostess_editar ON public.reservas
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS reservas_ver_todos ON public.reservas;
CREATE POLICY reservas_ver_todos ON public.reservas
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- LISTA DE ESPERA
DROP POLICY IF EXISTS lista_espera_gerencia_total ON public.lista_espera;
CREATE POLICY lista_espera_gerencia_total ON public.lista_espera
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS lista_espera_hostess_editar ON public.lista_espera;
CREATE POLICY lista_espera_hostess_editar ON public.lista_espera
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS lista_espera_ver_todos ON public.lista_espera;
CREATE POLICY lista_espera_ver_todos ON public.lista_espera
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- OCUPACION_MESAS
DROP POLICY IF EXISTS ocupacion_gerencia_total ON public.ocupacion_mesas;
CREATE POLICY ocupacion_gerencia_total ON public.ocupacion_mesas
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS ocupacion_hostess_editar ON public.ocupacion_mesas;
CREATE POLICY ocupacion_hostess_editar ON public.ocupacion_mesas
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

DROP POLICY IF EXISTS ocupacion_ver_todos ON public.ocupacion_mesas;
CREATE POLICY ocupacion_ver_todos ON public.ocupacion_mesas
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));

-- SMS_LOG
DROP POLICY IF EXISTS sms_gerencia_total ON public.sms_log;
CREATE POLICY sms_gerencia_total ON public.sms_log
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS sms_hostess ON public.sms_log;
CREATE POLICY sms_hostess ON public.sms_log
    FOR ALL USING (public.rol_actual() = 'hostess') WITH CHECK (public.rol_actual() = 'hostess');

-- CONFIGURACION
DROP POLICY IF EXISTS config_gerencia_total ON public.configuracion;
CREATE POLICY config_gerencia_total ON public.configuracion
    FOR ALL USING (public.es_gerencia()) WITH CHECK (public.es_gerencia());

DROP POLICY IF EXISTS config_ver_todos ON public.configuracion;
CREATE POLICY config_ver_todos ON public.configuracion
    FOR SELECT USING (public.rol_actual() IN ('hostess', 'mesero', 'gerencia'));
