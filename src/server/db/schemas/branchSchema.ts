import {
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { DB } from "../constant";

export const branchesTable = pgTable(DB.BRANCH, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  // Public preview URL for the branch's landing site. Its subdomain must be the
  // branch name (e.g. https://dhaka.example.com for "Dhaka"). Unique per branch.
  previewUrl: varchar({ length: 255 }).unique(),
  address: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 50 }),
  email: varchar({ length: 255 }),
  logo: varchar({ length: 255 }),
  banner: varchar({ length: 255 }),
  // Whether the branch has been published from the branch editor. New branches
  // start unpublished until a super admin publishes them from /branch/:id/edit.
  isPublished: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TBranch = typeof branchesTable.$inferSelect;
