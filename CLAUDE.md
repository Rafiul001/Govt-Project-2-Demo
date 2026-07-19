# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A multi-branch government/organization portal made of **three apps** in one repo:

- **API** ([src/server/](src/server/)) — Hono JSON API on Bun, Drizzle ORM (v1) over PostgreSQL, JWT auth, Pino logging. Entry: [src/index.ts](src/index.ts).
- **Admin panel** ([src/client/](src/client/)) — Vite + React 19 SPA (TanStack Router/Query/Form, HeroUI, Zustand). Manages branches and their content.
- **Public landing sites** ([src/landing-page/](src/landing-page/)) — Next.js app that serves one bilingual (Bengali/English) public site **per branch**, resolved from the request **subdomain**.

`src/client/` and `src/landing-page/` are **standalone sub-projects** with their own `package.json`, `node_modules`, and `tsconfig`. The root `tsconfig.json` excludes `src/landing-page/`. Shared code between the API and the client lives in [src/shared/](src/shared/) (types + Zod validators), imported via the `@/*` alias (→ `./src/*`).

The README is unusually detailed — consult it for screenshots, the full API route table, and deployment specifics.

## Commands

Dev uses **Bun**; production uses **npm + Node**. Run all root commands from the repo root.

```bash
bun run install:all          # install deps for all three apps
bun run dev                  # run all three (server :3000, client :5173, landing :3001)
bun run dev:server           # API only (bun --watch)
bun run dev:client           # admin panel only
bun run dev:landing          # landing only (:3001)

bun run db:generate          # generate a migration from schema changes
bun run db:migrate           # apply migrations
bun run db:push              # push schema directly (dev)
bun run db:studio            # Drizzle Studio
bun run create-super-admin   # seed a super admin (the only way to create one)
```

Per-app lint (no root lint task): `cd src/client && bun run lint`, `cd src/landing-page && bun run lint`.

Production build/run: `npm run build:all` then `npm run start:prod` (see [deploy/](deploy/) for nginx + systemd units). There is **no test suite**.

## Auth & branch scoping (the core domain rule)

Two admin types: `SUPER_ADMIN` (unscoped) and `BRANCH_ADMIN` (pinned to one `branchId`). This distinction drives almost every route handler.

- Middleware in [src/server/middleware/authMiddleware.ts](src/server/middleware/authMiddleware.ts): `authMiddleware([types])` requires a valid access token (and optionally restricts by admin type); `optionalAuthMiddleware()` attaches the admin **if present but never rejects** — used on public GET routes so the same handler serves anonymous landing-site visitors, branch admins, and super admins from one query.
- The scoping helpers in [src/server/utils/scope.ts](src/server/utils/scope.ts) are the canonical way to enforce this — **use them rather than re-deriving branch logic**: `resolveBranchId` (which branch a create targets), `resolveBranchUpdate` (only super admins may move a row across branches), `canAccessBranch` (guard reads/writes on an existing row), `branchIdByName` (public `?branchName=` scoping).
- Branch **mutations** are super-admin only. A super admin **cannot** create another super admin — those exist only via `create-super-admin`.
- Convention in every list handler: branch admin → forced to their own `branchId` (drafts visible); super admin → all branches, optional `?branchName=` filter; anonymous → published only, optional `?branchName=`. See [noticeRouter.ts](src/server/routes/v1Router/noticeRouter.ts) as the reference pattern.

## API conventions

- Routers are one file per resource under [src/server/routes/v1Router/](src/server/routes/v1Router/), mounted in [index.ts](src/server/routes/v1Router/index.ts) under `/api/v1`.
- **Always** return via the response helpers in [src/server/responses/](src/server/responses/) (`ok`, `created`, `badRequest`, `notFound`, `forbidden`, `unAuthorized`) — they enforce the `{ success, message, data }` / `{ success, message, errors }` envelope.
- Validate every input with `zValidator` against a shared schema in [src/shared/validators/](src/shared/validators/) (`"form"` for multipart, `"query"`, `"param"`). Reuse these schemas on the client too.
- Image/PDF uploads go through the Cloudinary helpers in [src/server/service/cloudinary/](src/server/service/cloudinary/) (`uploadImage`/`replaceImage`/`deleteImage`, and the PDF equivalents). On update, a `remove*` flag only applies when no replacement file was sent; deleting a row also deletes its Cloudinary assets.
- Config is read once through [src/server/config/index.ts](src/server/config/index.ts), which fails fast on missing/invalid env vars — add new env access there, not via `process.env` inline.

## Data model: the menu → submenu → page tree

A **branch** is the parent of everything (board of directors, notices, banners, menus — all `ON DELETE CASCADE`, `branchId` denormalized onto children for single-column scoping). Schemas live in [src/server/db/schemas/](src/server/db/schemas/); relations for `db.query` are in [relations.ts](src/server/db/relations.ts).

The public site navigation is the subtle part:

- A **menu** is only a dropdown label with a per-branch-unique `slug`; it never links to a page itself.
- A **page** (banner + bilingual Markdown) attaches to **exactly one** of a submenu (`/:menuSlug/:submenuSlug`) or a menu directly (`/:menuSlug`) — enforced by a CHECK constraint in [pageSchema.ts](src/server/db/schemas/pageSchema.ts).
- Adding the first submenu to a menu that had a direct page **moves that page** under an auto-created submenu (see the submenu router) — a menu never mixes a direct page with submenus.
- Pages start `isPublished = false`; only published pages appear on the public site (drafts stay visible in preview).
- Titles/content are bilingual: `*Bn`/`*En` columns, each optional but at least one required (validator-enforced); the public site renders the active language and falls back to the other.

## Landing page (Next.js) specifics

- **One deployment serves every branch.** Each request's branch is derived from its **host subdomain** in [src/landing-page/lib/api.ts](src/landing-page/lib/api.ts) (`getBranchName`: `dhaka.example.com` → `Dhaka`). A bare host (apex, `www`, raw IP, `localhost`) → `null` → 404; branch sites exist **only** on branch subdomains. To test locally, map subdomains in `/etc/hosts` and visit `barishal.localhost:3001` (allow-listed in `next.config.ts`).
- Server Components fetch the API's **public** GET routes server-to-server (no auth, no CORS), scoped by `?branchName=`, with `cache: "no-store"` so dashboard edits show immediately. Every fetch is wrapped so a transient API/DB outage degrades to empty sections instead of crashing.
- Org identity and national e-gov links are static config ([lib/data.ts](src/landing-page/lib/data.ts), [lib/i18n.ts](src/landing-page/lib/i18n.ts)); all branch content is live from the API.
