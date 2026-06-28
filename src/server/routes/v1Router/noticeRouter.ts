import db from "@/server/db/client";
import { noticesTable } from "@/server/db/schemas";
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
  createNoticeSchema,
  updateNoticeSchema,
} from "@/shared/validators/notice.validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const noticeRouter = new Hono<TAppEnv>();

// Every notice route requires an authenticated admin.
noticeRouter.use(authMiddleware());

/** GET /api/v1/notice — list notices (branch-scoped for branch admins). */
noticeRouter.get("/", async (c) => {
  const admin = c.get("admin");
  const rows = isSuperAdmin(admin)
    ? await db.select().from(noticesTable)
    : await db
        .select()
        .from(noticesTable)
        .where(eq(noticesTable.branchId, admin.branchId!));
  return ok(c, "Notices fetched successfully", rows);
});

/** GET /api/v1/notice/:id */
noticeRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return badRequest(c, "Invalid notice id");
  }

  const [notice] = await db
    .select()
    .from(noticesTable)
    .where(eq(noticesTable.id, id))
    .limit(1);

  if (!notice) {
    return notFound(c, "Notice not found");
  }
  if (!canAccessBranch(c.get("admin"), notice.branchId)) {
    return forbidden(c);
  }

  return ok(c, "Notice fetched successfully", notice);
});

/** POST /api/v1/notice */
noticeRouter.post("/", validateJson(createNoticeSchema), async (c) => {
  const admin = c.get("admin");
  const data = c.req.valid("json");

  const branchId = resolveBranchId(admin, data.branchId);
  if (branchId === null) {
    return badRequest(c, "branchId is required");
  }
  if (!(await branchExists(branchId))) {
    return notFound(c, "Branch not found");
  }

  const [notice] = await db
    .insert(noticesTable)
    .values({
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl,
      image: data.image,
      isPublished: data.isPublished,
      branchId,
    })
    .returning();

  return created(c, "Notice created successfully", notice);
});

/** PATCH /api/v1/notice/:id */
noticeRouter.patch("/:id", validateJson(updateNoticeSchema), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return badRequest(c, "Invalid notice id");
  }

  const data = c.req.valid("json");
  if (Object.keys(data).length === 0) {
    return badRequest(c, "No fields to update");
  }

  const [notice] = await db
    .select()
    .from(noticesTable)
    .where(eq(noticesTable.id, id))
    .limit(1);

  if (!notice) {
    return notFound(c, "Notice not found");
  }
  if (!canAccessBranch(c.get("admin"), notice.branchId)) {
    return forbidden(c);
  }

  const [updated] = await db
    .update(noticesTable)
    .set(data)
    .where(eq(noticesTable.id, id))
    .returning();

  return ok(c, "Notice updated successfully", updated);
});

/** DELETE /api/v1/notice/:id */
noticeRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return badRequest(c, "Invalid notice id");
  }

  const [notice] = await db
    .select()
    .from(noticesTable)
    .where(eq(noticesTable.id, id))
    .limit(1);

  if (!notice) {
    return notFound(c, "Notice not found");
  }
  if (!canAccessBranch(c.get("admin"), notice.branchId)) {
    return forbidden(c);
  }

  await db.delete(noticesTable).where(eq(noticesTable.id, id));
  return ok(c, "Notice deleted successfully");
});

export default noticeRouter;
