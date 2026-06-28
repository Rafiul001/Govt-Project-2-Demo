import db from "@/server/db/client";
import { layoutsTable } from "@/server/db/schemas";
import { authMiddleware } from "@/server/middleware/authMiddleware";
import {
  badRequest,
  conflict,
  created,
  forbidden,
  notFound,
  ok,
} from "@/server/responses";
import type { TAppEnv } from "@/server/types";
import {
  branchExists,
  canAccessBranch,
  isSuperAdmin,
  resolveBranchId,
} from "@/server/utils/scope";
import {
  createLayoutSchema,
  updateLayoutSchema,
} from "@/shared/validators/layout.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const layoutRouter = new Hono<TAppEnv>();

// A branch has exactly one layout (unique branchId).
layoutRouter.use(authMiddleware());

/** GET /api/v1/layout — list layouts (branch-scoped for branch admins). */
layoutRouter.get("/", async (c) => {
  const admin = c.get("admin");
  const rows = isSuperAdmin(admin)
    ? await db.select().from(layoutsTable)
    : await db
        .select()
        .from(layoutsTable)
        .where(eq(layoutsTable.branchId, admin.branchId!));
  return ok(c, "Layouts fetched successfully", rows);
});

/** GET /api/v1/layout/:id */
layoutRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
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

  return ok(c, "Layout fetched successfully", layout);
});

/** POST /api/v1/layout */
layoutRouter.post("/", zValidator("json", createLayoutSchema), async (c) => {
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
});

/** PATCH /api/v1/layout/:id */
layoutRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateLayoutSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    if (Object.keys(data).length === 0) {
      return badRequest(c, "No fields to update");
    }

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

    await db
      .update(layoutsTable)
      .set(data)
      .where(eq(layoutsTable.id, id))
      .returning();

    return ok(c, "Layout updated successfully");
  },
);

/** DELETE /api/v1/layout/:id */
layoutRouter.delete("/:id", zValidator("param", idParamSchema), async (c) => {
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
});

export default layoutRouter;
