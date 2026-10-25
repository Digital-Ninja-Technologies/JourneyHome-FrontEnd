import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "../src";

describe("createApiClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("handles successful JSON response", async () => {
    const mockData = { success: true, message: "OK", data: { id: "123", name: "Test" } };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => JSON.stringify(mockData),
    });

    const client = createApiClient({ baseUrl: "https://api.example.com" });
    const result = await client<typeof mockData>("/users");

    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.example.com/users",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
  });

  it("handles 204 No Content safely", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: async () => "",
    });

    const client = createApiClient({ baseUrl: "https://api.example.com" });
    const result = await client<void>("/items/1", { method: "DELETE" });

    expect(result).toBeUndefined();
  });

  it("parses structured JSON errors and extracts message", async () => {
    const errorBody = { success: false, message: "Invalid email address" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify(errorBody),
    });

    const client = createApiClient({ baseUrl: "https://api.example.com" });

    await expect(client("/auth/login")).rejects.toThrow(ApiError);
    await expect(client("/auth/login")).rejects.toMatchObject({
      message: "Invalid email address",
      status: 400,
      data: errorBody,
    });
  });

  it("handles text/HTML error responses (e.g. 502 Bad Gateway)", async () => {
    const htmlError = "<html><body>502 Bad Gateway</body></html>";
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => htmlError,
    });

    const client = createApiClient({ baseUrl: "https://api.example.com" });

    await expect(client("/service")).rejects.toThrow(ApiError);
    await expect(client("/service")).rejects.toMatchObject({
      message: htmlError,
      status: 502,
      data: htmlError,
    });
  });

  it("catches network failure and throws ApiError", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

    const client = createApiClient({ baseUrl: "https://api.example.com" });

    await expect(client("/plans")).rejects.toThrow(ApiError);
    await expect(client("/plans")).rejects.toMatchObject({
      message: "Failed to fetch",
    });
  });

  it("attaches Authorization header and calls onUnauthorized on 401", async () => {
    const onUnauthorized = vi.fn();
    const getAuthToken = vi.fn().mockReturnValue("jwt-token-123");

    globalThis.fetch = vi.fn().mockImplementation((url, init) => {
      const authHeader = (init.headers as Headers).get("Authorization");
      expect(authHeader).toBe("Bearer jwt-token-123");

      return Promise.resolve({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: "Token expired" }),
      });
    });

    const client = createApiClient({
      baseUrl: "https://api.example.com",
      getAuthToken,
      onUnauthorized,
    });

    await expect(client("/profile")).rejects.toThrow(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(onUnauthorized.mock.calls[0][0]).toBeInstanceOf(ApiError);
    expect(onUnauthorized.mock.calls[0][0].status).toBe(401);
  });

  it("handles timeout abort signal", async () => {
    globalThis.fetch = vi.fn().mockImplementation((_url, init) => {
      if (init.signal) {
        const error = new Error("The operation was aborted due to timeout");
        error.name = "TimeoutError";
        return Promise.reject(error);
      }
      return Promise.resolve({ ok: true, text: async () => "{}" });
    });

    const client = createApiClient({ baseUrl: "https://api.example.com" });

    await expect(
      client("/slow", { signal: AbortSignal.abort("custom-timeout") }),
    ).rejects.toThrow(ApiError);
  });
});
