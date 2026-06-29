import db from "@/server/db/client";
import { noticesTable } from "@/server/db/schemas";
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
import {
  deletePdf,
  replacePdf,
  uploadPdf,
} from "@/server/service/cloudinary/pdfUpload";
import type { TAppEnv } from "@/server/types";
import {
  branchExists,
  canAccessBranch,
  isSuperAdmin,
  resolveBranchId,
} from "@/server/utils/scope";
import { paginated, pageOffset } from "@/server/utils/pagination";
import {
  createNoticeSchema,
  updateNoticeSchema,
} from "@/shared/validators/notice.validator";
import { paginationQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { count, desc, eq } from "drizzle-orm";
import { Hono } from "hono";

const noticeRouter = new Hono<TAppEnv>();

// Every notice route requires an authenticated admin.
noticeRouter.use(authMiddleware());

/** GET /api/v1/notice — list notices (branch-scoped, paginated). */
noticeRouter.get(
  "/",
  zValidator("query", paginationQuerySchema),
  async (c) => {
    const admin = c.get("admin");
    const { page, pageSize } = c.req.valid("query");

    const where = isSuperAdmin(admin)
      ? undefined
      : eq(noticesTable.branchId, admin.branchId!);

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

/** GET /api/v1/notice/:id */
noticeRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
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

  return ok(c, "Notice fetched successfully", notice);
});

/** POST /api/v1/notice */
noticeRouter.post("/", zValidator("form", createNoticeSchema), async (c) => {
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
});

/** PATCH /api/v1/notice/:id */
noticeRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("form", updateNoticeSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { image, file, ...rest } = c.req.valid("form");

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

    const updates = {
      ...rest,
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
noticeRouter.delete("/:id", zValidator("param", idParamSchema), async (c) => {
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
});

export default noticeRouter;
