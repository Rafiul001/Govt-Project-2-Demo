import {
  integer,
  pgTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { DB } from "../constant";
import { branchesTable } from "./branchSchema";
import { menusTable } from "./menuSchema";

/**
 * A sub-menu item under a menu. Each sub-menu owns exactly one page (see
 * `pagesTable`) and is the thing a visitor actually clicks. Its `slug` is the
 * second path segment of the page URL (`/:menuSlug/:submenuSlug`) and is unique
 * within its parent menu. `branchId` is denormalized from the menu so branch
 * scoping stays a single-column check, matching the other tables.
 *
 * The title is bilingual (`titleBn`/`titleEn`, each optional but at least one
 * set), rendered per the active site language with fallback.
 */
export const submenusTable = pgTable(
  DB.SUBMENU,
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    titleBn: varchar({ length: 255 }),
    titleEn: varchar({ length: 255 }),
    slug: varchar({ length: 255 }).notNull(),
    order: integer().notNull().default(0),
    menuId: integer()
      .notNull()
      .references(() => menusTable.id, { onDelete: "cascade" }),
    branchId: integer()
      .notNull()
      .references(() => branchesTable.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.menuId, table.slug)],
);

export type TSubmenu = typeof submenusTable.$inferSelect;
