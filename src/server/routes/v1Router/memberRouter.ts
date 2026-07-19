import db from "@/server/db/client";
import {
  branchesTable,
  memberCategoriesTable,
  membersTable,
  type TMember,
} from "@/server/db/schemas";
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
  createMemberSchema,
  updateMemberSchema,
} from "@/shared/validators/member.validator";
import {
  memberListQuerySchema,
  type TMemberListQuery,
} from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { and, eq, ilike, or, count as sqlCount } from "drizzle-orm";
import { Hono } from "hono";

const memberRouter = new Hono<TAppEnv>();

// Reads are public (the landing sites list members per category), but public
// responses are stripped of private fields; mutations require an admin.

/**
 * PRIVACY: fields never exposed to anonymous callers. NID especially must not
 * appear on a public website; contact/address/birth data are admin-only too.
 */
function toPublicMember(member: TMember) {
  const { nid, mobile, email, address, dateOfBirth, ...publicFields } = member;
  return publicFields;
}

/** Checks that a member category with the given id exists. */
async function categoryExists(categoryId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: memberCategoriesTable.id })
    .from(memberCategoriesTable)
    .where(eq(memberCategoriesTable.id, categoryId))
    .limit(1);
  return Boolean(row);
}

/**
 * Resolves the list filters (branch scoping + category + search) into a WHERE
 * clause. Shared by the list route and the CSV export so the exported file
 * always matches exactly what the list shows. `empty: true` means an unknown
 * `branchName`/`categorySlug` was requested — the caller returns an empty
 * result instead of querying.
 */
async function resolveMemberFilter(
  admin: TTokenPayload | undefined,
  query: Omit<TMemberListQuery, "page" | "pageSize">,
): Promise<{ empty: boolean; where?: ReturnType<typeof and> }> {
  const { branchName, search, categoryId, categorySlug } = query;

  let branchId: number | null | undefined;
  if (admin && !isSuperAdmin(admin)) {
    branchId = admin.branchId!;
  } else if (branchName) {
    branchId = await branchIdByName(branchName);
    if (branchId === null) {
      return { empty: true };
    }
  }

  // The dashboard filters by id; the landing sites only know the URL slug.
  let resolvedCategoryId = categoryId;
  if (resolvedCategoryId === undefined && categorySlug) {
    const [category] = await db
      .select({ id: memberCategoriesTable.id })
      .from(memberCategoriesTable)
      .where(eq(memberCategoriesTable.slug, categorySlug))
      .limit(1);
    if (!category) {
      return { empty: true };
    }
    resolvedCategoryId = category.id;
  }

  const where = and(
    branchId != null ? eq(membersTable.branchId, branchId) : undefined,
    resolvedCategoryId !== undefined
      ? eq(membersTable.categoryId, resolvedCategoryId)
      : undefined,
    search
      ? or(
          ilike(membersTable.nameBn, `%${search}%`),
          ilike(membersTable.nameEn, `%${search}%`),
          ilike(membersTable.designation, `%${search}%`),
          ilike(membersTable.mobile, `%${search}%`),
          ilike(membersTable.email, `%${search}%`),
        )
      : undefined,
  );
  return { empty: false, where };
}

/**
 * GET /api/v1/member — list (paginated).
 *
 * - Branch admin (dashboard): pinned to their own branch.
 * - Super admin / public: optionally scoped by `?branchName=`.
 * - Both may filter by `?categoryId=` (dashboard) or `?categorySlug=` (landing).
 *
 * An unknown branch name or category slug yields an empty page. Anonymous
 * responses omit the private profile fields.
 */
memberRouter.get(
  "/",
  optionalAuthMiddleware(),
  zValidator("query", memberListQuerySchema),
  async (c) => {
    const admin = c.get("admin") as TTokenPayload | undefined;
    const { page, pageSize, ...filters } = c.req.valid("query");

    const { empty, where } = await resolveMemberFilter(admin, filters);
    if (empty) {
      return ok(
        c,
        "Members fetched successfully",
        paginated([], 0, page, pageSize),
      );
    }

    const totalResult = await db
      .select({ value: sqlCount() })
      .from(membersTable)
      .where(where);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(membersTable)
      .where(where)
      .orderBy(membersTable.order, membersTable.id)
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Members fetched successfully",
      paginated(admin ? items : items.map(toPublicMember), total, page, pageSize),
    );
  },
);

/** A CSV cell: RFC-4180 quoting (quotes doubled, separators/newlines safe). */
function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * GET /api/v1/member/export/csv — the member list as a CSV download.
 *
 * Admin only. Accepts the same filters as the list route (page/pageSize are
 * ignored — the whole filtered list is exported) so the file matches exactly
 * what the dashboard shows. Prefixed with a UTF-8 BOM so Excel renders the
 * Bengali text correctly.
 *
 * NOTE: registered before `GET /:id` so Hono does not swallow `export` as an id.
 */
