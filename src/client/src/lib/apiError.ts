import { HTTPError } from "ky";

/**
 * Extract a human-friendly message from a failed request. ky exposes the
 * pre-parsed error body on `error.data`, which for this API is the
 * `{ success, message, errors }` envelope.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof HTTPError) {
    const data = error.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
