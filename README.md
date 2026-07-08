# RPM — Recover, Program, Monitor

Zero-effort energy management app based on heart rate and activity data.

## Structure

```
apps/mobile/           Expo React Native app
packages/ep-engine/    Pure EP calculation logic (unit tested)
packages/shared-types/ Domain types and config defaults
packages/wearable-adapter/ Wearable provider interface
supabase/migrations/   Postgres schema + RLS
docs/RPM-app-plan.md   Product plan reference
docs/phase2-companion-architecture.md  Phase 2 companion design (pre-implementation)
```

## Prerequisites

- Node.js 20+
- pnpm (`npx pnpm`)
- Expo dev client (HealthKit / Health Connect require native builds — not Expo Go)
- Supabase project with migrations applied

## Supabase MCP (Cursor)

Zie [`docs/supabase-mcp.md`](docs/supabase-mcp.md) voor MCP-installatie en authenticatie in Cursor.

## EAS Dev Build

Zie [`docs/eas-dev-build.md`](docs/eas-dev-build.md) voor dev client builds (HealthKit / Health Connect).

## Setup

```bash
cp .env.example apps/mobile/.env
# Fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

npx pnpm install
cd supabase && supabase db push   # or apply migrations manually

npx pnpm --filter @rpm/mobile start
```

## Tests

```bash
npx pnpm --filter @rpm/ep-engine test
```

## Phase 1 scope

- Cross-platform wearable ingest (HealthKit + Health Connect)
- Morning baseline → daily EP budget
- Live RPM gauge with hyperfocus detection + push
- Evening on-device TTS report
- Supabase sync (offline-first)
- 3-step onboarding, disclaimer, fail-safes, emergency button

## Not in Phase 1

Companion laptop lock (see [`docs/phase2-companion-architecture.md`](docs/phase2-companion-architecture.md)), forest mode, history dashboard.