memberRouter.get(
  "/export/csv",
  authMiddleware(),
  zValidator("query", memberListQuerySchema),
  async (c) => {
    const admin = c.get("admin");
    const { page: _page, pageSize: _pageSize, ...filters } = c.req.valid("query");

    const { empty, where } = await resolveMemberFilter(admin, filters);
    const items = empty
      ? []
      : await db
          .select()
          .from(membersTable)
          .where(where)
          .orderBy(membersTable.order, membersTable.id);

    // Categories and branches are small tables — resolve names in memory.
    const categories = await db.select().from(memberCategoriesTable);
    const categoryName = new Map(
      categories.map((cat) => [cat.id, cat.nameBn ?? cat.nameEn ?? ""]),
    );
    const branches = await db
      .select({ id: branchesTable.id, name: branchesTable.name })
      .from(branchesTable);
    const branchName = new Map(branches.map((b) => [b.id, b.name]));

    const header = [
      "শ্রেণি",
      "ব্র্যাঞ্চ",
      "নাম (বাংলা)",
      "নাম (English)",
      "পদবি",
      "মোবাইল",
      "ইমেইল",
      "জন্ম তারিখ",
      "রক্তের গ্রুপ",
      "লিঙ্গ",
      "এনআইডি",
      "ঠিকানা",
      "ডিসিপ্লিন",
      "জার্সি নম্বর",
      "যোগদানের তারিখ",
      "অর্জন",
    ];
    const rows = items.map((m) =>
      [
        categoryName.get(m.categoryId) ?? "",
        branchName.get(m.branchId) ?? "",
        m.nameBn,
        m.nameEn,
        m.designation,
        m.mobile,
        m.email,
        m.dateOfBirth,
        m.bloodGroup,
        m.gender,
        m.nid,
        m.address,
        m.discipline,
        m.jerseyNumber,
        m.joiningDate,
        m.achievements,
      ]
        .map(csvCell)
        .join(","),
    );

    // Prefix a UTF-8 BOM: without it Excel misreads the Bengali as Latin-1.
    const csv =
      "\uFEFF" + [header.map(csvCell).join(","), ...rows].join("\r\n");

    return c.body(csv, 200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="members.csv"',
    });
  },
);

/** GET /api/v1/member/:id — public (private fields stripped for anonymous). */
memberRouter.get(
  "/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [member] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.id, id))
      .limit(1);

    if (!member) {
      return notFound(c, "Member not found");
    }
    if (admin && !canAccessBranch(admin, member.branchId)) {
      return forbidden(c);
    }

    return ok(
      c,
      "Member fetched successfully",
      admin ? member : toPublicMember(member),
    );
  },
);

/** POST /api/v1/member */
memberRouter.post(
  "/",
  authMiddleware(),
  zValidator("form", createMemberSchema),
  async (c) => {
    const admin = c.get("admin");
    const { photo, branchId: bodyBranchId, ...data } = c.req.valid("form");

    const branchId = resolveBranchId(admin, bodyBranchId);
    if (branchId === null) {
      return badRequest(c, "branchId is required");
    }
    if (!(await branchExists(branchId))) {
      return notFound(c, "Branch not found");
    }
    if (!(await categoryExists(data.categoryId))) {
      return notFound(c, "Member category not found");
    }

    const photoUrl = photo ? (await uploadImage(photo)).url : null;

    await db.insert(membersTable).values({
      ...data,
      photo: photoUrl,
      branchId,
    });

    return created(c, "Member created successfully");
  },
);

/** PATCH /api/v1/member/:id */
memberRouter.patch(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("form", updateMemberSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { photo, removePhoto, branchId, ...rest } = c.req.valid("form");

    const [member] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.id, id))
      .limit(1);

    if (!member) {
      return notFound(c, "Member not found");
    }
    if (!canAccessBranch(admin, member.branchId)) {
      return forbidden(c);
    }

    // Only super admins may move the member to another branch.
    const newBranchId = resolveBranchUpdate(admin, branchId);
    if (newBranchId !== undefined && !(await branchExists(newBranchId))) {
      return notFound(c, "Branch not found");
    }
    if (
      rest.categoryId !== undefined &&
      !(await categoryExists(rest.categoryId))
    ) {
      return notFound(c, "Member category not found");
    }

    // The remove flag only applies when no replacement file was uploaded.
    if (!photo && removePhoto) {
      await deleteImage(member.photo ?? "");
    }

    const updates = {
      ...rest,
      ...(newBranchId !== undefined && { branchId: newBranchId }),
      ...(photo && {
        photo: (await replaceImage(member.photo ?? "", photo)).url,
      }),
      ...(!photo && removePhoto && { photo: null }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db.update(membersTable).set(updates).where(eq(membersTable.id, id));

    return ok(c, "Member updated successfully");
  },
);

/** DELETE /api/v1/member/:id */
memberRouter.delete(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [member] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.id, id))
      .limit(1);

    if (!member) {
      return notFound(c, "Member not found");
    }
    if (!canAccessBranch(c.get("admin"), member.branchId)) {
      return forbidden(c);
    }

    await db.delete(membersTable).where(eq(membersTable.id, id));
    await deleteImage(member.photo ?? "");
    return ok(c, "Member deleted successfully");
  },
);

export default memberRouter;
