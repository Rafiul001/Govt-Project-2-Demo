import db from "@/server/db/client";
import { boardOfDirectorsTable } from "@/server/db/schemas";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "@/server/middleware/authMiddleware";
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
  createBoardOfDirectorSchema,
  updateBoardOfDirectorSchema,
} from "@/shared/validators/boardOfDirectors.validator";
import { branchListQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { Hono } from "hono";

const boardOfDirectorsRouter = new Hono<TAppEnv>();

// Reads are public; mutations require an authenticated admin (per-route below).

/**
 * GET /api/v1/board-of-directors — list (paginated).
 *
 * - Branch admin (dashboard): pinned to their own branch.
 * - Super admin / public: optionally scoped by `?branchName=`.
 *
 * An unknown branch name yields an empty page.
 */
boardOfDirectorsRouter.get(
  "/",
  optionalAuthMiddleware(),
  zValidator("query", branchListQuerySchema),
  async (c) => {
    const admin = c.get("admin") as TTokenPayload | undefined;
    const { page, pageSize, branchName, search } = c.req.valid("query");

    let branchId: number | null | undefined;
    if (admin && !isSuperAdmin(admin)) {
      branchId = admin.branchId!;
    } else if (branchName) {
      branchId = await branchIdByName(branchName);
      if (branchId === null) {
        return ok(
          c,
          "Board of directors fetched successfully",
          paginated([], 0, page, pageSize),
        );
      }
    }

    const where = and(
      branchId != null
        ? eq(boardOfDirectorsTable.branchId, branchId)
        : undefined,
      search
        ? or(
            ilike(boardOfDirectorsTable.name, `%${search}%`),
            ilike(boardOfDirectorsTable.designation, `%${search}%`),
          )
        : undefined,
    );

    const totalResult = await db
      .select({ value: count() })
      .from(boardOfDirectorsTable)
      .where(where);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(boardOfDirectorsTable)
      .where(where)
      .orderBy(boardOfDirectorsTable.order, boardOfDirectorsTable.id)
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Board of directors fetched successfully",
      paginated(items, total, page, pageSize),
    );
  },
);

/** GET /api/v1/board-of-directors/:id — public. */
boardOfDirectorsRouter.get(
  "/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [member] = await db
      .select()
      .from(boardOfDirectorsTable)
      .where(eq(boardOfDirectorsTable.id, id))
      .limit(1);

    if (!member) {
      return notFound(c, "Board of director not found");
    }
    if (admin && !canAccessBranch(admin, member.branchId)) {
      return forbidden(c);
    }

    return ok(c, "Board of director fetched successfully", member);
  },
);

/** POST /api/v1/board-of-directors */
boardOfDirectorsRouter.post(
  "/",
  authMiddleware(),
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
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("form", updateBoardOfDirectorSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { avatar, removeAvatar, branchId, ...rest } = c.req.valid("form");

    const [member] = await db
      .select()
      .from(boardOfDirectorsTable)
      .where(eq(boardOfDirectorsTable.id, id))
      .limit(1);

    if (!member) {
      return notFound(c, "Board of director not found");
    }
    if (!canAccessBranch(admin, member.branchId)) {
      return forbidden(c);
    }

    // Only super admins may move the member to another branch.
    const newBranchId = resolveBranchUpdate(admin, branchId);
    if (newBranchId !== undefined && !(await branchExists(newBranchId))) {
      return notFound(c, "Branch not found");
    }

    // The remove flag only applies when no replacement file was uploaded.
    // `avatar` is a NOT NULL column, so removal stores an empty string.
    if (!avatar && removeAvatar) {
      await deleteImage(member.avatar);
    }

    const updates = {
      ...rest,
      ...(newBranchId !== undefined && { branchId: newBranchId }),
      ...(avatar && {
        avatar: (await replaceImage(member.avatar, avatar)).url,
      }),
      ...(!avatar && removeAvatar && { avatar: "" }),
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
  authMiddleware(),
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
