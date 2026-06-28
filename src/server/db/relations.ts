import { defineRelations } from "drizzle-orm";
import * as schema from "./schemas";

export const relations = defineRelations(schema, (r) => ({
  branchesTable: {
    // One branch has many admins
    admins: r.many.adminsTable(),
    // One branch has many board of directors
    boardOfDirectors: r.many.boardOfDirectorsTable(),
    // One branch has many notices
    notices: r.many.noticesTable(),
    // One branch has exactly one layout
    layout: r.one.layoutsTable(),
  },
  adminsTable: {
    // Super admins have no branch, so this relation is optional.
    branch: r.one.branchesTable({
      from: r.adminsTable.branchId,
      to: r.branchesTable.id,
    }),
  },
  boardOfDirectorsTable: {
    branch: r.one.branchesTable({
      from: r.boardOfDirectorsTable.branchId,
      to: r.branchesTable.id,
      optional: false,
    }),
  },
  noticesTable: {
    branch: r.one.branchesTable({
      from: r.noticesTable.branchId,
      to: r.branchesTable.id,
      optional: false,
    }),
  },
  layoutsTable: {
    branch: r.one.branchesTable({
      from: r.layoutsTable.branchId,
      to: r.branchesTable.id,
      optional: false,
    }),
  },
}));
