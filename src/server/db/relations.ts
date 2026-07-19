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
    // One branch has many banners
    banners: r.many.bannersTable(),
    // One branch has many menus
    menus: r.many.menusTable(),
    // One branch has many sub-menus
    submenus: r.many.submenusTable(),
    // One branch has many pages
    pages: r.many.pagesTable(),
    // One branch has many members
    members: r.many.membersTable(),
    // One branch has many events
    events: r.many.eventsTable(),
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
  bannersTable: {
    branch: r.one.branchesTable({
      from: r.bannersTable.branchId,
      to: r.branchesTable.id,
      optional: false,
    }),
  },
  menusTable: {
    branch: r.one.branchesTable({
      from: r.menusTable.branchId,
      to: r.branchesTable.id,
      optional: false,
    }),
    // One menu has many sub-menus
    submenus: r.many.submenusTable(),
  },
  submenusTable: {
    branch: r.one.branchesTable({
      from: r.submenusTable.branchId,
      to: r.branchesTable.id,
      optional: false,
    }),
    menu: r.one.menusTable({
      from: r.submenusTable.menuId,
      to: r.menusTable.id,
      optional: false,
    }),
    // One sub-menu has exactly one page
    page: r.one.pagesTable({
      from: r.submenusTable.id,
      to: r.pagesTable.submenuId,
    }),
  },
  pagesTable: {
    branch: r.one.branchesTable({
      from: r.pagesTable.branchId,
      to: r.branchesTable.id,
      optional: false,
    }),
    submenu: r.one.submenusTable({
      from: r.pagesTable.submenuId,
      to: r.submenusTable.id,
      optional: false,
    }),
  },
  memberCategoriesTable: {
    // One category has many members (across all branches)
    members: r.many.membersTable(),
  },
  membersTable: {
    branch: r.one.branchesTable({
      from: r.membersTable.branchId,
      to: r.branchesTable.id,
      optional: false,
    }),
    category: r.one.memberCategoriesTable({
      from: r.membersTable.categoryId,
      to: r.memberCategoriesTable.id,
      optional: false,
    }),
  },
  eventsTable: {
    branch: r.one.branchesTable({
      from: r.eventsTable.branchId,
      to: r.branchesTable.id,
      optional: false,
    }),
  },
}));
