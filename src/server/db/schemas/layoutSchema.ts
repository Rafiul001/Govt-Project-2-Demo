import {
  sidebarPosition,
  sidebarPositions,
  type TSidebarPositionTypes,
} from "@/shared/types";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { DB } from "../constant";
import { branchesTable } from "./branchSchema";

export const sidebarPositionEnum = pgEnum(
  "sidebar_position",
  sidebarPositions as [TSidebarPositionTypes, ...TSidebarPositionTypes[]],
);

export const layoutsTable = pgTable(DB.LAYOUT, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  branchId: integer()
    .notNull()
    .unique()
    .references(() => branchesTable.id, { onDelete: "cascade" }),
  showLogo: boolean().notNull().default(true),
  showBanner: boolean().notNull().default(true),
  sidebarPosition: sidebarPositionEnum()
    .notNull()
    .default(sidebarPosition.RIGHT),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TLayout = typeof layoutsTable.$inferSelect;
