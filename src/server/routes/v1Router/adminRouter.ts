import db from "@/server/db/client";
import { adminsTable, type TAdmin } from "@/server/db/schemas";
import { authMiddleware } from "@/server/middleware/authMiddleware";
import {
  badRequest,
  conflict,
  created,
  forbidden,
  notFound,
  ok,
  unAuthorized,
} from "@/server/responses";
import {
  deleteImage,
  replaceImage,
  uploadImage,
} from "@/server/service/cloudinary/imageUpload";
import type { TAppEnv } from "@/server/types";
import { generateAccessToken, generateRefreshToken } from "@/server/utils/jwt";
import { pageOffset, paginated } from "@/server/utils/pagination";
import { hashPassword, verifyPassword } from "@/server/utils/password";
import { branchExists } from "@/server/utils/scope";
import { adminType } from "@/shared/types";
import {
  adminLoginSchema,
  createAdminSchema,
  updateAdminSchema,
  updateProfileSchema,
} from "@/shared/validators/admin.validator";
import { paginationQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { count, eq } from "drizzle-orm";
import { Hono } from "hono";

/** Strip the password hash before returning an admin to the client. */
function publicAdmin(admin: TAdmin) {
  const { password: _password, ...rest } = admin;
  return rest;
}

const adminRouter = new Hono<TAppEnv>();

/** POST /api/v1/admin/login */
adminRouter.post("/login", zValidator("json", adminLoginSchema), async (c) => {
  const { username, password } = c.req.valid("json");

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.username, username))
    .limit(1);

  if (!admin || !(await verifyPassword(password, admin.password))) {
    return unAuthorized(c, "Invalid credentials");
  }

  const tokenInput = {
    sub: admin.id,
    adminType: admin.adminType,
    branchId: admin.branchId,
  };
  const accessToken = await generateAccessToken(tokenInput);
  const refreshToken = await generateRefreshToken(tokenInput);

  return ok(c, "Logged in successfully", {
    accessToken,
    refreshToken,
  });
});

/** GET /api/v1/admin — list all admins (super admin only, paginated). */
adminRouter.get(
  "/",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("query", paginationQuerySchema),
  async (c) => {
    const { page, pageSize } = c.req.valid("query");

    const totalResult = await db.select({ value: count() }).from(adminsTable);
    const total = totalResult[0]?.value ?? 0;

    const admins = await db
      .select()
      .from(adminsTable)
      .orderBy(adminsTable.id)
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Admins fetched successfully",
      paginated(admins.map(publicAdmin), total, page, pageSize),
    );
  },
);

/**
 * POST /api/v1/admin — create a new branch admin (super admin only).
 *
 * Only branch admins can be created here; a super admin cannot create another
 * super admin (those are seeded via the bootstrap script).
 */
adminRouter.post(
  "/",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("form", createAdminSchema),
  async (c) => {
    const data = c.req.valid("form");

    const [existing] = await db
      .select({ id: adminsTable.id })
      .from(adminsTable)
      .where(eq(adminsTable.username, data.username))
      .limit(1);

    if (existing) {
      return conflict(c, "Username is already taken");
    }

    if (!(await branchExists(data.branchId))) {
      return notFound(c, "Branch not found");
    }

    const avatar = data.avatar ? (await uploadImage(data.avatar)).url : "";

    await db.insert(adminsTable).values({
      name: data.name,
      username: data.username,
      password: await hashPassword(data.password),
      avatar,
      adminType: adminType.BRANCH_ADMIN,
      branchId: data.branchId,
    });

    return created(c, "Admin created successfully");
  },
);

/**
 * PATCH /api/v1/admin/me — the authenticated admin updates their own account.
 *
 * Limited to password and avatar; an admin can never change their own role or
 * branch here. Registered before `/:id` so "me" is not parsed as an id.
 */
adminRouter.patch(
  "/me",
  authMiddleware(),
  zValidator("form", updateProfileSchema),
  async (c) => {
    const admin = c.get("admin");
    const { avatar, password } = c.req.valid("form");

    const [current] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.id, admin.sub))
      .limit(1);

    if (!current) {
      return notFound(c, "Admin not found");
    }

    const updates = {
      ...(password && { password: await hashPassword(password) }),
      ...(avatar && {
        avatar: (await replaceImage(current.avatar, avatar)).url,
      }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db
      .update(adminsTable)
      .set(updates)
      .where(eq(adminsTable.id, admin.sub));

    return ok(c, "Profile updated successfully");
  },
);

/**
 * PATCH /api/v1/admin/:id — super admin edits a branch admin.
 *
 * Only branch admins can be modified (super admins are seeded, not editable
 * through the panel). `password` is re-hashed only when provided.
 */
adminRouter.patch(
  "/:id",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("param", idParamSchema),
  zValidator("form", updateAdminSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { avatar, password, username, branchId, ...rest } =
      c.req.valid("form");

    const [target] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.id, id))
      .limit(1);

    if (!target) {
      return notFound(c, "Admin not found");
    }
    if (target.adminType !== adminType.BRANCH_ADMIN) {
      return forbidden(c, "Only branch admins can be modified");
    }

    if (username && username !== target.username) {
      const [existing] = await db
        .select({ id: adminsTable.id })
        .from(adminsTable)
        .where(eq(adminsTable.username, username))
        .limit(1);
      if (existing) {
        return conflict(c, "Username is already taken");
      }
    }
    if (branchId !== undefined && !(await branchExists(branchId))) {
      return notFound(c, "Branch not found");
    }

    const updates = {
      ...rest,
      ...(username && { username }),
      ...(branchId !== undefined && { branchId }),
      ...(password && { password: await hashPassword(password) }),
      ...(avatar && {
        avatar: (await replaceImage(target.avatar, avatar)).url,
      }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db.update(adminsTable).set(updates).where(eq(adminsTable.id, id));

    return ok(c, "Admin updated successfully");
  },
);

/** DELETE /api/v1/admin/:id — super admin deletes a branch admin. */
adminRouter.delete(
  "/:id",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [target] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.id, id))
      .limit(1);

    if (!target) {
      return notFound(c, "Admin not found");
    }
    if (target.adminType !== adminType.BRANCH_ADMIN) {
      return forbidden(c, "Only branch admins can be deleted");
    }

    await db.delete(adminsTable).where(eq(adminsTable.id, id));
    await deleteImage(target.avatar);

    return ok(c, "Admin deleted successfully");
  },
);

/**
 * POST /api/v1/admin/logout
 *
 * Authentication is stateless (JWT), so the server holds no session to clear —
 * the client should discard its access/refresh tokens.
 */
adminRouter.post("/logout", authMiddleware(), async (c) => {
  return ok(c, "Logged out successfully");
});

export default adminRouter;
