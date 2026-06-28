import { adminType } from "@/shared/types";
import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { DB } from "../constant";

const adminTypeEnum = pgEnum("admin_type", adminType);

export const adminsTable = pgTable(DB.ADMIN, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  avatar: varchar({ length: 255 }).notNull(),
  adminType: adminTypeEnum().notNull().default(adminType.BRANCH_ADMIN),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TAdmin = typeof adminsTable.$inferSelect;
