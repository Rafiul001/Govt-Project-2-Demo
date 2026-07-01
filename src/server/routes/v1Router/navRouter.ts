import db from "@/server/db/client";
import { menusTable, pagesTable, submenusTable } from "@/server/db/schemas";
import { notFound, ok } from "@/server/responses";
import type { TAppEnv } from "@/server/types";
import { branchIdByName } from "@/server/utils/scope";
import { pageBySlugQuerySchema } from "@/shared/validators/nav.validator";
import { branchListQuerySchema } from "@/shared/validators/pagination.validator";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

const navRouter = new Hono<TAppEnv>();

// Public, read-only navigation for the landing sites. Both routes are scoped by
// branch *name* (derived from the visitor's subdomain) and only ever expose
// *published* pages, mirroring the other public read routes.

/**
 * GET /api/v1/nav?branchName= — the published menu tree for a branch.
 *
 * Returns menus (ordered) each with the sub-menus (ordered) whose page is
 * published. Menus with no published sub-menu are omitted, so the public
 * NavBar never shows an empty dropdown.
 */
navRouter.get("/", zValidator("query", branchListQuerySchema), async (c) => {
  const { branchName } = c.req.valid("query");

  const branchId = branchName ? await branchIdByName(branchName) : null;
  if (branchId === null) {
    return ok(c, "Navigation fetched successfully", []);
  }

  const menus = await db
    .select({
      id: menusTable.id,
      titleBn: menusTable.titleBn,
      titleEn: menusTable.titleEn,
      slug: menusTable.slug,
      order: menusTable.order,
    })
    .from(menusTable)
    .where(eq(menusTable.branchId, branchId))
    .orderBy(menusTable.order, menusTable.id);

  // Only sub-menus whose page is published, joined so we get the order too.
  const submenus = await db
    .select({
      id: submenusTable.id,
      menuId: submenusTable.menuId,
      titleBn: submenusTable.titleBn,
      titleEn: submenusTable.titleEn,
      slug: submenusTable.slug,
      order: submenusTable.order,
    })
    .from(submenusTable)
    .innerJoin(pagesTable, eq(pagesTable.submenuId, submenusTable.id))
    .where(
      and(
        eq(submenusTable.branchId, branchId),
        eq(pagesTable.isPublished, true),
      ),
    )
    .orderBy(submenusTable.order, submenusTable.id);

  const tree = menus
    .map((menu) => ({
      ...menu,
      submenus: submenus.filter((s) => s.menuId === menu.id),
    }))
    .filter((menu) => menu.submenus.length > 0);

  return ok(c, "Navigation fetched successfully", tree);
});

/**
 * GET /api/v1/nav/page?branchName=&menu=&submenu= — a single published page,
 * resolved by the menu and sub-menu slugs. 404 when the branch, menu,
 * sub-menu, or a *published* page is missing.
 */
navRouter.get(
  "/page",
  zValidator("query", pageBySlugQuerySchema),
  async (c) => {
    const {
      branchName,
      menu: menuSlug,
      submenu: submenuSlug,
    } = c.req.valid("query");

    const branchId = await branchIdByName(branchName);
    if (branchId === null) {
      return notFound(c, "Page not found");
    }

    const [row] = await db
      .select({
        pageId: pagesTable.id,
        bannerTitleBn: pagesTable.bannerTitleBn,
        bannerTitleEn: pagesTable.bannerTitleEn,
        bannerImage: pagesTable.bannerImage,
        contentBn: pagesTable.contentBn,
        contentEn: pagesTable.contentEn,
        isPublished: pagesTable.isPublished,
        menuTitleBn: menusTable.titleBn,
        menuTitleEn: menusTable.titleEn,
        menuSlug: menusTable.slug,
        submenuTitleBn: submenusTable.titleBn,
        submenuTitleEn: submenusTable.titleEn,
        submenuSlug: submenusTable.slug,
      })
      .from(pagesTable)
      .innerJoin(submenusTable, eq(pagesTable.submenuId, submenusTable.id))
      .innerJoin(menusTable, eq(submenusTable.menuId, menusTable.id))
      .where(
        and(
          eq(pagesTable.branchId, branchId),
          eq(menusTable.slug, menuSlug),
          eq(submenusTable.slug, submenuSlug),
          eq(pagesTable.isPublished, true),
        ),
      )
      .limit(1);

    if (!row) {
      return notFound(c, "Page not found");
    }

    return ok(c, "Page fetched successfully", row);
  },
);

export default navRouter;
