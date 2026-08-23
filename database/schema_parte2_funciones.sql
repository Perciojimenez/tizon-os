-- =====================================================================
-- Tizón OS — PARTE 2: Funciones auxiliares para RLS
-- Ejecuta esto DESPUÉS de la Parte 1
-- =====================================================================

CREATE OR REPLACE FUNCTION public.rol_actual()
RETURNS rol_staff
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $func$
    SELECT rol
    FROM public.staff
    WHERE email = (auth.jwt() ->> 'email')
      AND activo = TRUE
    LIMIT 1;
$func$;

CREATE OR REPLACE FUNCTION public.es_gerencia()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $func$
    SELECT COALESCE(public.rol_actual() = 'gerencia', FALSE);
$func$;
