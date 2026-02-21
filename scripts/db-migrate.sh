#!/usr/bin/env bash
set -euo pipefail
DB_PATH="/tmp/creative_analytics.db"
sqlite3 "$DB_PATH" < prisma/migrations/20260221214000_init/migration.sql
echo "Applied SQL migration to $DB_PATH"
