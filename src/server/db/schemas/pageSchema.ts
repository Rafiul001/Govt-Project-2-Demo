import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { DB } from "../constant";
import { branchesTable } from "./branchSchema";
import { menusTable } from "./menuSchema";
import { submenusTable } from "./submenuSchema";

/**
 * The content shown when a nav item is opened: a banner (title + optional
 * image) and a Markdown body. A page is attached to exactly ONE of:
 *
 * - a sub-menu (`submenuId`, URL `/:menuSlug/:submenuSlug`) — created and
 *   deleted together with its sub-menu; or
 * - a menu directly (`menuId`, URL `/:menuSlug`) — for menus without
 *   sub-menus. Adding the first sub-menu to such a menu moves this page under
 *   an auto-created sub-menu (see the submenu router), so a menu never mixes
 *   a direct page with sub-menus.
 *
 * Both attachments are unique (one page per sub-menu / per menu) and the CHECK
 * enforces exactly one is set. Pages start unpublished (`isPublished = false`)
 * and are only surfaced on the public site once published from the page
 * editor; drafts remain visible in the preview. `branchId` is denormalized
 * for single-column branch scoping.
 *
 * Banner title and body are bilingual (`*Bn`/`*En`); the banner image is shared
 * across languages. The public site renders the active language with fallback.
 */
export const pagesTable = pgTable(
  DB.PAGE,
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    bannerTitleBn: varchar({ length: 255 }),
    bannerTitleEn: varchar({ length: 255 }),
    bannerImage: varchar({ length: 255 }),
    contentBn: text(),
    contentEn: text(),
    isPublished: boolean().notNull().default(false),
    submenuId: integer()
      .unique()
      .references(() => submenusTable.id, { onDelete: "cascade" }),
    menuId: integer()
      .unique()
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
  (table) => [
    // A page belongs to exactly one of: a sub-menu, or a menu directly.
    check(
      "pages_attachment_check",
      sql`(${table.submenuId} IS NULL) <> (${table.menuId} IS NULL)`,
    ),
  ],
);

export type TPage = typeof pagesTable.$inferSelect;
