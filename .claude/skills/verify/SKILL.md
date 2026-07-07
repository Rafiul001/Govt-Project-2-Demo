---
name: verify
description: Build, launch, and drive this project's API + landing page to verify changes at the real HTTP surface.
---

# Verifying Govt-Project-2-Demo

Two processes: the Hono API (Postgres via `.env` `DATABASE_URL`) and the
Next.js landing page. The dashboard (Vite, `src/client`) is a third, only
needed for admin-UI changes.

## Launch

```bash
# API on :3000 (background)
bun --env-file=.env src/index.ts

# Landing page on :3001 (background)
cd src/landing-page && bun run dev --port 3001
```

Ready check: `curl -s http://localhost:3000/api/v1/branch?pageSize=100`
returns the branch list (also tells you which branch names exist in the
local DB).

## Drive the landing page

The branch is resolved from the request subdomain, so spoof the Host
header — no DNS needed:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Host: barishal.localhost:3001" http://localhost:3001/
```

- Known branch subdomain → 200; unknown subdomain → 404.
- Bare `localhost` / `www` / raw IP → 404 (no branch).
- Routes: `/`, `/notices`, `/board`, `/:menuSlug`, `/:menuSlug/:submenuSlug`.

## Gotchas

- Next dev's `.next` cache can corrupt (RSC-manifest 500s, stale module
  paths, runaway memory). Symptom: 500s with `application-code: <200ms`
  in the request log. Fix: kill every `next-server` process (plain
  `kill` of the port holder is not enough — check `ps aux | grep next`),
  then `rm -rf src/landing-page/.next` and relaunch.
- First request per route in dev compiles on demand — expect multi-second
  responses; don't mistake slowness for a hang.
