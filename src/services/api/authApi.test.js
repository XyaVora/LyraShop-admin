import { afterEach, describe, expect, it } from "vitest";
import { restoreSession } from "./authApi.js";
import { api } from "./client.js";

const originalAdapter = api.defaults.adapter;

afterEach(() => {
  api.defaults.adapter = originalAdapter;
});

describe("session restore", () => {
  it("rejects an expired refresh session instead of recursively refreshing forever", async () => {
    const requestedPaths = [];
    api.defaults.adapter = async (config) => {
      requestedPaths.push({
        transport: config.url,
        logical: config._logicalPath
      });

      if (config._logicalPath === "/api/v1/auth/csrf") {
        return {
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config
        };
      }

      return Promise.reject({
        config,
        response: { status: 401 },
        isAxiosError: true
      });
    };

    const result = await Promise.race([
      restoreSession().then(
        () => "resolved",
        () => "rejected"
      ),
      new Promise((resolve) => setTimeout(() => resolve("timed-out"), 200))
    ]);

    expect(result).toBe("rejected");
    expect(requestedPaths).toEqual([
      { transport: "/v1/auth/csrf", logical: "/api/v1/auth/csrf" },
      { transport: "/v1/auth/refresh", logical: "/api/v1/auth/refresh" }
    ]);
  });

  it("shares one refresh flow when startup effects run concurrently", async () => {
    let requestCount = 0;
    const encode = (value) => btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    const accessToken = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
      sub: "11111111-1111-1111-1111-111111111111",
      roles: ["ADMIN"],
      token_use: "access"
    })}.sig`;

    api.defaults.adapter = async (config) => {
      requestCount += 1;
      return {
        data: config._logicalPath.endsWith("/refresh")
          ? { accessToken, tokenType: "Bearer", expiresIn: 900 }
          : {},
        status: 200,
        statusText: "OK",
        headers: {},
        config
      };
    };

    const [first, second] = await Promise.all([
      restoreSession(),
      restoreSession()
    ]);

    expect(first.accessToken).toBe(accessToken);
    expect(second.accessToken).toBe(accessToken);
    expect(requestCount).toBe(2);
  });
});
