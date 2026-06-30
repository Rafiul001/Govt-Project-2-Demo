import db from "@/server/db/client";
import { layoutsTable } from "@/server/db/schemas";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "@/server/middleware/authMiddleware";
import {
  badRequest,
  conflict,
  created,
  forbidden,
  notFound,
  ok,
} from "@/server/responses";
import type { TAppEnv } from "@/server/types";
import { pageOffset, paginated } from "@/server/utils/pagination";
import {
  branchExists,
  branchIdByName,
  canAccessBranch,
  isSuperAdmin,
  resolveBranchId,
  resolveBranchUpdate,
} from "@/server/utils/scope";
import type { TTokenPayload } from "@/shared/types";
import {
  createLayoutSchema,
  updateLayoutSchema,
} from "@/shared/validators/layout.validator";
import { branchListQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { count, eq } from "drizzle-orm";
import { Hono } from "hono";

const layoutRouter = new Hono<TAppEnv>();

// A branch has exactly one layout (unique branchId). Reads are public so the
// public landing sites can pick up their per-branch display settings; mutations
// require an authenticated admin (per-route below).

/**
 * GET /api/v1/layout — list layouts (paginated).
 *
 * - Branch admin (dashboard): pinned to their own branch.
 * - Super admin / public: optionally scoped by `?branchName=`.
 *
 * An unknown branch name yields an empty page.
 */
layoutRouter.get(
  "/",
  optionalAuthMiddleware(),
  zValidator("query", branchListQuerySchema),
  async (c) => {
    const admin = c.get("admin") as TTokenPayload | undefined;
    const { page, pageSize, branchName } = c.req.valid("query");

    let branchId: number | null | undefined;
    if (admin && !isSuperAdmin(admin)) {
      branchId = admin.branchId!;
    } else if (branchName) {
      branchId = await branchIdByName(branchName);
      if (branchId === null) {
        return ok(
          c,
          "Layouts fetched successfully",
          paginated([], 0, page, pageSize),
        );
      }
    }

    const where =
      branchId != null ? eq(layoutsTable.branchId, branchId) : undefined;

    const totalResult = await db
      .select({ value: count() })
      .from(layoutsTable)
      .where(where);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(layoutsTable)
      .where(where)
      .orderBy(layoutsTable.id)
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Layouts fetched successfully",
      paginated(items, total, page, pageSize),
    );
  },
);

/** GET /api/v1/layout/:id — public. */
layoutRouter.get(
  "/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [layout] = await db
      .select()
      .from(layoutsTable)
      .where(eq(layoutsTable.id, id))
      .limit(1);

    if (!layout) {
      return notFound(c, "Layout not found");
    }
    if (admin && !canAccessBranch(admin, layout.branchId)) {
      return forbidden(c);
    }

    return ok(c, "Layout fetched successfully", layout);
  },
);

/** POST /api/v1/layout */
layoutRouter.post(
  "/",
  authMiddleware(),
  zValidator("json", createLayoutSchema),
  async (c) => {
    const admin = c.get("admin");
    const data = c.req.valid("json");

    const branchId = resolveBranchId(admin, data.branchId);
    if (branchId === null) {
      return badRequest(c, "branchId is required");
    }
    if (!(await branchExists(branchId))) {
      return notFound(c, "Branch not found");
    }

    const [existing] = await db
      .select({ id: layoutsTable.id })
      .from(layoutsTable)
      .where(eq(layoutsTable.branchId, branchId))
      .limit(1);

    if (existing) {
      return conflict(c, "This branch already has a layout");
    }

    await db.insert(layoutsTable).values({
      showLogo: data.showLogo,
      showBanner: data.showBanner,
      sidebarPosition: data.sidebarPosition,
      branchId,
    });

    return created(c, "Layout created successfully");
  },
);

/** PATCH /api/v1/layout/:id */
layoutRouter.patch(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("json", updateLayoutSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { branchId, ...rest } = c.req.valid("json");

    const [layout] = await db
      .select()
      .from(layoutsTable)
      .where(eq(layoutsTable.id, id))
      .limit(1);

    if (!layout) {
      return notFound(c, "Layout not found");
    }
    if (!canAccessBranch(admin, layout.branchId)) {
      return forbidden(c);
    }

    // Only super admins may move the layout to another branch. A branch has at
    // most one layout, so guard against reassigning onto an occupied branch.
    const newBranchId = resolveBranchUpdate(admin, branchId);
    if (newBranchId !== undefined && newBranchId !== layout.branchId) {
      if (!(await branchExists(newBranchId))) {
        return notFound(c, "Branch not found");
      }
      const [existing] = await db
        .select({ id: layoutsTable.id })
        .from(layoutsTable)
        .where(eq(layoutsTable.branchId, newBranchId))
        .limit(1);
      if (existing) {
        return conflict(c, "This branch already has a layout");
      }
    }

    const updates = {
      ...rest,
      ...(newBranchId !== undefined && { branchId: newBranchId }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db
      .update(layoutsTable)
      .set(updates)
      .where(eq(layoutsTable.id, id))
      .returning();

    return ok(c, "Layout updated successfully");
  },
);

/** DELETE /api/v1/layout/:id */
layoutRouter.delete(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [layout] = await db
      .select()
      .from(layoutsTable)
      .where(eq(layoutsTable.id, id))
      .limit(1);

    if (!layout) {
      return notFound(c, "Layout not found");
    }
    if (!canAccessBranch(c.get("admin"), layout.branchId)) {
      return forbidden(c);
    }

    await db.delete(layoutsTable).where(eq(layoutsTable.id, id));
    return ok(c, "Layout deleted successfully");
  },
);

export default layoutRouter;
