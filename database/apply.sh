#!/usr/bin/env bash
# =====================================================================
# Tizón OS — Aplicar esquema + seed a Supabase (PostgreSQL)
# Uso:
#   DATABASE_URL="postgresql://usuario:password@host:puerto/postgres" ./apply.sh
# o exportando las variables PG* / usando el pooler de Supabase.
# =====================================================================
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

: "${DATABASE_URL:?Define DATABASE_URL con la cadena de conexión de Supabase}"

echo ">> Aplicando schema.sql ..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$DIR/schema.sql"

echo ">> Aplicando seed.sql ..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$DIR/seed.sql"

echo ">> Verificando tablas creadas ..."
psql "$DATABASE_URL" -c "\dt public.*"

echo ">> Listo. Tizón Meats — base de datos aplicada correctamente."
