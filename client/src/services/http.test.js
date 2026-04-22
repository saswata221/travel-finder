import { api } from "./http";

describe("api error normalization", () => {
  test("maps server errors to a user-facing message", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ error: "db down" }),
    });

    try {
      await expect(api("/api/demo")).rejects.toMatchObject({
        message: "Server error. Please try again shortly.",
        status: 500,
        serverMessage: "db down",
      });
    } finally {
      global.fetch = originalFetch;
    }
  });
});
