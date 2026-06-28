import { adminType, adminTypes, type TAdminTypes } from "@/shared/types";
import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { DB } from "../constant";
import { branchesTable } from "./branchSchema";

export const adminTypeEnum = pgEnum(
  "admin_type",
  adminTypes as [TAdminTypes, ...TAdminTypes[]],
);

export const adminsTable = pgTable(DB.ADMIN, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  avatar: varchar({ length: 255 }).notNull(),
  adminType: adminTypeEnum().notNull().default(adminType.BRANCH_ADMIN),
  // Null for super admins; required for branch admins (enforced in routes).
  branchId: integer().references(() => branchesTable.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TAdmin = typeof adminsTable.$inferSelect;
