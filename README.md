# govt-project-2-demo

Backend API for a multi-branch government/organization portal. Built on the
[Bun](https://bun.com) runtime with [Hono](https://hono.dev) for HTTP routing,
[Drizzle ORM](https://orm.drizzle.team) (v1) over PostgreSQL, and
[Pino](https://getpino.io) for logging.

## Tech Stack

| Concern        | Choice                                |
| -------------- | ------------------------------------- |
| Runtime        | Bun                                   |
| HTTP framework | Hono (served via `@hono/node-server`) |
| Database       | PostgreSQL                            |
| ORM            | Drizzle ORM `1.0.0-rc` + `pg` driver  |
| Migrations     | drizzle-kit                           |
| Logging        | Pino (`pino-pretty` in development)   |
| Language       | TypeScript                            |

## Prerequisites

- [Bun](https://bun.com) `>= 1.3`
- A running PostgreSQL instance

## Getting Started

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure environment**

   Copy the template and fill in values:

   ```bash
   cp .env.template .env
   ```

   | Variable       | Description                               | Example                                                      |
   | -------------- | ----------------------------------------- | ------------------------------------------------------------ |
   | `NODE_ENV`     | `development` \| `production` \| `test`   | `development`                                                |
   | `PORT`         | HTTP server port                          | `3000`                                                       |
   | `LOG_LEVEL`    | `fatal`…`trace`                           | `debug`                                                      |
   | `DATABASE_URL` | Postgres connection string (**required**) | `postgres://postgres:postgres@localhost:5432/govt_project_2` |

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

4. **Run the server**

   ```bash
   bun run dev                 # watch mode
   ```

   The server logs `Server running at http://localhost:<PORT>`.

## Scripts

| Script          | Description                                              |
| --------------- | -------------------------------------------------------- |
| `bun run dev`   | Start the server in watch mode (`src/index.ts`)          |
| `bun run build` | Bundle to `dist/` for production (`NODE_ENV=production`) |
| `bun run start` | Run the built bundle with Node (`dist/index.js`)         |

## Project Structure

```
src/
├── index.ts                  # Entry point: boots Hono server, graceful shutdown
├── server/
│   ├── server.ts             # Hono app & routes
│   ├── config/
│   │   └── index.ts          # Env validation & typed config
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
    │   └── index.ts          # Shared enums/types (adminType, sidebarPosition)
    └── utils/
        └── pino-logger.ts    # Configured Pino logger
```

## Database Schema

| Table              | Constant                | Purpose                               |
| ------------------ | ----------------------- | ------------------------------------- |
| `admins`           | `DB.ADMIN`              | Portal administrators                 |
| `branches`         | `DB.BRANCH`             | Organization branches (parent entity) |
| `boardofdirectors` | `DB.BOARD_OF_DIRECTORS` | Board members of a branch             |
| `layouts`          | `DB.LAYOUT`             | Per-branch layout/display settings    |
| `notices`          | `DB.NOTICE`             | Notices published by a branch         |

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

## Notes

- Path alias `@/*` maps to `src/*` (see [`tsconfig.json`](tsconfig.json)).
- Drizzle ORM here is the **v1 release candidate**, which uses the new
  `defineRelations` API rather than the legacy per-table `relations()` helper.
