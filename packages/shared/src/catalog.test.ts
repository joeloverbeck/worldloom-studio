import { describe, expect, it } from "vitest";
import { LINK_TYPES, RECORD_TYPES, VOCABULARY_TERMS } from "./index.js";

describe("shared catalogs", () => {
  it("keeps record namespaces and link keys unique", () => {
    expect(new Set(RECORD_TYPES.map((recordType) => recordType.key)).size).toBe(RECORD_TYPES.length);
    expect(new Set(RECORD_TYPES.map((recordType) => recordType.namespace)).size).toBe(RECORD_TYPES.length);
    expect(new Set(LINK_TYPES.map((linkType) => linkType.key)).size).toBe(LINK_TYPES.length);
  });

  it("seeds the schema-owned vocabulary facets separately", () => {
    expect(VOCABULARY_TERMS).toEqual(expect.arrayContaining([
      expect.objectContaining({ vocabulary: "truth_layer", term: "Objective canon" }),
      expect.objectContaining({ vocabulary: "canon_status", term: "proposed" }),
      expect.objectContaining({ vocabulary: "constraint_tag", term: "branch-bound" }),
      expect.objectContaining({ vocabulary: "repair_operation", term: "add constraint" }),
      expect.objectContaining({ vocabulary: "contradiction_disposition", term: "repair required" }),
      expect.objectContaining({ vocabulary: "preservation_operation", term: "consecrate" }),
      expect.objectContaining({ vocabulary: "retcon_type", term: "hard retcon" }),
      expect.objectContaining({ vocabulary: "protected_effect_type", term: "sacred opacity" })
    ]));
    expect(VOCABULARY_TERMS.filter((term) => term.vocabulary === "repair_operation").map((term) => term.term)).toEqual([
      "clarify scope",
      "add constraint",
      "price the fact",
      "localize",
      "historicize",
      "institutionalize",
      "diffuse unevenly",
      "reinterpret",
      "split",
      "retcon",
      "quarantine",
      "reject"
    ]);
    expect(VOCABULARY_TERMS.filter((term) => term.vocabulary === "canon_status").map((term) => term.term)).toEqual([
      "proposed",
      "under review",
      "accepted",
      "accepted with constraints",
      "localized",
      "contested",
      "quarantined",
      "branch-only",
      "superseded",
      "deprecated",
      "rejected"
    ]);
  });
});
