import {
  integer,
  pgTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { DB } from "../constant";
import { branchesTable } from "./branchSchema";

/**
 * Top-level navigation menu for a branch's public site. A menu is only a
 * dropdown label — it never links to a page itself; its sub-menus do. The
 * `slug` (derived from the title, language-independent) forms the first path
 * segment of a page URL (`/:menuSlug/:submenuSlug`) and is unique per branch.
 *
 * The title is bilingual: `titleBn`/`titleEn` are each optional, but at least
 * one is always set (enforced by the validator). The public site shows the one
 * for the active language and falls back to the other when it is empty.
 */
export const menusTable = pgTable(
  DB.MENU,
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    titleBn: varchar({ length: 255 }),
    titleEn: varchar({ length: 255 }),
    slug: varchar({ length: 255 }).notNull(),
    order: integer().notNull().default(0),
    branchId: integer()
      .notNull()
      .references(() => branchesTable.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.branchId, table.slug)],
);

export type TMenu = typeof menusTable.$inferSelect;
