import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { DB } from "../constant";
import { branchesTable } from "./branchSchema";
import { memberCategoriesTable } from "./memberCategorySchema";

/**
 * A GEMS-style member profile (player, coach, official, physio, …) belonging
 * to a branch and a dynamic member category. Only the name (bilingual, ≥1
 * language — validator-enforced) is required; every other profile field is
 * optional so admins can fill in what they have.
 *
 * `categoryId` is `restrict` (not cascade): deleting a category must not
 * silently wipe member profiles across all branches — the category router
 * refuses to delete a non-empty category.
 *
 * PRIVACY: `nid`, `mobile`, `email`, `address` and `dateOfBirth` are
 * admin-only — the member routes strip them from anonymous (public landing
 * site) responses. See `toPublicMember` in the member router.
 */
export const membersTable = pgTable(DB.MEMBER, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // Basic
  nameBn: varchar({ length: 255 }),
  nameEn: varchar({ length: 255 }),
  designation: varchar({ length: 255 }),
  photo: varchar({ length: 255 }),
  mobile: varchar({ length: 32 }),
  email: varchar({ length: 255 }),
  order: integer().notNull().default(0),
  // Personal (admin-only on public responses)
  dateOfBirth: date({ mode: "string" }),
  bloodGroup: varchar({ length: 8 }),
  gender: varchar({ length: 16 }),
  nid: varchar({ length: 32 }),
  address: text(),
  // Sports
  discipline: varchar({ length: 255 }),
  jerseyNumber: integer(),
  joiningDate: date({ mode: "string" }),
  achievements: text(),
  bio: text(),
  categoryId: integer()
    .notNull()
    .references(() => memberCategoriesTable.id, { onDelete: "restrict" }),
  branchId: integer()
    .notNull()
    .references(() => branchesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TMember = typeof membersTable.$inferSelect;
