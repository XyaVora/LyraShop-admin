import { describe, expect, it } from "vitest";
import { formatApiError, parseApiError } from "./errors.js";

describe("problem+json mapping", () => {
  it("reads backend problem bodies", () => {
    const problem = parseApiError({
      response: {
        status: 400,
        data: {
          status: 400,
          code: "VALIDATION_FAILED",
          message: "Request validation failed",
          path: "/api/v1/admin/products",
          fieldErrors: { slug: "must not be blank" }
        }
      }
    });
    expect(problem.code).toBe("VALIDATION_FAILED");
    expect(problem.fieldErrors.slug).toBe("must not be blank");
    expect(formatApiError(problem)).toContain("slug: must not be blank");
  });
});
