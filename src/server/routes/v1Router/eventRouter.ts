import db from "@/server/db/client";
import { eventsTable } from "@/server/db/schemas";
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
  createEventSchema,
  updateEventSchema,
} from "@/shared/validators/event.validator";
import { eventListQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { and, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { Hono } from "hono";

const eventRouter = new Hono<TAppEnv>();

// Reads are public; mutations require an authenticated admin (per-route
// below). Anonymous visitors only ever see published events (like notices).

/**
 * GET /api/v1/event — list (paginated).
 *
 * - Branch admin (dashboard): pinned to their own branch, drafts included.
 * - Super admin: every branch, optionally filtered by `?branchName=`.
 * - Public (landing site): published only, optionally scoped by `?branchName=`.
 *
 * `?from=`/`?to=` (inclusive `YYYY-MM-DD`) narrow to a date window using
 * OVERLAP semantics — a multi-day event is returned for every month it
 * touches — which backs the calendar view. An unknown branch name yields an
 * empty page.
 */
eventRouter.get(
  "/",
  optionalAuthMiddleware(),
  zValidator("query", eventListQuerySchema),
  async (c) => {
    const admin = c.get("admin") as TTokenPayload | undefined;
    const { page, pageSize, branchName, search, from, to } =
      c.req.valid("query");

    let branchId: number | null | undefined;
    if (admin && !isSuperAdmin(admin)) {
      branchId = admin.branchId!;
    } else if (branchName) {
      branchId = await branchIdByName(branchName);
      if (branchId === null) {
        return ok(
          c,
          "Events fetched successfully",
          paginated([], 0, page, pageSize),
        );
      }
    }

    // An event without `endAt` ends when it starts.
    const effectiveEnd = sql`COALESCE(${eventsTable.endAt}, ${eventsTable.startAt})`;

    const where = and(
      admin ? undefined : eq(eventsTable.isPublished, true),
      branchId != null ? eq(eventsTable.branchId, branchId) : undefined,
      // Overlap: the event starts before the window closes...
      to ? lte(eventsTable.startAt, new Date(`${to}T23:59:59.999`)) : undefined,
      // ...and ends after it opens.
      from ? gte(effectiveEnd, new Date(`${from}T00:00:00`)) : undefined,
      search
        ? or(
            ilike(eventsTable.titleBn, `%${search}%`),
            ilike(eventsTable.titleEn, `%${search}%`),
            ilike(eventsTable.venue, `%${search}%`),
          )
        : undefined,
    );

    const totalResult = await db
      .select({ value: count() })
      .from(eventsTable)
      .where(where);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(eventsTable)
      .where(where)
      .orderBy(desc(eventsTable.startAt), desc(eventsTable.id))
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Events fetched successfully",
      paginated(items, total, page, pageSize),
    );
  },
);

/** GET /api/v1/event/:id — public (unpublished events are hidden). */
eventRouter.get(
  "/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .limit(1);

    if (!event) {
      return notFound(c, "Event not found");
    }
    if (!admin) {
      // Anonymous callers must not learn that an unpublished event exists.
      if (!event.isPublished) {
        return notFound(c, "Event not found");
      }
    } else if (!canAccessBranch(admin, event.branchId)) {
      return forbidden(c);
    }

    return ok(c, "Event fetched successfully", event);
  },
);

/** POST /api/v1/event */
eventRouter.post(
  "/",
  authMiddleware(),
  zValidator("form", createEventSchema),
  async (c) => {
    const admin = c.get("admin");
    const { image, branchId: bodyBranchId, ...data } = c.req.valid("form");

    const branchId = resolveBranchId(admin, bodyBranchId);
    if (branchId === null) {
      return badRequest(c, "branchId is required");
    }
    if (!(await branchExists(branchId))) {
      return notFound(c, "Branch not found");
    }

    const imageUrl = image ? (await uploadImage(image)).url : null;

    await db.insert(eventsTable).values({
      ...data,
      image: imageUrl,
      branchId,
    });

    return created(c, "Event created successfully");
  },
);

/** PATCH /api/v1/event/:id */
eventRouter.patch(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("form", updateEventSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { image, removeImage, branchId, ...rest } = c.req.valid("form");

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .limit(1);

    if (!event) {
      return notFound(c, "Event not found");
    }
    if (!canAccessBranch(admin, event.branchId)) {
      return forbidden(c);
    }

    // The validator can only compare start/end when both are sent; re-check
    // the effective pair against the stored row here.
    const newStartAt = rest.startAt ?? event.startAt;
    const newEndAt = rest.endAt ?? event.endAt;
    if (newEndAt && newEndAt < newStartAt) {
      return badRequest(c, "End time must not be before start time");
    }

    // Only super admins may move the event to another branch.
    const newBranchId = resolveBranchUpdate(admin, branchId);
    if (newBranchId !== undefined && !(await branchExists(newBranchId))) {
      return notFound(c, "Branch not found");
    }

    // The remove flag only applies when no replacement file was uploaded.
    if (!image && removeImage) {
      await deleteImage(event.image ?? "");
    }

    const updates = {
      ...rest,
      ...(newBranchId !== undefined && { branchId: newBranchId }),
      ...(image && {
        image: (await replaceImage(event.image ?? "", image)).url,
      }),
      ...(!image && removeImage && { image: null }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db.update(eventsTable).set(updates).where(eq(eventsTable.id, id));

    return ok(c, "Event updated successfully");
  },
);

/** DELETE /api/v1/event/:id */
eventRouter.delete(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .limit(1);

    if (!event) {
      return notFound(c, "Event not found");
    }
    if (!canAccessBranch(c.get("admin"), event.branchId)) {
      return forbidden(c);
    }

    await db.delete(eventsTable).where(eq(eventsTable.id, id));
    await deleteImage(event.image ?? "");
    return ok(c, "Event deleted successfully");
  },
);

export default eventRouter;
