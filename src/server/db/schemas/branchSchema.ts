import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { TAboutHighlight } from "@/shared/validators/branch.validator";
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
  // --- "About us" section of the public site, edited in the branch editor ---
  // Bilingual, every language optional: the landing page renders the active
  // language, falls back to the other, and finally to its own built-in default
  // copy when the branch has left the field blank. See `AboutSection`.
  aboutTitleBn: varchar({ length: 255 }),
  aboutTitleEn: varchar({ length: 255 }),
  aboutSubtitleBn: text(),
  aboutSubtitleEn: text(),
  aboutIntroBn: text(),
  aboutIntroEn: text(),
  // The highlight cards under the intro: `[{ icon, titleBn, titleEn, bodyBn,
  // bodyEn }]`. `null` (never set) falls back to the built-in defaults; an
  // empty array deliberately hides the cards.
  aboutHighlights: jsonb().$type<TAboutHighlight[]>(),
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
