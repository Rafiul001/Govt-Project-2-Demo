import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { DB } from "../constant";
import { branchesTable } from "./branchSchema";

export const bannersTable = pgTable(DB.BANNER, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  subTitle: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }),
  order: integer().notNull().default(0),
  branchId: integer()
    .notNull()
    .references(() => branchesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TBanner = typeof bannersTable.$inferSelect;
