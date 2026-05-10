# Traveloop

A full-stack personalized travel planning web app. Users create multi-city itineraries, track budgets, manage packing lists, write trip notes, search cities/activities, and share trips publicly.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, routes at `/api`)
- `pnpm --filter @workspace/traveloop run dev` — run the React frontend (port 22872, preview at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild composite libs (run after changing DB schema)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PROXY_URL`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, wouter, framer-motion, recharts
- Auth: Clerk (Replit-managed whitelabel)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle for API)

## Where things live

- `artifacts/traveloop/` — React + Vite frontend (preview path `/`)
- `artifacts/api-server/` — Express 5 API (preview path `/api`)
- `lib/db/src/schema/` — Drizzle table definitions (source of truth)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — auto-generated React Query hooks (do not edit)
- `artifacts/traveloop/src/pages/` — all page components
- `artifacts/traveloop/src/components/layout.tsx` — sidebar nav layout
- `artifacts/traveloop/src/index.css` — theme colors (amber/indigo)

## Architecture decisions

- Contract-first API: OpenAPI spec defines all routes; Orval generates typed React Query hooks and Zod schemas
- Clerk auth is proxied through the Express API server via `clerkProxyMiddleware` so auth works on custom `.replit.app` domains
- Users are auto-created on first API call via `getOrCreateUser` with `ON CONFLICT DO NOTHING` to handle race conditions
- Packing, notes, stops, and activities are all scoped to trip ownership (server enforces access control)
- Budget breakdown is computed server-side from activities + estimated accommodation/transport/meals

## Product

- **Dashboard** — trip summary stats (total, upcoming, past), recent trips, quick create
- **My Trips** — CRUD for all trips with cover photos, dates, stop counts
- **Trip Detail** — stop timeline with city images, quick links to Itinerary/Budget/Packing/Notes
- **Itinerary Builder** — per-stop activity scheduling with times and costs
- **Budget** — visual pie + bar charts showing cost breakdown vs. budget
- **Packing List** — categorized checklist with toggle-to-pack, add/delete
- **Trip Journal (Notes)** — free-text notes with inline editing
- **Explore Cities** — searchable grid of 12 seeded cities with cost/popularity info
- **Public Trip View** — shareable page for public trips (no auth required)
- **Profile** — display name and language settings

## Seeded data

12 cities seeded (Paris, Tokyo, Bali, New York, Barcelona, Istanbul, Santorini, Kyoto, Amsterdam, Cape Town, Rome, Bangkok) each with 4 activities (48 total).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After adding new tables to `lib/db/src/schema/`, run `pnpm run typecheck:libs` before checking api-server types
- After changing OpenAPI spec, run `pnpm --filter @workspace/api-spec run codegen` before using new hooks
- Vite must use `tailwindcss({ optimize: false })` for Clerk themes compatibility
- CSS: `@layer theme, base, clerk, components, utilities;` must be first line before `@import "tailwindcss"`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
