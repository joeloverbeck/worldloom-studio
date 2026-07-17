import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("source-selection browser policy guard", () => {
  it("wires exactly three consumers while keeping identity, compatibility, binding, and remediation server-owned", () => {
    const mainSource = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const controlSource = readFileSync(new URL("./source-selection-entry.tsx", import.meta.url), "utf8");
    expect(mainSource.match(/<SourceSelectionEntry/g)).toHaveLength(3);
    expect(mainSource.match(/sourceIdentityDiscontinuity\(/g)).toHaveLength(3);
    expect(mainSource.match(/sourceSelectionDraftFromSelection\(/g)).toHaveLength(3);
    expect(mainSource).toContain("/api/temporal/source-selection/resolve");
    expect(mainSource).toContain("/api/constraint-composition/source-selection/resolve");
    expect(mainSource).toContain("/api/institutional/source-selection/resolve");
    expect(mainSource).not.toContain("Source or report id");
    expect(controlSource).not.toMatch(/records\.find|recordTypeKey\s*===|canonStatus\s*===|conditionalPassRouteBindings/);
    expect(controlSource).toContain("selection?.validation.valid === true");
    expect(controlSource).toContain("selection.validation.blocker");
    expect(controlSource).toContain("selection.validation.remediation");
  });
});
