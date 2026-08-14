#!/usr/bin/env bash
# Helper de banco — usa psql via Docker (não exige psql instalado).
# Lê SUPABASE_DB_URL do .env.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

[ -f .env ] || { echo "❌ .env não encontrado"; exit 1; }
DB_URL="$(grep -E '^SUPABASE_DB_URL=' .env | cut -d= -f2- )"
[ -n "$DB_URL" ] || { echo "❌ SUPABASE_DB_URL ausente no .env"; exit 1; }

psql_run() {
  docker run --rm -i -v "$ROOT:/work" -w /work postgres:16-alpine \
    psql "$DB_URL" -v ON_ERROR_STOP=1 "$@"
}

case "${1:-}" in
  migrate)
    for f in supabase/migrations/*.sql; do
      printf '%-45s ' "$(basename "$f")"
      psql_run -q -1 -f "/work/$f" >/dev/null && echo '✅' || { echo '❌'; exit 1; }
    done
    echo '── migrations aplicadas ──'
    ;;
  seed)
    psql_run -q -f /work/supabase/seed.sql
    ;;
  psql)
    shift; psql_run "$@"
    ;;
  types)
    npx supabase gen types typescript --db-url "$DB_URL" --schema public \
      > src/lib/supabase/database.types.ts
    echo '✅ src/lib/supabase/database.types.ts gerado'
    ;;
  *)
    echo "uso: ./scripts/db.sh {migrate|seed|psql|types}"; exit 1
    ;;
esac
