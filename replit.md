# AgriMind AI

AgriMind AI helps farmers and agronomists monitor fields, generate crop advisories, and keep a practical record of farm decisions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/agrimind-ai/src/App.tsx` — current web app shell, routes, dashboard, farm, advisory, analytics, assistant, and settings screens
- `artifacts/agrimind-ai/src/index.css` — Field Ledger visual system and responsive styles
- `artifacts/api-server/src/routes/agrimind.ts` — typed API routes and seeded agronomic data for the first working release
- `lib/api-spec/openapi.yaml` — source of truth for the generated API hooks and Zod schemas
- `lib/api-client-react/src/generated/` — generated React Query client

## Architecture decisions

- The web app consumes the generated API client from `@workspace/api-client-react` rather than hand-written fetch calls.
- The first release uses a deterministic in-memory API store so the product can be previewed and iterated without requiring AI credentials or database setup.
- The UI uses a field-notebook visual language: cedar navigation, parchment surfaces, amber live-signal accents, Newsreader display type, and Manrope interface type.
- The API contract is OpenAPI-first; regenerate client and validation code after changing `lib/api-spec/openapi.yaml`.

## Product

- Dashboard overview with active farms, open alerts, weather, soil readiness, crop outlook, and recent activity.
- Farm inventory with create/delete flows, farm detail, zone creation, crop-stage tracking, and health readout.
- Three-step advisory intake for field context, symptoms, and soil metrics, returning structured diagnostic/action/forecast data.
- Searchable advisory history and detailed reports with print/export affordance.
- Agronomist assistant with persistent sessions and message history in the API layer.
- Analytics and settings views for field trends, preferences, and service status.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The frontend is served at the root preview path and the API is routed under `/api`.
- The shared generated client requires `dom.iterable` in its TypeScript `lib` settings because its response error handling reads `Headers.entries()`.
- Restart the managed `artifacts/api-server: API Server` and `artifacts/agrimind-ai: web` workflows after API or app code changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
