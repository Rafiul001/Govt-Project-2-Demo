# govt-project-2-demo

Full-stack application for a multi-branch government/organization portal. It has
three parts:

- **Backend** ([`src/server/`](src/server/)) — a JSON API on the
  [Bun](https://bun.com) runtime with [Hono](https://hono.dev) for HTTP routing,
  [Drizzle ORM](https://orm.drizzle.team) (v1) over PostgreSQL, JWT
  authentication, and [Pino](https://getpino.io) for logging.
- **Admin panel** ([`src/client/`](src/client/)) — a React app built with Vite,
  TanStack Router/Query/Form, and HeroUI for managing branches and their content.
- **Public landing sites** ([`src/landing-page/`](src/landing-page/)) — a
  [Next.js](https://nextjs.org) app that serves one bilingual (Bengali/English)
  public site **per branch**, resolved from the request **subdomain**
  (`dhaka.example.com` → the Dhaka branch). See
  [Public Landing Sites](#public-landing-sites).

## Screenshots

A tour of the admin panel. Every list screen is built from reusable cards, and
the whole UI supports light/dark mode with three accent colors. List screens
(Board of Directors, Notices, Admins, Banners) share a debounced **search box**
and — for super admins — a **branch filter**, with a **clear-filters** action;
all filter state lives in the URL search params.

### Dashboard

A greeting hero, at-a-glance stat tiles (each links to its section), a recent
notices feed, and quick-action shortcuts. Clicking a recent notice deep-links
straight to its preview.

| Light                                                      | Dark                                                     |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| ![Dashboard (light)](docs/screenshots/dashboard-light.png) | ![Dashboard (dark)](docs/screenshots/dashboard-dark.png) |

### Branches

Branch records as media cards — banner image, overlapping logo, name/address,
the public **preview URL** (a globe link to the branch's landing site), and
contact details — with floating edit/delete actions. _(Super admin only.)_

| Light                                                    | Dark                                                   |
| -------------------------------------------------------- | ------------------------------------------------------ |
| ![Branches (light)](docs/screenshots/branches-light.png) | ![Branches (dark)](docs/screenshots/branches-dark.png) |

### Board of Directors

Horizontal profile cards showing each member's photo, name, designation, and
display order.

![Board of Directors](docs/screenshots/board-of-directors.png)

### Banners

Hero-slider banners for each branch — a landscape image with a title, subtitle,
and display order — shown as a responsive card grid with floating edit/delete
actions. These drive the rotating hero on the branch's public landing site.

### Notices

A master–detail layout: an inbox-style list on the left and a full preview on
the right (image, description, and an inline PDF viewer for attachments). The
panel fills the content height and scrolls on its own.

![Notices](docs/screenshots/notices.png)

### Admins

Administrator cards with avatar, username, role chip, and branch. Super admins
are read-only (seeded, not editable); branch admins expose edit/delete.
_(Super admin only.)_

![Admins](docs/screenshots/admins.png)

### Settings

Personalize the panel: theme mode and accent color, plus an account section to
update your own avatar and password.

| Light                                                    | Dark                                                   |
| -------------------------------------------------------- | ------------------------------------------------------ |
| ![Settings (light)](docs/screenshots/settings-light.png) | ![Settings (dark)](docs/screenshots/settings-dark.png) |

### Public Landing Sites

The public-facing side ([`src/landing-page/`](src/landing-page/)). One Next.js
deployment serves **every branch**: the branch is resolved from the request
subdomain, and all content (branch profile, hero banners, notices, board of
directors) is fetched live from the API and scoped to that branch. Each site is bilingual with
a Bengali/English toggle — below, **Dhaka** is shown in English and **Sylhet** in
Bengali.

| Dhaka — English (`dhaka.example.com`)                  | Sylhet — Bengali (`sylhet.example.com`)                  |
| ------------------------------------------------------ | -------------------------------------------------------- |
| ![Dhaka branch site](docs/screenshots/landing-dhaka.png) | ![Sylhet branch site](docs/screenshots/landing-sylhet.png) |

## Tech Stack

### Backend

| Concern        | Choice                                          |
| -------------- | ----------------------------------------------- |
| Runtime        | Bun (dev) / Node (production build)             |
| HTTP framework | Hono (served via `@hono/node-server`)           |
| Database       | PostgreSQL                                      |
| ORM            | Drizzle ORM `1.0.0-rc` + `pg` driver            |
| Migrations     | drizzle-kit                                     |
| Auth           | JWT access/refresh (`hono/jwt`) + argon2 hashes |
| Validation     | Zod + `@hono/zod-validator`                     |
| Media uploads  | Cloudinary (`cloudinary` SDK)                   |
| Logging        | Pino (`pino-pretty` in development)             |
| Language       | TypeScript                                      |

### Frontend (`src/client/`)

| Concern       | Choice                            |
| ------------- | --------------------------------- |
| Build tool    | Vite (React Compiler enabled)     |
| UI library    | React 19                          |
| Routing       | TanStack Router (file-based)      |
| Data fetching | TanStack Query + `ky` HTTP client |
| Forms         | TanStack Form                     |
| Styling       | Tailwind CSS v4 + HeroUI          |
| Language      | TypeScript                        |

### Public site (`src/landing-page/`)

| Concern       | Choice                                            |
| ------------- | ------------------------------------------------- |
| Framework     | Next.js 16 (App Router)                           |
| UI library    | React 19                                          |
| Data fetching | Server Components fetching the public GET routes  |
| Routing       | Subdomain → branch (resolved via request host)    |
| i18n          | Bilingual Bengali/English toggle                  |
| Styling       | Tailwind CSS v4                                    |
| Language      | TypeScript                                        |

## Prerequisites

- [Bun](https://bun.com) `>= 1.3` (development)
- [Node.js](https://nodejs.org) `>= 22` + npm (production — the server runs
  entirely on Node, no Bun needed there)
- A running PostgreSQL instance

## Getting Started

1. **Install dependencies**

   Install the backend (root), the admin panel (`src/client/`), and the public
   landing site (`src/landing-page/`) dependencies — each is its own package:

   ```bash
   bun run install:all
   # equivalent to:
   #   bun install
   #   cd src/client && bun install && cd ../..
   #   cd src/landing-page && bun install && cd ../..
   ```

2. **Configure environment**

   Copy the template and fill in values:

   ```bash
   cp .env.template .env
   ```

   | Variable                   | Required | Description                                     | Example                                                      |
   | -------------------------- | -------- | ----------------------------------------------- | ------------------------------------------------------------ |
   | `NODE_ENV`                 | yes      | `development` \| `production` \| `test`         | `development`                                                |
   | `PORT`                     | yes      | HTTP server port                                | `3000`                                                       |
   | `LOG_LEVEL`                | yes      | `fatal`…`trace`                                 | `debug`                                                      |
   | `DATABASE_URL`             | yes      | Postgres connection string                      | `postgres://postgres:postgres@localhost:5432/govt_project_2` |
   | `ACCESS_TOKEN_SECRET`      | yes      | Secret for signing access tokens                | `openssl rand -base64 48`                                    |
   | `REFRESH_TOKEN_SECRET`     | yes      | Secret for signing refresh tokens               | `openssl rand -base64 48`                                    |
   | `ACCESS_TOKEN_EXPIRES_IN`  | no       | Access token lifetime (suffix `s`/`m`/`h`/`d`)  | `15m` (default)                                              |
   | `REFRESH_TOKEN_EXPIRES_IN` | no       | Refresh token lifetime (suffix `s`/`m`/`h`/`d`) | `7d` (default)                                               |
   | `CLOUDINARY_URL`           | yes      | Cloudinary credentials URL                      | `cloudinary://<api_key>:<api_secret>@<cloud_name>`           |
   | `CLOUDINARY_IMAGE_FOLDER`  | yes      | Cloudinary folder images are stored under       | `image`                                                      |
   | `CLOUDINARY_PDF_FOLDER`    | yes      | Cloudinary folder PDFs are stored under         | `pdf`                                                        |

   All variables are validated at startup in
   [`src/server/config/index.ts`](src/server/config/index.ts); the process throws
   if a required variable is missing or invalid.

3. **Set up the database**

   ```bash
   bun run db:generate   # generate SQL migrations from the schema
   bun run db:migrate    # apply migrations
   # or, for rapid local iteration:
   bun run db:push       # push the schema directly without migration files
   bun run db:studio     # browse data in Drizzle Studio
   ```

4. **Create the first super admin**

   Admin creation requires an authenticated super admin, so bootstrap one with
   the seed script (runs on Node via `tsx`, so it works identically on the
   production server):

   ```bash
   npm run create-super-admin -- <username> <password> [name]
   ```

5. **Run the app**

   ```bash
   bun run dev                 # backend + admin panel + landing site together
   ```

   This starts all three processes concurrently: the backend (logs
   `Server running at http://localhost:<PORT>`), the Vite admin panel on its own
   dev URL, and the Next.js landing site on **`http://localhost:3001`**. To run
   just one side:

   ```bash
   bun run dev:server          # backend only
   bun run dev:client          # admin panel only
   bun run dev:landing         # public landing site only (port 3001)
   ```

   To exercise the per-branch **subdomain** routing locally, map the branch
   subdomains to localhost (e.g. in `/etc/hosts`) and visit them on port 3001:

   ```
   127.0.0.1  dhaka.example.com sylhet.example.com rajshahi.example.com
   ```

   The dev server already allows these origins via `allowedDevOrigins` in
   [`src/landing-page/next.config.ts`](src/landing-page/next.config.ts). Branch
   sites exist **only** on branch subdomains — a bare `localhost:3001` (no
   subdomain) returns a 404.

## Scripts

Root scripts:

Development runs on **Bun**; production install/build/start run on **npm +
Node** (the server bundle is built with esbuild, so Bun is not needed on the
production box).

| Script                        | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| `bun run install:all`         | Install dependencies for backend + admin panel + landing site (dev) |
| `npm run install:prod`        | Same, with npm — for the production server                         |
| `bun run dev`                 | Run backend + admin panel + landing site concurrently              |
| `bun run dev:server`          | Start only the backend in watch mode (`src/index.ts`)              |
| `bun run dev:client`          | Start only the admin panel Vite dev server                         |
| `bun run dev:landing`         | Start only the landing site (Next.js, port 3001)                   |
| `db:generate` / `db:migrate`  | Generate / apply drizzle migrations                                |
| `db:push` / `db:studio`       | Push schema directly (dev) / browse data in Drizzle Studio         |
| `create-super-admin`          | Seed the first super admin (`npm run create-super-admin -- <user> <pass> [name]`) |
| `npm run build`               | Bundle the backend to `dist/` with esbuild (Node target)           |
| `npm run build:client`        | Build the admin panel to `src/client/dist/`                        |
| `npm run build:landing`       | Build the landing site (`next build`)                              |
| `npm run build:all`           | Build all three                                                    |
| `npm run start`               | Run the built backend with Node (`dist/index.js`)                  |
| `npm run start:client`        | Serve the built admin panel locally (`vite preview`)               |
| `npm run start:landing`       | Serve the built landing site (`next start`, port 3001)             |
| `npm run start:all`           | Run all three production builds concurrently                       |
| `npm run start:prod`          | Backend + landing only (nginx serves the panel statically)         |

> On production, prefer the **systemd units** in [`deploy/`](deploy/) over
> `start:*` — see [Production Deployment](#production-deployment).

Admin panel scripts (run from `src/client/`):

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `bun run dev`     | Start the Vite dev server                  |
| `bun run build`   | Type-check and build the client to `dist/` |
| `bun run preview` | Preview the production build               |
| `bun run lint`    | Lint the client with ESLint                |

Landing site scripts (run from `src/landing-page/`):

| Script          | Description                            |
| --------------- | ------------------------------------- |
| `bun run dev`   | Start the Next.js dev server          |
| `bun run build` | Build the landing site for production |
| `bun run start` | Serve the production build            |
| `bun run lint`  | Lint the landing site with ESLint     |

## Project Structure

```
src/
├── client/                   # React admin panel (Vite app — see src/client/README.md)
│   ├── index.html            # Vite entry HTML
│   ├── vite.config.ts        # Vite config (React Compiler + TanStack Router plugin)
│   └── src/
│       ├── main.tsx          # App bootstrap (QueryClientProvider + router)
│       ├── index.css         # Tailwind + HeroUI styles & theme tokens
│       ├── routeTree.gen.ts  # Generated TanStack Router route tree
│       ├── api/              # ky client, endpoint URLs, FormData helper
│       ├── hooks/           # TanStack Query hooks (per resource) + auth/theme
│       ├── store/           # Zustand stores (auth tokens, theme prefs)
│       ├── validators/      # Client Zod schemas (forms + search params)
│       ├── lib/             # queryClient, apiError, token decode, form helpers
│       ├── types/           # Shared client types (entities, API envelope)
│       ├── routes/          # File-based routes (login, _app/* authed area)
│       └── components/
│           ├── formInputs/  # TanStack-Form-bound inputs (Text, Select, File, …)
│           ├── molecules/   # Single-element building blocks
│           ├── organisms/   # AppShell, DataTable, resource forms
│           └── pages/       # One component per screen
├── landing-page/             # Public per-branch site (Next.js — see its README)
│   ├── next.config.ts        # Next config (image hosts, allowedDevOrigins)
│   ├── app/                  # App Router pages (home, /notices, /board, /[menu], /[menu]/[submenu])
│   ├── components/           # Atoms/molecules/organisms for the public site
│   └── lib/                  # api.ts (subdomain → branch + data fetching), i18n
├── index.ts                  # Entry point: boots Hono server, graceful shutdown
├── scripts/
│   └── createSuperAdmin.ts   # Seed script to bootstrap the first super admin
├── server/
│   ├── server.ts             # Hono app & route mounting
│   ├── types.ts              # Server-wide Hono env (TAppEnv)
│   ├── config/
│   │   └── index.ts          # Env validation & typed config
│   ├── middleware/
│   │   └── authMiddleware.ts # JWT auth + role checks
│   ├── responses/
│   │   └── index.ts          # successResponse / errorResponse envelopes
│   ├── routes/
│   │   └── v1Router/
│   │       ├── index.ts                    # /api/v1 router
│   │       ├── adminRouter.ts              # /api/v1/admin routes
│   │       ├── branchRouter.ts             # /api/v1/branch routes
│   │       ├── boardOfDirectorsRouter.ts   # /api/v1/board-of-directors routes
│   │       ├── noticeRouter.ts             # /api/v1/notice routes
│   │       ├── bannerRouter.ts             # /api/v1/banner routes
│   │       ├── menuRouter.ts               # /api/v1/menu routes
│   │       ├── submenuRouter.ts            # /api/v1/submenu routes
│   │       ├── pageRouter.ts               # /api/v1/page routes
│   │       └── navRouter.ts                # /api/v1/nav (public navigation reads)
│   ├── service/
│   │   └── cloudinary/
│   │       ├── client.ts       # Configured Cloudinary client + URL helpers
│   │       ├── imageUpload.ts   # upload/replace/delete image assets
│   │       └── pdfUpload.ts     # upload/replace/delete PDF assets
│   ├── utils/
│   │   ├── jwt.ts            # Access/refresh token generate & verify
│   │   ├── password.ts      # argon2 hash & verify
│   │   ├── scope.ts         # Branch-scoping & access-control helpers
│   │   └── pagination.ts    # Offset + paginated payload helpers
│   └── db/
│       ├── client.ts         # Drizzle client (wired with relations)
│       ├── constant.ts       # Table name constants (DB.*)
│       ├── relations.ts      # Relational config (defineRelations)
│       └── schemas/
│           ├── index.ts      # Barrel re-export of all tables
│           ├── adminSchema.ts
│           ├── branchSchema.ts
│           ├── boardOfDirectorsSchema.ts
│           ├── noticeSchema.ts
│           ├── bannerSchema.ts
│           ├── menuSchema.ts
│           ├── submenuSchema.ts
│           └── pageSchema.ts
└── shared/
    ├── types/
    │   └── index.ts          # Shared enums/types (adminType, tokenType, …)
    ├── utils/
    │   └── pino-logger.ts    # Configured Pino logger
    └── validators/
        ├── admin.validator.ts            # Zod schemas for admin requests
        ├── branch.validator.ts           # Zod schemas for branch requests
        ├── boardOfDirectors.validator.ts # Zod schemas for board requests
        ├── notice.validator.ts           # Zod schemas for notice requests
        ├── banner.validator.ts           # Zod schemas for banner requests
        ├── pagination.validator.ts       # Shared pagination + `?branchName`/`?search` query schema
        ├── params.validator.ts           # Shared `:id` path-param schema
        └── file.validator.ts             # Shared upload schema (max 5 MB)
```

## Authentication

Stateless JWT, sent as a **Bearer** token — no cookies.

- On login the server returns an `accessToken` and a `refreshToken` in the
  response body. The client stores them and sends
  `Authorization: Bearer <accessToken>` on protected requests.
- Passwords are hashed with **argon2** ([`src/server/utils/password.ts`](src/server/utils/password.ts)).
- Access/refresh tokens are signed with separate secrets and lifetimes
  ([`src/server/utils/jwt.ts`](src/server/utils/jwt.ts)).
- `authMiddleware(allowedTypes?)` ([`src/server/middleware/authMiddleware.ts`](src/server/middleware/authMiddleware.ts))
  guards routes. It verifies the access token, attaches the payload to the
  context, and enforces roles: pass an array of admin types to restrict access,
  or omit it to allow **any** authenticated admin.

  ```ts
  adminRouter.post("/", authMiddleware([adminType.SUPER_ADMIN]), handler); // super admin only
  adminRouter.post("/logout", authMiddleware(), handler); // any admin
  ```

Logout is a client-side concern: since tokens are stateless, the server holds no
session to clear — the client simply discards its tokens. An access token stays
valid until it expires (`ACCESS_TOKEN_EXPIRES_IN`).

### API Endpoints

All responses use a consistent envelope:
`{ success, message, data }` or `{ success, message, errors }`. Requests are
validated with `@hono/zod-validator` — `json` for plain bodies, `param` for the
numeric `:id`, and `form` for endpoints that accept file uploads. Invalid input
returns the validator's default `400`.

Endpoints that accept files use **`multipart/form-data`** (not JSON): all fields
are sent as form fields, and each uploaded file must be at most **5 MB**. Files
are stored on Cloudinary and only the resulting delivery URL is persisted.

**Pagination, search & branch filter.** Every `GET` list endpoint is paginated
via the `?page` and `?pageSize` query params (defaults `page=1`, `pageSize=10`,
max `pageSize=100`). The board-of-directors, notice, banner, and admin lists
also accept an optional **`?branchName=`** (scope the list to one branch) and a
free-text **`?search=`** matched against that resource's key columns — validated
with [`branchListQuerySchema`](src/shared/validators/pagination.validator.ts).
Their `data` is a paginated envelope rather than a bare array:

```jsonc
{
  "success": true,
  "message": "…",
  "data": { "items": [...], "total": 42, "page": 1, "pageSize": 10, "totalPages": 5 }
}
```

| Method   | Path                             | Auth             | Body                  | Description                                    |
| -------- | -------------------------------- | ---------------- | --------------------- | ---------------------------------------------- |
| `POST`   | `/api/v1/admin/login`            | Public           | `json`                | Log in; returns `accessToken` + `refreshToken` |
| `GET`    | `/api/v1/admin`                  | Super admin only | —                     | List admins (paginated; `?search=`, `?branchName=`) |
| `POST`   | `/api/v1/admin`                  | Super admin only | `form` (avatar)       | Create a branch admin (`branchId` required)    |
| `POST`   | `/api/v1/admin/logout`           | Any admin        | —                     | Logout (stateless acknowledgement)             |
| `GET`    | `/api/v1/branch`                 | Public           | —                     | List branches (paginated)                      |
| `GET`    | `/api/v1/branch/:id`             | Public           | —                     | Get one branch                                 |
| `POST`   | `/api/v1/branch`                 | Super admin only | `form` (logo, banner) | Create a branch                                |
| `PATCH`  | `/api/v1/branch/:id`             | Super admin only | `form` (logo, banner) | Update a branch                                |
| `DELETE` | `/api/v1/branch/:id`             | Super admin only | —                     | Delete a branch (+ media, cascades children)   |
| `GET`    | `/api/v1/board-of-directors`     | Public           | —                     | List board members (branch-scoped, paginated)  |
| `GET`    | `/api/v1/board-of-directors/:id` | Public           | —                     | Get one board member                           |
| `POST`   | `/api/v1/board-of-directors`     | Any admin        | `form` (avatar)       | Create a board member                          |
| `PATCH`  | `/api/v1/board-of-directors/:id` | Any admin        | `form` (avatar)       | Update a board member                          |
| `DELETE` | `/api/v1/board-of-directors/:id` | Any admin        | —                     | Delete a board member (+ its avatar)           |
| `GET`    | `/api/v1/notice`                 | Public           | —                     | List notices (branch-scoped, paginated)        |
| `GET`    | `/api/v1/notice/:id`             | Public           | —                     | Get one notice                                 |
| `POST`   | `/api/v1/notice`                 | Any admin        | `form` (image, file)  | Create a notice                                |
| `PATCH`  | `/api/v1/notice/:id`             | Any admin        | `form` (image, file)  | Update a notice                                |
| `DELETE` | `/api/v1/notice/:id`             | Any admin        | —                     | Delete a notice (+ its image & PDF)            |
| `GET`    | `/api/v1/banner`                 | Public           | —                     | List banners (branch-scoped, paginated)        |
| `GET`    | `/api/v1/banner/:id`             | Public           | —                     | Get one banner                                 |
| `POST`   | `/api/v1/banner`                 | Any admin        | `form` (image)        | Create a banner                                |
| `PATCH`  | `/api/v1/banner/:id`             | Any admin        | `form` (image)        | Update a banner                                |
| `DELETE` | `/api/v1/banner/:id`             | Any admin        | —                     | Delete a banner (+ its image)                  |
| `GET`    | `/api/v1/menu`                   | Public           | —                     | List menus (branch-scoped, paginated)          |
| `GET`    | `/api/v1/menu/:id`               | Public           | —                     | Get one menu                                   |
| `POST`   | `/api/v1/menu`                   | Any admin        | `json`                | Create a menu                                  |
| `PATCH`  | `/api/v1/menu/:id`               | Any admin        | `json`                | Update a menu                                  |
| `DELETE` | `/api/v1/menu/:id`               | Any admin        | —                     | Delete a menu (cascades sub-menus + pages)     |
| `GET`    | `/api/v1/submenu`                | Public           | —                     | List sub-menus (paginated)                     |
| `GET`    | `/api/v1/submenu/:id`            | Public           | —                     | Get one sub-menu                               |
| `POST`   | `/api/v1/submenu`                | Any admin        | `json`                | Create a sub-menu (+ its blank draft page)¹    |
| `PATCH`  | `/api/v1/submenu/:id`            | Any admin        | `json`                | Update a sub-menu                              |
| `DELETE` | `/api/v1/submenu/:id`            | Any admin        | —                     | Delete a sub-menu (+ its page and page media)  |
| `POST`   | `/api/v1/page`                   | Any admin        | `json`                | Create a page attached **directly to a menu**² |
| `GET`    | `/api/v1/page/by-submenu/:id`    | Public           | —                     | Get the page belonging to a sub-menu           |
| `GET`    | `/api/v1/page/by-menu/:id`       | Public           | —                     | Get the page attached directly to a menu       |
| `GET`    | `/api/v1/page/:id`               | Public           | —                     | Get one page                                   |
| `PATCH`  | `/api/v1/page/:id`               | Any admin        | `form` (banner)       | Update a page (banner, content, publish state) |
| `DELETE` | `/api/v1/page/:id`               | Any admin        | —                     | Delete a **menu-attached** page (+ its media)  |
| `POST`   | `/api/v1/page/:id/image`         | Any admin        | `form` (image)        | Upload a content image; returns its URL        |
| `POST`   | `/api/v1/page/:id/image/import`  | Any admin        | `json` (url)          | Import a pasted image (URL/data URI) to Cloudinary |
| `GET`    | `/api/v1/nav`                    | Public           | —                     | Published menu tree for a branch (`?branchName=`) |
| `GET`    | `/api/v1/nav/page`               | Public           | —                     | One published page by `?branchName=&menu=` (+ optional `&submenu=`) |

> ¹ A menu links either straight to **one page** or to **sub-menus** — never
> both. Creating the first sub-menu under a menu that has a direct page
> automatically moves that page under an auto-created sub-menu (its URL changes
> from `/:menuSlug` to `/:menuSlug/:pageSlug`).
>
> ² Only valid while the menu has no sub-menus (and no page yet); the page's
> banner title defaults to the menu title. Its public URL is `/:menuSlug`.

> **Public reads.** The `GET` routes above are public — they power the landing
> sites, which fetch each branch's profile, notices, and board members with no
> auth, scoped by `?branchName=`. Anonymous callers only ever see **published**
> notices; an authenticated admin additionally sees their own branch's drafts.
>
> Admins created through the API are always **branch admins** (a `branchId` is
> required); a super admin **cannot** create another super admin — those are
> seeded only via the bootstrap script. Branch admins only see and manage records
> for their own branch; super admins are unscoped. Branch **mutations** (create/
> update/delete) are super-admin only.

## Database Schema

| Table              | Constant                | Purpose                                          |
| ------------------ | ----------------------- | ------------------------------------------------ |
| `admins`           | `DB.ADMIN`              | Portal administrators (unique `username`)        |
| `branches`         | `DB.BRANCH`             | Organization branches (parent entity)            |
| `boardofdirectors` | `DB.BOARD_OF_DIRECTORS` | Board members of a branch                        |
| `notices`          | `DB.NOTICE`             | Notices published by a branch                    |
| `banners`          | `DB.BANNER`             | Hero-slider banners of a branch                  |
| `menus`            | `DB.MENU`               | Top-level nav menus of a branch's public site    |
| `submenus`         | `DB.SUBMENU`            | Sub-menu entries under a menu                    |
| `pages`            | `DB.PAGE`               | The page behind a sub-menu **or** a menu (banner + markdown) |

Each schema file also exports an inferred row type (`TAdmin`, `TBranch`,
`TBoardOfDirector`, `TNotice`, `TBanner`).

The `branches` table also has a unique, optional **`previewUrl`** — the public
URL of the branch's landing site, whose subdomain must be the branch name (e.g.
`https://dhaka.example.com` for "Dhaka"), validated in
[`branch.validator.ts`](src/shared/validators/branch.validator.ts).

### Relationships

A **branch** is the parent entity:

- One branch **has many** board of directors (`boardofdirectors.branchId → branches.id`)
- One branch **has many** notices (`notices.branchId → branches.id`)
- One branch **has many** banners (`banners.branchId → branches.id`)
- One branch **has many** menus (`menus.branchId → branches.id`); a menu
  **has many** sub-menus (`submenus.menuId → menus.id`), and each sub-menu
  **has one** page (`pages.submenuId → submenus.id`). Alternatively a menu with
  **no** sub-menus can hold one page directly (`pages.menuId → menus.id`); a
  CHECK constraint enforces that a page has exactly one of the two attachments

All child foreign keys are `ON DELETE CASCADE`. Query-time relations are defined
with Drizzle's `defineRelations` in
[`src/server/db/relations.ts`](src/server/db/relations.ts) and passed to the
client, enabling relational queries:

```ts
import db from "@/server/db/client";

const branch = await db.query.branchesTable.findFirst({
  with: {
    boardOfDirectors: true,
    notices: true,
    banners: true,
  },
});
```

### Enums

- `admin_type` — `SUPER_ADMIN` | `BRANCH_ADMIN` (defaults to `BRANCH_ADMIN`)

## Admin Panel (Frontend)

The Vite/React app in [`src/client/`](src/client/) is the admin UI for the API
above. During development it runs on its own port and proxies `/api` to the Hono
server (see [`src/client/vite.config.ts`](src/client/vite.config.ts)).

- **Routing & auth** — file-based routes split into a public `/login` and an
  authenticated `/_app` layout (sidebar + top bar). Route guards redirect
  unauthenticated users to login, and super-admin-only screens (Branches,
  Admins) redirect branch admins away. Tokens live in a persisted Zustand store;
  the `ky` client attaches the `Bearer` token and clears it on a `401`.
- **Screens** — Dashboard, Branches, Board of Directors, Banners, Notices,
  Menus & Pages (with a live-preview split-screen page editor), Admins, and
  Settings, each composed from `molecules` → `organisms` → `pages`. A menu with
  nothing in it offers both **Add page** (attach a page directly, no sub-menu)
  and **Add sub-menu**.
- **Forms** — TanStack Form with the Zod schemas in
  [`src/client/src/validators`](src/client/src/validators/) (`onChange`
  validation). When a super admin must pick a branch, the field is a dropdown
  populated from `/api/v1/branch`.
- **Lists** — server-paginated; the page/size (plus an optional `search` term
  and `branchName` filter) live in the URL search params (validated with Zod)
  and feed the TanStack Query hooks. Board of Directors, Notices, Admins, and
  Banners share a reusable filter toolbar — a debounced search box, a
  super-admin-only branch dropdown, and a clear-filters action. Each resource is
  presented as a responsive **card grid** rather than a table (Notices uses a
  master–detail layout with an inline PDF preview) — see
  [Screenshots](#screenshots).
- **Theming** — light/dark mode plus three accent colors (teal, blue, purple),
  chosen on the Settings page and persisted; applied via HeroUI theme tokens in
  [`src/client/src/index.css`](src/client/src/index.css).

## Public Landing Sites

The Next.js app in [`src/landing-page/`](src/landing-page/) is the public,
citizen-facing site. A single deployment serves **every branch** — there is no
per-branch build.

- **Subdomain → branch** — each request's branch is derived from its host
  subdomain in [`src/landing-page/lib/api.ts`](src/landing-page/lib/api.ts)
  (`dhaka.example.com` → `Dhaka`), reading the request `Host` header via Next's
  `headers()`. Branch sites exist **only** on branch subdomains: a bare host
  (apex, `www`, raw IP, or `localhost`) is a 404 — in production nginx already
  answers those hosts with its own 404 before Next.js is reached. In dev, the
  branch subdomains are allow-listed via `allowedDevOrigins` in
  [`next.config.ts`](src/landing-page/next.config.ts).
- **Server-side data** — Server Components fetch the API's **public** GET routes
  directly (server → server, no auth), scoped by `?branchName=`. A transient
  API/DB outage degrades to empty sections rather than a crashed page.
- **Bilingual** — every page has a Bengali/English toggle (Bengali is the
  default for a government portal); see the screenshots above.
- **Content** — hero, About, Notice Board, Board of Directors, Important Links,
  and a Contact section with an embedded map. Branch profile, hero banners,
  notices, and board members are live from the API. The rotating **hero** is
  driven by the branch's managed banners (it falls back to the bilingual static
  slides when none are set), and **Important Links** lists every branch — each
  linking to its own site via its `previewUrl` (falling back to the national
  e-government links when no branch URL is set). The org identity is static
  config, with the branch name templated into the chrome strings (hero slide,
  About intro, archive subtitles) via `withBranch()` in
  [`lib/i18n.ts`](src/landing-page/lib/i18n.ts).
- **Dynamic pages** — admin-authored Markdown pages from the Menus & Pages
  editor: `/:menuSlug/:submenuSlug` for sub-menu pages and `/:menuSlug` for
  pages attached directly to a menu. The nav renders direct-page menus as plain
  links and sub-menu menus as dropdowns, showing only **published** pages.

| Variable                    | Required | Description                                                        | Default                 |
| --------------------------- | -------- | ------------------------------------------------------------------ | ----------------------- |
| `API_BASE_URL`              | no       | Base URL of the Hono API the site fetches (server-side)            | `http://localhost:3000` |
| `NEXT_PUBLIC_DASHBOARD_URL` | no       | Origin of the admin panel, allowed to drive the `/preview/*` pages (build-time) | `http://localhost:5173` |

## Production Deployment

Development runs on **Bun**; production runs on **npm + Node** behind
**nginx**, straight from a repo clone on the server (currently
`/home/Govt-Project-2-Demo`). The ready-made configs live in
[`deploy/`](deploy/):

| File                                                     | Purpose                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| [`deploy/nginx.conf`](deploy/nginx.conf)                 | nginx vhosts — **HTTPS** (wildcard cert, HSTS)                    |
| [`deploy/nginx-ip.conf`](deploy/nginx-ip.conf)           | nginx vhosts — **current production**: real domain, HTTP only     |
| [`deploy/nginx-demo.conf`](deploy/nginx-demo.conf)       | nginx vhosts — public demo on a real domain, HTTP only            |
| [`deploy/nginx-test.conf`](deploy/nginx-test.conf)       | nginx vhosts — KVM/LAN testing via `/etc/hosts`, HTTP only        |
| [`deploy/api.service`](deploy/api.service)               | systemd unit `govt-api` — Hono API (`node dist/index.js`, :3000)  |
| [`deploy/landing.service`](deploy/landing.service)       | systemd unit `govt-landing` — landing sites (`next start`, :3001) |
| [`deploy/dashboard.service`](deploy/dashboard.service)   | systemd unit `govt-dashboard` — optional `vite preview` (:5173); unnecessary while nginx serves the panel statically |

Enable exactly **one** of the nginx site configs — they define the same
upstreams. The HTTP-only variants require the front-ends to be built with
`http://` origins (`VITE_LANDING_URL`, `NEXT_PUBLIC_DASHBOARD_URL`); see the
comments in each file.

### Host layout

One domain serves everything (the live deployment uses `rida-project.com`):

- **`*.example.com`** — the landing sites, one per branch, resolved from the
  subdomain at request time — creating a branch in the dashboard needs **no
  nginx change**. Requires a wildcard DNS `A` record, and (for HTTPS) a
  **wildcard TLS certificate**
  (`certbot certonly --preferred-challenges dns -d example.com -d '*.example.com'`).
- **`example.com` / `www` / raw IP** — serve **nothing**: nginx answers with
  its default 404 (branch sites exist only on their subdomains), and the
  Next.js app 404s such hosts too if reached directly.
- **`app.example.com`** — the admin panel, served as static files from
  `src/client/dist`. The panel calls the API at a **relative `/api/v1`**
  (proxied by Vite in dev), so nginx proxies `location /api/` to the Hono
  process — same-origin, no CORS.
- **`api.example.com`** — optional direct API host for external consumers.

### Deploy (on the server)

```bash
cd /home/Govt-Project-2-Demo && git pull

# 1. First time only: install deps and env files
npm run install:prod
cp .env.template .env                                  # fill in (see Getting Started)
cp src/client/.env.template src/client/.env            # VITE_LANDING_URL=http://example.com
cp src/landing-page/.env.template src/landing-page/.env # API_BASE_URL, NEXT_PUBLIC_DASHBOARD_URL

# 2. Migrate + build (front-end origins are baked in at build time from the .env files)
npm run db:migrate
npm run build:all

# 3. First time only: install the systemd units and nginx config
#    (systemd needs node at /usr/bin/node — for an nvm install:
#     sudo ln -sf "$(command -v node)" /usr/bin/node)
sudo cp deploy/api.service /etc/systemd/system/govt-api.service
sudo cp deploy/landing.service /etc/systemd/system/govt-landing.service
sudo systemctl daemon-reload && sudo systemctl enable --now govt-api govt-landing
sudo cp deploy/nginx-ip.conf /etc/nginx/sites-available/govt-project-ip.conf
sudo ln -sf /etc/nginx/sites-available/govt-project-ip.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 4. Every redeploy after that:
sudo systemctl restart govt-api govt-landing
# logs: journalctl -u govt-api -f / journalctl -u govt-landing -f
```

Production environment summary:

| App           | Runtime           | Env (where it's read)                                                                 |
| ------------- | ----------------- | -------------------------------------------------------------------------------------- |
| API           | Node (systemd)    | `.env` in the repo root — see [Getting Started](#getting-started)                       |
| Admin panel   | static via nginx  | `src/client/.env`: `VITE_LANDING_URL` — **build-time** (landing origin for previews)   |
| Landing sites | Node (systemd)    | `src/landing-page/.env`: `API_BASE_URL` (runtime); `NEXT_PUBLIC_DASHBOARD_URL` (**build-time**) |

The nginx config also sets the production security headers — including a
`frame-ancestors` policy on the landing sites that allows **only** the admin
panel to embed them (the page editor's live preview is an iframe of the
branch's landing origin).

## Conventions

- Path alias `@/*` maps to `src/*` (see [`tsconfig.json`](tsconfig.json)).
- Types are prefixed with `T` (e.g. `TAppEnv`, `TTokenPayload`).
- Drizzle ORM here is the **v1 release candidate**, which uses the new
  `defineRelations` API rather than the legacy per-table `relations()` helper.
- Production builds target and run on **Node**, so server code avoids Bun-only
  globals (e.g. password hashing uses `argon2`, not `Bun.password`).
