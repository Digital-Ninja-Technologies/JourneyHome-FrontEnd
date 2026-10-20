export { ApiError } from "@journeyhome/mock-api";
import { ApiError } from "@journeyhome/mock-api";

/** The server doesn't have this endpoint (yet). */
export const isUnsupported = (e: unknown) => e instanceof ApiError && [404, 405, 501].includes(e.status);

export const UNSUPPORTED_MESSAGE = "This isn't available on the server yet.";
