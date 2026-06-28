import db from "@/server/db/client";
import { boardOfDirectorsTable } from "@/server/db/schemas";
import { authMiddleware } from "@/server/middleware/authMiddleware";
import {
  badRequest,
  created,
  forbidden,
  notFound,
  ok,
} from "@/server/responses";
import {
  deleteImage,
  replaceImage,
  uploadImage,
} from "@/server/service/cloudinary/imageUpload";
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
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
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
boardOfDirectorsRouter.get(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

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
  },
);

/** POST /api/v1/board-of-directors */
boardOfDirectorsRouter.post(
  "/",
  zValidator("form", createBoardOfDirectorSchema),
  async (c) => {
    const admin = c.get("admin");
    const data = c.req.valid("form");

    const branchId = resolveBranchId(admin, data.branchId);
    if (branchId === null) {
      return badRequest(c, "branchId is required");
    }
    if (!(await branchExists(branchId))) {
      return notFound(c, "Branch not found");
    }

    const avatar = data.avatar ? (await uploadImage(data.avatar)).url : "";

    await db.insert(boardOfDirectorsTable).values({
      name: data.name,
      designation: data.designation,
      avatar,
      order: data.order,
      branchId,
    });

    return created(c, "Board of director created successfully");
  },
);

/** PATCH /api/v1/board-of-directors/:id */
boardOfDirectorsRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("form", updateBoardOfDirectorSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { avatar, ...rest } = c.req.valid("form");

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

    const updates = {
      ...rest,
      ...(avatar && {
        avatar: (await replaceImage(member.avatar, avatar)).url,
      }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db
      .update(boardOfDirectorsTable)
      .set(updates)
      .where(eq(boardOfDirectorsTable.id, id));

    return ok(c, "Board of director updated successfully");
  },
);

/** DELETE /api/v1/board-of-directors/:id */
boardOfDirectorsRouter.delete(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

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

    await db
      .delete(boardOfDirectorsTable)
      .where(eq(boardOfDirectorsTable.id, id));
    await deleteImage(member.avatar);
    return ok(c, "Board of director deleted successfully");
  },
);

export default boardOfDirectorsRouter;
