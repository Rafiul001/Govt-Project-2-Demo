import db from "@/server/db/client";
import { adminsTable, type TAdmin } from "@/server/db/schemas";
import { authMiddleware } from "@/server/middleware/authMiddleware";
import {
  conflict,
  created,
  notFound,
  ok,
  unAuthorized,
} from "@/server/responses";
import { uploadImage } from "@/server/service/cloudinary/imageUpload";
import type { TAppEnv } from "@/server/types";
import { generateAccessToken, generateRefreshToken } from "@/server/utils/jwt";
import { pageOffset, paginated } from "@/server/utils/pagination";
import { hashPassword, verifyPassword } from "@/server/utils/password";
import { branchExists } from "@/server/utils/scope";
import { adminType } from "@/shared/types";
import {
  adminLoginSchema,
  createAdminSchema,
} from "@/shared/validators/admin.validator";
import { paginationQuerySchema } from "@/shared/validators/pagination.validator";
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
 * POST /api/v1/admin/logout
 *
 * Authentication is stateless (JWT), so the server holds no session to clear —
 * the client should discard its access/refresh tokens.
 */
adminRouter.post("/logout", authMiddleware(), async (c) => {
  return ok(c, "Logged out successfully");
});

export default adminRouter;
