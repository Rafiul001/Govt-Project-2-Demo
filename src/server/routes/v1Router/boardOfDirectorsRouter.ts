import db from "@/server/db/client";
import { boardOfDirectorsTable } from "@/server/db/schemas";
import { authMiddleware } from "@/server/middleware/authMiddleware";
import { validateJson } from "@/server/middleware/validate";
import {
  badRequest,
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
  createBoardOfDirectorSchema,
  updateBoardOfDirectorSchema,
} from "@/shared/validators/boardOfDirectors.validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const boardOfDirectorsRouter = new Hono<TAppEnv>();

// Every board-of-directors route requires an authenticated admin.
boardOfDirectorsRouter.use(authMiddleware());

/** GET /api/v1/board-of-directors — list (branch-scoped for branch admins). */
boardOfDirectorsRouter.get("/", async (c) => {
  const admin = c.get("admin");
  const rows = isSuperAdmin(admin)
    ? await db.select().from(boardOfDirectorsTable)
    : await db
        .select()
        .from(boardOfDirectorsTable)
        .where(eq(boardOfDirectorsTable.branchId, admin.branchId!));
  return ok(c, "Board of directors fetched successfully", rows);
});

/** GET /api/v1/board-of-directors/:id */
boardOfDirectorsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return badRequest(c, "Invalid board of director id");
  }

  const [member] = await db
    .select()
    .from(boardOfDirectorsTable)
    .where(eq(boardOfDirectorsTable.id, id))
    .limit(1);

  if (!member) {
    return notFound(c, "Board of director not found");
  }
  if (!canAccessBranch(c.get("admin"), member.branchId)) {
    return forbidden(c);
  }

  return ok(c, "Board of director fetched successfully", member);
});

/** POST /api/v1/board-of-directors */
boardOfDirectorsRouter.post(
  "/",
  validateJson(createBoardOfDirectorSchema),
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

    const [member] = await db
      .insert(boardOfDirectorsTable)
      .values({
        name: data.name,
        designation: data.designation,
        avatar: data.avatar ?? "",
        order: data.order,
        branchId,
      })
      .returning();

    return created(c, "Board of director created successfully", member);
  },
);

/** PATCH /api/v1/board-of-directors/:id */
boardOfDirectorsRouter.patch(
  "/:id",
  validateJson(updateBoardOfDirectorSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id)) {
      return badRequest(c, "Invalid board of director id");
    }

    const data = c.req.valid("json");
    if (Object.keys(data).length === 0) {
      return badRequest(c, "No fields to update");
    }

    const [member] = await db
      .select()
      .from(boardOfDirectorsTable)
      .where(eq(boardOfDirectorsTable.id, id))
      .limit(1);

    if (!member) {
      return notFound(c, "Board of director not found");
    }
    if (!canAccessBranch(c.get("admin"), member.branchId)) {
      return forbidden(c);
    }

    const [updated] = await db
      .update(boardOfDirectorsTable)
      .set(data)
      .where(eq(boardOfDirectorsTable.id, id))
      .returning();

    return ok(c, "Board of director updated successfully", updated);
  },
);

/** DELETE /api/v1/board-of-directors/:id */
boardOfDirectorsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return badRequest(c, "Invalid board of director id");
  }

  const [member] = await db
    .select()
    .from(boardOfDirectorsTable)
    .where(eq(boardOfDirectorsTable.id, id))
    .limit(1);

  if (!member) {
    return notFound(c, "Board of director not found");
  }
  if (!canAccessBranch(c.get("admin"), member.branchId)) {
    return forbidden(c);
  }

  await db.delete(boardOfDirectorsTable).where(eq(boardOfDirectorsTable.id, id));
  return ok(c, "Board of director deleted successfully");
});

export default boardOfDirectorsRouter;
