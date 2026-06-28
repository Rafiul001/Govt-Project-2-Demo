import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { DB } from "../constant";

export const branchesTable = pgTable(DB.BRANCH, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  address: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 50 }),
  email: varchar({ length: 255 }),
  logo: varchar({ length: 255 }),
  banner: varchar({ length: 255 }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
