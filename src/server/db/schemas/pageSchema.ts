import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { DB } from "../constant";
import { branchesTable } from "./branchSchema";
import { submenusTable } from "./submenuSchema";

/**
 * The content shown when a sub-menu is opened: a banner (title + optional
 * image) and a Markdown body. One page per sub-menu (`submenuId` is unique), so
 * the page is created/edited alongside its sub-menu. Pages start unpublished
 * (`isPublished = false`) and are only surfaced on the public site once
 * published from the page editor; drafts remain visible in the preview.
 * `branchId` is denormalized for single-column branch scoping.
 *
 * Banner title and body are bilingual (`*Bn`/`*En`); the banner image is shared
 * across languages. The public site renders the active language with fallback.
 */
export const pagesTable = pgTable(DB.PAGE, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  bannerTitleBn: varchar({ length: 255 }),
  bannerTitleEn: varchar({ length: 255 }),
  bannerImage: varchar({ length: 255 }),
  contentBn: text(),
  contentEn: text(),
  isPublished: boolean().notNull().default(false),
  submenuId: integer()
    .notNull()
    .unique()
    .references(() => submenusTable.id, { onDelete: "cascade" }),
  branchId: integer()
    .notNull()
    .references(() => branchesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TPage = typeof pagesTable.$inferSelect;
