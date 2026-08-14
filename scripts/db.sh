#!/usr/bin/env bash
# Helper de banco. Usa o psql nativo quando existe e cai para o psql em Docker
# quando não — o Docker Desktop já derrubou o fluxo duas vezes por estar parado.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

[ -f .env ] || { echo "❌ .env não encontrado"; exit 1; }
DB_URL="$(grep -E '^SUPABASE_DB_URL=' .env | cut -d= -f2- )"
[ -n "$DB_URL" ] || { echo "❌ SUPABASE_DB_URL ausente no .env"; exit 1; }

# brew install libpq — o psql não entra no PATH sozinho
PSQL=""
for candidate in psql /opt/homebrew/opt/libpq/bin/psql /usr/local/opt/libpq/bin/psql; do
  if command -v "$candidate" >/dev/null 2>&1; then PSQL="$candidate"; break; fi
done

psql_run() {
  if [ -n "$PSQL" ]; then
    "$PSQL" "$DB_URL" -v ON_ERROR_STOP=1 "$@"
  elif docker info >/dev/null 2>&1; then
    # Caminhos passam a ser /work/... dentro do container
    docker run --rm -i -v "$ROOT:/work" -w /work postgres:16-alpine \
      psql "$DB_URL" -v ON_ERROR_STOP=1 "$@"
  else
    echo "❌ Sem psql e sem Docker. Instale com: brew install libpq" >&2
    exit 1
  fi
}

# Com psql nativo os arquivos são lidos do disco local; com Docker, de /work.
file_arg() {
  if [ -n "$PSQL" ]; then echo "$1"; else echo "/work/$1"; fi
}

case "${1:-}" in
  migrate)
    for f in supabase/migrations/*.sql; do
      printf '%-45s ' "$(basename "$f")"
      psql_run -q -1 -f "$(file_arg "$f")" >/dev/null && echo '✅' || { echo '❌'; exit 1; }
    done
    echo '── migrations aplicadas ──'
    ;;
  seed)
    psql_run -q -f "$(file_arg supabase/seed.sql)"
    ;;
  psql)
    shift; psql_run "$@"
    ;;
  types)
    # Escreve num temporário: redirecionar direto já destruiu o arquivo uma vez,
    # quando o gerador falhou e cuspiu JSON de erro no lugar dos tipos.
    TMP="$(mktemp)"
    if npx supabase gen types typescript --db-url "$DB_URL" --schema public > "$TMP" 2>/dev/null \
       && grep -q "export type Database" "$TMP"; then
      mv "$TMP" src/lib/supabase/database.types.ts
      echo '✅ src/lib/supabase/database.types.ts gerado'
    else
      rm -f "$TMP"
      echo '❌ Geração falhou (o supabase CLI precisa do Docker). Arquivo atual preservado.' >&2
      exit 1
    fi
    ;;
  *)
    echo "uso: ./scripts/db.sh {migrate|seed|psql|types}"; exit 1
    ;;
esac
