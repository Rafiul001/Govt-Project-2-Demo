import db from "@/server/db/client";
import { noticesTable } from "@/server/db/schemas";
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
import {
  deletePdf,
  replacePdf,
  uploadPdf,
} from "@/server/service/cloudinary/pdfUpload";
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
  createNoticeSchema,
  updateNoticeSchema,
} from "@/shared/validators/notice.validator";
import { branchListQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { Hono } from "hono";

const noticeRouter = new Hono<TAppEnv>();

// Reads are public; mutations require an authenticated admin (per-route below).

/**
 * GET /api/v1/notice — list notices (paginated).
 *
 * - Branch admin (dashboard): pinned to their own branch, drafts included.
 * - Super admin: every branch, optionally filtered by `?branchName=`.
 * - Public (landing site): published only, optionally scoped by `?branchName=`.
 *
 * An unknown branch name yields an empty page.
 */
noticeRouter.get(
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
          "Notices fetched successfully",
          paginated([], 0, page, pageSize),
        );
      }
    }

    // Anonymous visitors only ever see published notices.
    const where = and(
      admin ? undefined : eq(noticesTable.isPublished, true),
      branchId != null ? eq(noticesTable.branchId, branchId) : undefined,
      search
        ? or(
            ilike(noticesTable.title, `%${search}%`),
            ilike(noticesTable.description, `%${search}%`),
          )
        : undefined,
    );

    const totalResult = await db
      .select({ value: count() })
      .from(noticesTable)
      .where(where);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(noticesTable)
      .where(where)
      .orderBy(desc(noticesTable.id))
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Notices fetched successfully",
      paginated(items, total, page, pageSize),
    );
  },
);

/** GET /api/v1/notice/:id — public (unpublished notices are hidden). */
noticeRouter.get(
  "/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [notice] = await db
      .select()
      .from(noticesTable)
      .where(eq(noticesTable.id, id))
      .limit(1);

    if (!notice) {
      return notFound(c, "Notice not found");
    }
    if (!admin) {
      // Anonymous callers must not learn that an unpublished notice exists.
      if (!notice.isPublished) {
        return notFound(c, "Notice not found");
      }
    } else if (!canAccessBranch(admin, notice.branchId)) {
      return forbidden(c);
    }

    return ok(c, "Notice fetched successfully", notice);
  },
);

/** POST /api/v1/notice */
noticeRouter.post(
  "/",
  authMiddleware(),
  zValidator("form", createNoticeSchema),
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

    const image = data.image ? (await uploadImage(data.image)).url : null;
    const fileUrl = data.file ? (await uploadPdf(data.file)).url : null;

    await db.insert(noticesTable).values({
      title: data.title,
      description: data.description,
      fileUrl,
      image,
      isPublished: data.isPublished,
      branchId,
    });

    return created(c, "Notice created successfully");
  },
);

/** PATCH /api/v1/notice/:id */
noticeRouter.patch(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("form", updateNoticeSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { image, file, branchId, ...rest } = c.req.valid("form");

    const [notice] = await db
      .select()
      .from(noticesTable)
      .where(eq(noticesTable.id, id))
      .limit(1);

    if (!notice) {
      return notFound(c, "Notice not found");
    }
    if (!canAccessBranch(admin, notice.branchId)) {
      return forbidden(c);
    }

    // Only super admins may move the notice to another branch.
    const newBranchId = resolveBranchUpdate(admin, branchId);
    if (newBranchId !== undefined && !(await branchExists(newBranchId))) {
      return notFound(c, "Branch not found");
    }

    const updates = {
      ...rest,
      ...(newBranchId !== undefined && { branchId: newBranchId }),
      ...(image && {
        image: (await replaceImage(notice.image ?? "", image)).url,
      }),
      ...(file && {
        fileUrl: (await replacePdf(notice.fileUrl ?? "", file)).url,
      }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db
      .update(noticesTable)
      .set(updates)
      .where(eq(noticesTable.id, id))
      .returning();

    return ok(c, "Notice updated successfully");
  },
);

/** DELETE /api/v1/notice/:id */
noticeRouter.delete(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

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
    await deleteImage(notice.image ?? "");
    await deletePdf(notice.fileUrl ?? "");
    return ok(c, "Notice deleted successfully");
  },
);

export default noticeRouter;
