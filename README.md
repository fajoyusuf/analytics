
# analytics
Creative dashboard
=======
# Creative Analytics Dashboard (Meta Ads)

Full-stack Next.js dashboard for creative-level analytics across Meta ads with deterministic ad-name parsing, robust mapping, and unmapped controls.

## Stack
- Next.js App Router + TypeScript
- Tailwind + shadcn-style UI components
- Recharts
- Prisma ORM schema (Postgres-compatible shape) with SQLite dev DB
- Local sync adapters for Excel + CSV seed data
- Stub adapters for Meta + WeTracked APIs

## Implemented Pages
- `/overview`
  - KPI cards: Spend, Revenue, Profit, ROAS, CPA, CPM
  - Date range presets: 4/7/14/30/90 + custom start/end
  - Creatives tested daily chart (from `Creative.dateLaunched` only)
  - Top 10 creatives table with Revenue/ROAS/Spend toggle
- `/creatives`
  - Per-creative table with required metadata + metrics
  - Filters: Status, Winner, Angle, Format, Style, Type, Target Traffic, Created By
  - Search by creative ID
  - Pagination
- `/creatives/[id]`
  - Metadata + asset link
  - Spend and Revenue timelines (separate line charts)
  - Breakdown by ad/adset/campaign
  - Linked copy/lander via mapping
- `/analysis`
  - Tabs: Angle / Format / Style / Type / Target Traffic / Awareness / Created By / Winner / Status
  - Aggregate KPIs + grouped ranking table + spend bar chart
- `/unmapped-ads`
  - Parse/mapping failures table
  - Suggested partial parse
  - Manual overrides (ad_id or ad_name)
- `/settings`
  - Connection badges for Meta / WeTracked
  - Source file paths
  - Last sync status and counts

## Required Ad Name Parsing
Implemented in `/Users/Apple/Documents/New project/src/lib/parser.ts`.

Pattern: `A### | V### or IMG#.### | C### | P:AP`

Rules:
- Split by `|` and trim tokens
- Extract:
  - `funnel_identifier` via `A\d+`
  - `creative_id` via `(IMG\d+\.\d+|V\d+)`
  - `copy_id` via `C\d+`
  - `product_code` via `P:[A-Za-z0-9_\-]+`
- Parse failures are persisted to `UnmappedAd` with reason and suggestion
- No silent drops

## Data Model
Prisma schema: `/Users/Apple/Documents/New project/prisma/schema.prisma`

Tables included:
- `Creative`, `Copy`, `Lander`
- `MetaAd`, `DailyMetaInsights`, `DailyWeTracked`
- `AdCreativeMap`, `UnmappedAd`, `ManualOverride`, `SyncRun`

## Local Sync Commands
- `npm run db:migrate`
  - Applies SQL migration file to SQLite at `/tmp/creative_analytics.db`
- `npm run sync:local`
  - Loads Excel + seed CSVs
  - Builds parser-based mappings
  - Tracks unmapped rows
- `npm run sync:meta`
  - Stub (TODO adapter)
- `npm run sync:wetracked`
  - Stub (TODO adapter)
- `npm run sync:cron`
  - Optional cron runner using `node-cron`

## Environment
Copy `.env.example` to `.env` and adjust as needed.

Default values are preconfigured for local files:
- `CREATIVE_SHEET_PATH="/Users/Apple/Downloads/AP _ Creative Sheet.xlsx"`
- `META_SEED_CSV_PATH="/Users/Apple/Downloads/Data 2.16.15 PM.csv"`
- `CREATIVE_SEED_CSV_PATH="/Users/Apple/Downloads/Creatives 3.58.44 PM.csv"`

If your files are at `/mnt/data/...`, set those paths in `.env`.

## Run Locally
1. Install deps
   - `npm install`
2. Apply DB schema
   - `npm run db:migrate`
3. Load seed data
   - `npm run sync:local`
4. Start app
   - `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Tests
- Parsing tests: `/Users/Apple/Documents/New project/tests/parser.test.ts`
- Run: `npm run test`

## Build/Lint
- `npm run lint`
- `npm run build`

## Notes on Postgres
The schema fields and relations are Postgres-compatible. Dev uses SQLite for quick local setup.
To switch to Postgres, update Prisma datasource provider + URL and apply equivalent migration in your target environment.

## What Was Verified in This Environment
- `npm run test` passed (4 parser tests)
- `npm run lint` passed
- `npm run build` passed
- `npm run sync:local` succeeded with counts:
  - mapped: 158
  - unmapped: 28
>>>>>>> c64929a (Initial commit)
