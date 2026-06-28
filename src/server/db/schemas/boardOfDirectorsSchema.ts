import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { DB } from "../constant";
import { branchesTable } from "./branchSchema";

export const boardOfDirectorsTable = pgTable(DB.BOARD_OF_DIRECTORS, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  designation: varchar({ length: 255 }).notNull(),
  avatar: varchar({ length: 255 }).notNull(),
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
