export class ApiError extends Error {
  public status?: number;
  // biome-ignore lint/suspicious/noExplicitAny: Error payload shape varies
  public data?: any;

  // biome-ignore lint/suspicious/noExplicitAny: Error payload shape varies
  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
