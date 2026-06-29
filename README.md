# govt-project-2-demo

Full-stack application for a multi-branch government/organization portal. The
**backend** is a JSON API built on the [Bun](https://bun.com) runtime with
[Hono](https://hono.dev) for HTTP routing, [Drizzle ORM](https://orm.drizzle.team)
(v1) over PostgreSQL, JWT authentication, and [Pino](https://getpino.io) for
logging. The **frontend** is a React admin panel ([`src/client/`](src/client/))
built with Vite, TanStack Router/Query/Form, and HeroUI.

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

## Prerequisites

- [Bun](https://bun.com) `>= 1.3`
- A running PostgreSQL instance

## Getting Started

1. **Install dependencies**

   Install the backend (root) and the frontend (`src/client/`) dependencies:

   ```bash
   bun install
   cd src/client && bun install && cd ../..
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
   bunx drizzle-kit generate   # generate SQL migrations from the schema
   bunx drizzle-kit migrate    # apply migrations
   # or, for rapid local iteration:
   bunx drizzle-kit push       # push the schema directly without migration files
   bunx drizzle-kit studio     # browse data in Drizzle Studio
   ```

4. **Create the first super admin**

   Admin creation requires an authenticated super admin, so bootstrap one with
   the seed script:

   ```bash
   bun src/scripts/createSuperAdmin.ts <username> <password> [name]
   ```

5. **Run the app**

   ```bash
   bun run dev                 # backend (watch mode) + frontend (Vite) together
   ```

   This starts both processes concurrently. The server logs
   `Server running at http://localhost:<PORT>`, and Vite serves the admin panel
   on its own dev URL (printed in the console). To run just one side:

   ```bash
   bun run dev:server          # backend only
   bun run dev:client          # frontend only
   ```

## Scripts

Root scripts:

| Script               | Description                                              |
| -------------------- | ------------------------------------------------------- |
| `bun run dev`        | Run backend (watch) + frontend (Vite) concurrently       |
| `bun run dev:server` | Start only the backend in watch mode (`src/index.ts`)    |
| `bun run dev:client` | Start only the frontend Vite dev server                  |
| `bun run build`      | Bundle the backend to `dist/` (`NODE_ENV=production`)     |
| `bun run start`      | Run the built backend bundle with Node (`dist/index.js`) |

Frontend scripts (run from `src/client/`):

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `bun run dev`     | Start the Vite dev server                  |
| `bun run build`   | Type-check and build the client to `dist/` |
| `bun run preview` | Preview the production build               |
| `bun run lint`    | Lint the client with ESLint                |

## Project Structure

```
src/
├── client/                   # React admin panel (Vite app — see src/client/README.md)
│   ├── index.html            # Vite entry HTML
│   ├── vite.config.ts        # Vite config (React Compiler + TanStack Router plugin)
│   └── src/
│       ├── main.tsx          # App bootstrap (router + providers)
│       ├── routeTree.gen.ts  # Generated TanStack Router route tree
│       ├── routes/           # File-based routes (__root.tsx, index.tsx)
│       └── components/       # Pages and layouts
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
│   │       ├── boardOfDirectorsRouter.ts   # /api/v1/board-of-directors routes
│   │       ├── layoutRouter.ts             # /api/v1/layout routes
│   │       └── noticeRouter.ts             # /api/v1/notice routes
│   ├── service/
│   │   └── cloudinary/
│   │       ├── client.ts       # Configured Cloudinary client + URL helpers
│   │       ├── imageUpload.ts   # upload/replace/delete image assets
│   │       └── pdfUpload.ts     # upload/replace/delete PDF assets
│   ├── utils/
│   │   ├── jwt.ts            # Access/refresh token generate & verify
│   │   └── password.ts      # argon2 hash & verify
│   └── db/
│       ├── client.ts         # Drizzle client (wired with relations)
│       ├── constant.ts       # Table name constants (DB.*)
│       ├── relations.ts      # Relational config (defineRelations)
│       └── schemas/
│           ├── index.ts      # Barrel re-export of all tables
│           ├── adminSchema.ts
│           ├── branchSchema.ts
│           ├── boardOfDirectorsSchema.ts
│           ├── layoutSchema.ts
│           └── noticeSchema.ts
└── shared/
    ├── types/
    │   └── index.ts          # Shared enums/types (adminType, tokenType, …)
    ├── utils/
    │   └── pino-logger.ts    # Configured Pino logger
    └── validators/
        ├── admin.validator.ts            # Zod schemas for admin requests
        ├── boardOfDirectors.validator.ts # Zod schemas for board requests
        ├── layout.validator.ts           # Zod schemas for layout requests
        ├── notice.validator.ts           # Zod schemas for notice requests
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

| Method   | Path                             | Auth             | Body                 | Description                                    |
| -------- | -------------------------------- | ---------------- | -------------------- | ---------------------------------------------- |
| `POST`   | `/api/v1/admin/login`            | Public           | `json`               | Log in; returns `accessToken` + `refreshToken` |
| `GET`    | `/api/v1/admin`                  | Super admin only | —                    | List all admins                                |
| `POST`   | `/api/v1/admin`                  | Super admin only | `form` (avatar)      | Create a new admin                             |
| `POST`   | `/api/v1/admin/logout`           | Any admin        | —                    | Logout (stateless acknowledgement)             |
| `GET`    | `/api/v1/board-of-directors`     | Any admin        | —                    | List board members (branch-scoped)             |
| `GET`    | `/api/v1/board-of-directors/:id` | Any admin        | —                    | Get one board member                           |
| `POST`   | `/api/v1/board-of-directors`     | Any admin        | `form` (avatar)      | Create a board member                          |
| `PATCH`  | `/api/v1/board-of-directors/:id` | Any admin        | `form` (avatar)      | Update a board member                          |
| `DELETE` | `/api/v1/board-of-directors/:id` | Any admin        | —                    | Delete a board member (+ its avatar)           |
| `GET`    | `/api/v1/layout`                 | Any admin        | —                    | List layouts (branch-scoped)                   |
| `GET`    | `/api/v1/layout/:id`             | Any admin        | —                    | Get one layout                                 |
| `POST`   | `/api/v1/layout`                 | Any admin        | `json`               | Create a layout                                |
| `PATCH`  | `/api/v1/layout/:id`             | Any admin        | `json`               | Update a layout                                |
| `DELETE` | `/api/v1/layout/:id`             | Any admin        | —                    | Delete a layout                                |
| `GET`    | `/api/v1/notice`                 | Any admin        | —                    | List notices (branch-scoped)                   |
| `GET`    | `/api/v1/notice/:id`             | Any admin        | —                    | Get one notice                                 |
| `POST`   | `/api/v1/notice`                 | Any admin        | `form` (image, file) | Create a notice                                |
| `PATCH`  | `/api/v1/notice/:id`             | Any admin        | `form` (image, file) | Update a notice                                |
| `DELETE` | `/api/v1/notice/:id`             | Any admin        | —                    | Delete a notice (+ its image & PDF)            |

> Only a super admin can create other admins, and a super admin **may** create
> another super admin. Branch admins only see and manage records for their own
> branch; super admins are unscoped.

## Database Schema

| Table              | Constant                | Purpose                                   |
| ------------------ | ----------------------- | ----------------------------------------- |
| `admins`           | `DB.ADMIN`              | Portal administrators (unique `username`) |
| `branches`         | `DB.BRANCH`             | Organization branches (parent entity)     |
| `boardofdirectors` | `DB.BOARD_OF_DIRECTORS` | Board members of a branch                 |
| `layouts`          | `DB.LAYOUT`             | Per-branch layout/display settings        |
| `notices`          | `DB.NOTICE`             | Notices published by a branch             |

Each schema file also exports an inferred row type (`TAdmin`, `TBranch`,
`TBoardOfDirector`, `TLayout`, `TNotice`).

### Relationships

A **branch** is the parent entity:

- One branch **has many** board of directors (`boardofdirectors.branchId → branches.id`)
- One branch **has many** notices (`notices.branchId → branches.id`)
- One branch **has one** layout (`layouts.branchId → branches.id`, `UNIQUE`)

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
    layout: true,
  },
});
```

### Enums

- `admin_type` — `SUPER_ADMIN` | `BRANCH_ADMIN` (defaults to `BRANCH_ADMIN`)
- `sidebar_position` — `left` | `right` (layout setting, defaults to `right`)

## Conventions

- Path alias `@/*` maps to `src/*` (see [`tsconfig.json`](tsconfig.json)).
- Types are prefixed with `T` (e.g. `TAppEnv`, `TTokenPayload`).
- Drizzle ORM here is the **v1 release candidate**, which uses the new
  `defineRelations` API rather than the legacy per-table `relations()` helper.
- Production builds target and run on **Node**, so server code avoids Bun-only
  globals (e.g. password hashing uses `argon2`, not `Bun.password`).

```

```
