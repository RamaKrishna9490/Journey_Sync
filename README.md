# ✈️ Traveloop

> **Plan smarter. Travel better.**
> A full-stack travel planning app for building multi-city itineraries, tracking budgets, managing packing lists, journaling trips, and sharing adventures — all in one place.

---

## 🌍 Overview

Traveloop is a personalized travel planning platform that takes the chaos out of trip organization. Whether you're planning a solo weekend escape or a month-long multi-city adventure, Traveloop gives you everything you need in a single, beautiful interface.

---

## ✨ Features

### 🗺️ Multi-City Itineraries
Build detailed day-by-day routes across multiple city stops with drag-and-drop ordering. Visualize your journey from start to finish.

### 📅 Activity Scheduling
Add pre-seeded activities to each stop, assign them scheduled times, and track their individual costs as you plan.

### 💰 Budget Breakdown
Stay on top of your spending with interactive **pie and bar charts** that break down estimated costs across:
- Activities
- Accommodation
- Transport
- Meals

Budgets are computed server-side using trip duration, stop count, and actual activity costs.

### 🎒 Packing Checklists
Never forget the essentials. Manage categorized packing lists — Documents, Clothing, Electronics, Toiletries, and more — with a simple toggle-to-pack interface.

### 📓 Trip Journal
Capture memories and notes on the go. Write free-text journal entries with inline editing and automatic timestamps.

### 🌐 Explore Destinations
Browse a searchable grid of global destinations with cost index ratings and popularity scores to inspire your next trip.

### 🔗 Public Trip Sharing
Share any trip publicly via a shareable link — no account required to view. Great for coordinating with travel companions or inspiring friends.

### 🔐 Authentication
Secure, seamless sign-up and sign-in via **Clerk**, supporting email and social providers.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Routing** | wouter |
| **Animations** | framer-motion |
| **Charts** | recharts |
| **Auth** | Clerk (Replit-managed) |
| **API Client** | Auto-generated React Query hooks (Orval) |
| **Backend** | Express 5, Node.js 24 |
| **Database** | PostgreSQL + Drizzle ORM |
| **Validation** | Zod v4, drizzle-zod |
| **Monorepo** | pnpm workspaces |

---

## 📁 Project Structure

```
traveloop/
├── artifacts/
│   ├── traveloop/              # React + Vite frontend (preview: /)
│   │   └── src/
│   │       ├── pages/          # All page components
│   │       ├── components/     # Layout + shadcn/ui components
│   │       └── index.css       # Amber/indigo theme variables
│   └── api-server/             # Express 5 API (preview: /api)
│       └── src/
│           ├── routes/         # All route handlers
│           └── middlewares/    # requireAuth, clerkProxy
├── lib/
│   ├── db/                     # Drizzle ORM schema + client
│   │   └── src/schema/         # Table definitions (source of truth)
│   ├── api-spec/               # OpenAPI spec (source of truth for API)
│   └── api-client-react/       # Auto-generated React Query hooks
└── scripts/                    # Shared utility scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL database

### Environment Variables

Create a `.env` file at the root with the following variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for session signing |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (server) |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (frontend) |
| `VITE_CLERK_PROXY_URL` | Clerk proxy URL for custom domains |

### Install & Run

```bash
# 1. Install dependencies
pnpm install

# 2. Push database schema
pnpm --filter @workspace/db run push

# 3. Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# 4. Start the frontend (port 22872)
pnpm --filter @workspace/traveloop run dev
```

---

## 🧑‍💻 Development Commands

```bash
# Full typecheck across all packages
pnpm run typecheck

# Rebuild composite libs (run after changing DB schema)
pnpm run typecheck:libs

# Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push
```

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `users` | Clerk-linked user profiles |
| `cities` | Seeded destination data (12 cities) |
| `activities` | City activities (48 total, 4 per city) |
| `trips` | User trips with dates, budget, and public flag |
| `trip_stops` | Ordered city stops within a trip |
| `stop_activities` | Scheduled activities within a stop |
| `packing_items` | Categorized packing checklist items |
| `trip_notes` | Free-text trip journal entries |

---

## 📡 API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/users/me` | Get current user profile |
| `PATCH` | `/api/users/me` | Update profile |
| `GET` | `/api/dashboard/summary` | Dashboard stats |
| `GET / POST` | `/api/trips` | List / create trips |
| `GET / PATCH / DELETE` | `/api/trips/:id` | Get / update / delete trip |
| `GET` | `/api/trips/:id/budget` | Budget breakdown |
| `GET / POST` | `/api/trips/:id/stops` | List / add stops |
| `PATCH / DELETE` | `/api/trips/:id/stops/:sid` | Update / remove stop |
| `GET / POST` | `/api/trips/:id/stops/:sid/activities` | List / add activities to stop |
| `DELETE` | `/api/trips/:id/stops/:sid/activities/:aid` | Remove activity |
| `GET / POST` | `/api/trips/:id/packing` | Packing list |
| `PATCH / DELETE` | `/api/trips/:id/packing/:iid` | Update / delete packing item |
| `GET / POST` | `/api/trips/:id/notes` | Trip journal |
| `PATCH / DELETE` | `/api/trips/:id/notes/:nid` | Update / delete note |
| `GET` | `/api/cities` | All cities |
| `GET` | `/api/cities/:id` | City detail |
| `GET` | `/api/cities/:id/activities` | City activities |
| `GET` | `/api/public/trips/:id` | Public trip view (no auth required) |

---

## 🏗️ Architecture Notes

**Contract-first API** — The OpenAPI spec (`lib/api-spec/openapi.yaml`) is the single source of truth. Orval automatically generates typed React Query hooks and Zod schemas from it.

**Clerk auth proxy** — Auth requests are proxied through the Express server, allowing Clerk to work seamlessly on `.replit.app` domains and custom domains without CORS issues.

**Auto user provisioning** — User records are created automatically on the first API call using `ON CONFLICT DO NOTHING`, safely handling concurrent requests.

**Server-enforced ownership** — All routes for trips, stops, activities, packing items, and notes verify that the authenticated user owns the resource before performing any read or write.

**Budget computed server-side** — Budget breakdowns estimate accommodation, transport, and meal costs based on trip duration and stop count, combined with actual activity costs pulled from the database.

---

## 📄 License

This project is private. All rights reserved.
