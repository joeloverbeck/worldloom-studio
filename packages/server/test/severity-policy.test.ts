import { describe, expect, it } from "vitest";
import {
  admissionGatePolicy,
  admissionQueueSortKey,
  propagationCoveragePolicy,
  requiresSkipReason,
  warnsForOpenCanonDebt,
  type DeclaredSeverity
} from "../src/severity-policy.js";

const severity = (admissionLevel: string | null, workScale: string | null): DeclaredSeverity => ({ admissionLevel, workScale });

describe("severity policy", () => {
  it("produces admission queue sort keys from declared severity only", () => {
    expect(admissionQueueSortKey(severity("5", "catastrophic"))).toEqual({ workScaleRank: 1, admissionLevelRank: 5 });
    expect(admissionQueueSortKey(severity("2", "moderate"))).toEqual({ workScaleRank: 4, admissionLevelRank: 2 });
    expect(admissionQueueSortKey(severity(null, null))).toEqual({ workScaleRank: 6, admissionLevelRank: -1 });
  });

  it("maps declared severity to the existing admission gate paths and steps", () => {
    expect(admissionGatePolicy(severity(null, null))).toMatchObject({
      path: "minor_ledger",
      doctrine: [
        "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
        "docs/worldbuilding-system/templates/admission_ledger.md"
      ],
      steps: ["fact statement", "scope", "truth layer", "canon status", "constraint tags", "admission operations", "one consequence check"]
    });

    expect(admissionGatePolicy(severity("3", "minor"))).toMatchObject({
      path: "full_gate",
      steps: expect.arrayContaining(["shock-cone summary"])
    });
    expect(admissionGatePolicy(severity("4", "minor")).steps).toEqual(expect.arrayContaining(["temporal/spatial passes", "QA follow-up"]));
    expect(admissionGatePolicy(severity("1", "catastrophic")).steps).toEqual(expect.arrayContaining(["explicit decision record", "rollback/branch plan"]));
  });

  it("keeps skip reasons and canon debt warnings on the current thresholds", () => {
    expect(requiresSkipReason(severity("2", "moderate"))).toBe(false);
    expect(requiresSkipReason(severity("3", "minor"))).toBe(true);
    expect(requiresSkipReason(severity("1", "major"))).toBe(true);

    expect(warnsForOpenCanonDebt(severity("3", "major"))).toBe(false);
    expect(warnsForOpenCanonDebt(severity("4", "major"))).toBe(true);
    expect(warnsForOpenCanonDebt(severity("1", "severe"))).toBe(true);
  });

  it("maps declared severity to the current propagation coverage levels", () => {
    expect(propagationCoveragePolicy(severity("2", "moderate"))).toEqual({
      requiredCoverage: "immediate effects and one ordinary-life residue when relevant",
      requiredDomainCount: 1
    });
    expect(propagationCoveragePolicy(severity("3", "minor"))).toEqual({
      requiredCoverage: "multiple orders and direct/dependency/reaction domains",
      requiredDomainCount: 3
    });
    expect(propagationCoveragePolicy(severity("4", "minor"))).toEqual({
      requiredCoverage: "full domain-atlas sweep",
      requiredDomainCount: "all"
    });
  });
});
