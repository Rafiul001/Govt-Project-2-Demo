import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { DB } from "../constant";

/**
 * A dynamic member category (খেলোয়াড়, কোচ, কর্মকর্তা, ফিজিও, …). Categories are
 * GLOBAL — shared by every branch — and managed by super admins only, so new
 * kinds of people can be added without a code change. Four defaults are seeded
 * by a data migration.
 *
 * The name is bilingual: `nameBn`/`nameEn` are each optional, but at least one
 * is always set (enforced by the validator). The `slug` (lowercase kebab,
 * language-independent) forms the public URL of the category's page on a
 * branch landing site (`/members/:slug`) and is globally unique.
 */
export const memberCategoriesTable = pgTable(DB.MEMBER_CATEGORY, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nameBn: varchar({ length: 255 }),
  nameEn: varchar({ length: 255 }),
  slug: varchar({ length: 255 }).notNull().unique(),
  order: integer().notNull().default(0),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TMemberCategory = typeof memberCategoriesTable.$inferSelect;
