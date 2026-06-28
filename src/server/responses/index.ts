import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/** Success envelope: `{ success: true, message, data }`. */
function success<T>(
  c: Context,
  status: ContentfulStatusCode,
  message: string,
  data?: T,
) {
  return c.json({ success: true, message, data: data ?? null }, status);
}

/** Error envelope: `{ success: false, message, errors }`. */
function failure(
  c: Context,
  status: ContentfulStatusCode,
  message: string,
  errors?: unknown,
) {
  return c.json({ success: false, message, errors: errors ?? null }, status);
}

// --- Success responses ---

/** 200 OK. Pass a `data` object to send it in the response. */
export function ok<T>(c: Context, message = "Success", data?: T) {
  return success(c, 200, message, data);
}

/** 201 Created. */
export function created<T>(
  c: Context,
  message = "Created successfully",
  data?: T,
) {
  return success(c, 201, message, data);
}

// --- Error responses ---

/** 400 Bad Request. */
export function badRequest(
  c: Context,
  message = "Bad request",
  errors?: unknown,
) {
  return failure(c, 400, message, errors);
}

/** 401 Unauthorized. */
export function unAuthorized(
  c: Context,
  message = "Unauthorized",
  errors?: unknown,
) {
  return failure(c, 401, message, errors);
}

/** 403 Forbidden. */
export function forbidden(c: Context, message = "Forbidden", errors?: unknown) {
  return failure(c, 403, message, errors);
}

/** 404 Not Found. */
export function notFound(c: Context, message = "Not found", errors?: unknown) {
  return failure(c, 404, message, errors);
}

/** 409 Conflict. */
export function conflict(c: Context, message = "Conflict", errors?: unknown) {
  return failure(c, 409, message, errors);
}

/** 422 Unprocessable Entity (validation failures). */
export function unprocessable(
  c: Context,
  message = "Validation failed",
  errors?: unknown,
) {
  return failure(c, 422, message, errors);
}

/** 500 Internal Server Error. */
export function internalServerError(
  c: Context,
  message = "Internal server error",
  errors?: unknown,
) {
  return failure(c, 500, message, errors);
}
