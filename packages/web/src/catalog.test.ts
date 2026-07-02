import { describe, expect, it } from "vitest";
import { RECORD_TYPES } from "@worldloom/shared";

describe("web catalog surface", () => {
  it("has every mutation regime needed by the generic editor", () => {
    expect(RECORD_TYPES.some((recordType) => recordType.mutationRegime === "card")).toBe(true);
    expect(RECORD_TYPES.some((recordType) => recordType.mutationRegime === "report")).toBe(true);
  });
});
