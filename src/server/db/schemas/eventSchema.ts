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

/**
 * An event of a branch (tournament, training camp, ceremony, …), shown as a
 * list and a month calendar on both the dashboard and the public landing
 * site. `endAt` is optional — a single-moment event only has `startAt`; the
 * validator enforces `endAt >= startAt` when both are set.
 *
 * The title/description are bilingual (`*Bn`/`*En`, ≥1 title required —
 * validator-enforced). Events start published; unpublished events are hidden
 * from anonymous visitors (like notices).
 */
export const eventsTable = pgTable(DB.EVENT, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  titleBn: varchar({ length: 255 }),
  titleEn: varchar({ length: 255 }),
  descriptionBn: text(),
  descriptionEn: text(),
  venue: varchar({ length: 255 }),
  startAt: timestamp().notNull(),
  endAt: timestamp(),
  image: varchar({ length: 255 }),
  isPublished: boolean().notNull().default(true),
  branchId: integer()
    .notNull()
    .references(() => branchesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TEvent = typeof eventsTable.$inferSelect;
