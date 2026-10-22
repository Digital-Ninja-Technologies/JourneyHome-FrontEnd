export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** The server doesn't have this endpoint (yet). */
export const isUnsupported = (e: unknown) =>
  e instanceof ApiError && [404, 405, 501].includes(e.status);

export const UNSUPPORTED_MESSAGE = "The server doesn't provide this yet.";
