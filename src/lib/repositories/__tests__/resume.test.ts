import { describe, expect, it } from "vitest";
import { parseResume } from "../resume";

describe("resume parsing", () => {
  it("returns structured resume data", () => {
    const result = parseResume(
      JSON.stringify({
        basics: {
          name: "Ada",
          label: "Bioinformatics Engineer",
        },
      }),
    );

    expect(result.basics?.name).toBe("Ada");
  });

  it("throws for non-object payloads", () => {
    expect(() => parseResume("[]")).toThrow("Resume payload is not a JSON object.");
  });
});
