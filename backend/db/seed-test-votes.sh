#!/usr/bin/env bash
# Inserts ~100 random test votes into the local database.
# Run manually: bash backend/scripts/seed-test-votes.sh [stage_id] [count]
# Defaults: stage 1, 100 votes.

set -e

STAGE=${1:-1}
COUNT=${2:-100}

# Load .env from backend dir
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

DB_CONTAINER=${DB_CONTAINER:-tour-db}
DB_USER=${DB_USER:-tour}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-tour}

echo "Inserting $COUNT random votes for stage $STAGE..."

python3 - <<PYEOF | docker exec -i "$DB_CONTAINER" mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" 2>/dev/null
import uuid, random, sys
count = $COUNT
stage = $STAGE
rider_ids = list(range(1, 50))  # adjust if rider count changes
for _ in range(count):
    rid = random.choice(rider_ids)
    uid = str(uuid.uuid4())
    print(f"INSERT IGNORE INTO votes (stage_id, rider_id, user_id) VALUES ({stage}, {rid}, '{uid}');")
PYEOF

docker exec "$DB_CONTAINER" mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  -e "SELECT COUNT(*) AS total_votes FROM votes WHERE stage_id = $STAGE;" 2>/dev/null

echo "Done."
