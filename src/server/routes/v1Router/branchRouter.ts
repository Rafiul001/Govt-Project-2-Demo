import db from "@/server/db/client";
import { branchesTable } from "@/server/db/schemas";
import { authMiddleware } from "@/server/middleware/authMiddleware";
import { badRequest, created, notFound, ok } from "@/server/responses";
import {
  deleteImage,
  replaceImage,
  uploadImage,
} from "@/server/service/cloudinary/imageUpload";
import type { TAppEnv } from "@/server/types";
import { pageOffset, paginated } from "@/server/utils/pagination";
import { adminType } from "@/shared/types";
import {
  createBranchSchema,
  previewUrlMatchesName,
  updateBranchSchema,
} from "@/shared/validators/branch.validator";
import { paginationQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { Hono } from "hono";

const branchRouter = new Hono<TAppEnv>();

// Reads are public — the branch directory powers the public landing sites.
// Every mutating route is restricted to super admins via per-route middleware.

/**
 * Whether another branch already uses `previewUrl`. Pass `exceptId` to ignore
 * the branch being updated. The column has a unique constraint; this gives a
 * friendly 400 instead of a constraint-violation 500.
 */
async function previewUrlTaken(
  previewUrl: string,
  exceptId?: number,
): Promise<boolean> {
  const [row] = await db
    .select({ id: branchesTable.id })
    .from(branchesTable)
    .where(
      and(
        eq(branchesTable.previewUrl, previewUrl),
        exceptId != null ? ne(branchesTable.id, exceptId) : undefined,
      ),
    )
    .limit(1);
  return Boolean(row);
}

/** GET /api/v1/branch — list branches (paginated). Public. */
branchRouter.get("/", zValidator("query", paginationQuerySchema), async (c) => {
  const { page, pageSize } = c.req.valid("query");

  const totalResult = await db.select({ value: count() }).from(branchesTable);
  const total = totalResult[0]?.value ?? 0;

  const items = await db
    .select()
    .from(branchesTable)
    .orderBy(desc(branchesTable.id))
    .limit(pageSize)
    .offset(pageOffset(page, pageSize));

  return ok(
    c,
    "Branches fetched successfully",
    paginated(items, total, page, pageSize),
  );
});

/** GET /api/v1/branch/:id */
branchRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const [branch] = await db
    .select()
    .from(branchesTable)
    .where(eq(branchesTable.id, id))
    .limit(1);

  if (!branch) {
    return notFound(c, "Branch not found");
  }

  return ok(c, "Branch fetched successfully", branch);
});

/** POST /api/v1/branch */
branchRouter.post(
  "/",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("form", createBranchSchema),
  async (c) => {
    const data = c.req.valid("form");

    if (await previewUrlTaken(data.previewUrl)) {
      return badRequest(c, "Preview URL is already in use");
    }

    const logo = data.logo ? (await uploadImage(data.logo)).url : null;
    const banner = data.banner ? (await uploadImage(data.banner)).url : null;

    await db.insert(branchesTable).values({
      name: data.name,
      previewUrl: data.previewUrl,
      address: data.address,
      phone: data.phone || null,
      email: data.email || null,
      logo,
      banner,
    });

    return created(c, "Branch created successfully");
  },
);

/** PATCH /api/v1/branch/:id */
branchRouter.patch(
  "/:id",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("param", idParamSchema),
  zValidator("form", updateBranchSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { logo, banner, ...rest } = c.req.valid("form");

    const [branch] = await db
      .select()
      .from(branchesTable)
      .where(eq(branchesTable.id, id))
      .limit(1);

    if (!branch) {
      return notFound(c, "Branch not found");
    }

    if (rest.previewUrl) {
      // A partial update may change only one of name/previewUrl, so re-check the
      // subdomain rule against the effective (possibly stored) name.
      const effectiveName = rest.name ?? branch.name;
      if (!previewUrlMatchesName(rest.previewUrl, effectiveName)) {
        return badRequest(
          c,
          "The branch name must be the preview URL subdomain",
        );
      }
      if (
        rest.previewUrl !== branch.previewUrl &&
        (await previewUrlTaken(rest.previewUrl, id))
      ) {
        return badRequest(c, "Preview URL is already in use");
      }
    }

    const updates = {
      ...rest,
      ...(logo && { logo: (await replaceImage(branch.logo ?? "", logo)).url }),
      ...(banner && {
        banner: (await replaceImage(branch.banner ?? "", banner)).url,
      }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db.update(branchesTable).set(updates).where(eq(branchesTable.id, id));

    return ok(c, "Branch updated successfully");
  },
);

/** DELETE /api/v1/branch/:id */
branchRouter.delete(
  "/:id",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [branch] = await db
      .select()
      .from(branchesTable)
      .where(eq(branchesTable.id, id))
      .limit(1);

    if (!branch) {
      return notFound(c, "Branch not found");
    }

    await db.delete(branchesTable).where(eq(branchesTable.id, id));
    await deleteImage(branch.logo ?? "");
    await deleteImage(branch.banner ?? "");

    return ok(c, "Branch deleted successfully");
  },
);

export default branchRouter;
