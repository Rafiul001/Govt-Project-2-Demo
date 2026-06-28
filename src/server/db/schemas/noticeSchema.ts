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

export const noticesTable = pgTable(DB.NOTICE, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  fileUrl: varchar({ length: 255 }),
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

export type TNotice = typeof noticesTable.$inferSelect;
