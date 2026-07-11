import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { propagationRelatedWorldContext } from "../src/propagation-prompt-context.js";
import { WorldFile } from "../src/world-file.js";

let tempDirs: string[] = [];

const createWorld = () => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-propagation-context-"));
  tempDirs.push(dir);
  return WorldFile.create(join(dir, "world.sqlite"));
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Propagation related-world prompt context", () => {
  it("is deterministic, bounded, non-recursive, standing-aware, and read-only", () => {
    const world = createWorld();
    const kernel = world.createRecord({ recordTypeKey: "world_kernel", title: "Moon kernel", body: "Premise and tone. " + "🌙".repeat(2_200), truthLayer: "Objective canon", canonStatus: "accepted" });
    const source = world.createRecord({ recordTypeKey: "canon_fact", title: "Moon oath", body: "One oath fails monthly.", truthLayer: "Objective canon", canonStatus: "accepted" });
    world.createLink(source.id, kernel.id, "derived_from", "Immediate kernel origin");
    const direct = world.createRecord({ recordTypeKey: "canon_fact", title: "Direct registry", body: "Registry support.", truthLayer: "Objective canon", canonStatus: "accepted" });
    world.createLink(source.id, direct.id, "depends_on", "Direct dependency");
    const sibling = world.createRecord({ recordTypeKey: "canon_fact", title: "Proposed hospice", body: "Dependency-bearing proposal.", truthLayer: "disputed claim", canonStatus: "proposed" });
    world.createLink(sibling.id, kernel.id, "derived_from", "Shared origin");
    const secondHop = world.createRecord({ recordTypeKey: "institution", title: "Roof guild", body: "Only linked through the registry.", truthLayer: "Objective canon", canonStatus: "accepted" });
    world.createLink(direct.id, secondHop.id, "depends_on", "Second hop");

    const before = {
      records: world.listRecords(),
      links: world.listLinks(),
      changes: world.db.totalChanges
    };
    const first = propagationRelatedWorldContext(world, source.id, "pressure");
    const second = propagationRelatedWorldContext(world, source.id, "pressure");

    expect(second).toEqual(first);
    expect(first.usedCharacters).toBeLessThanOrEqual(12_000);
    expect(first.selectedRecords).toEqual(expect.arrayContaining([
      expect.objectContaining({ stableIdentity: kernel.shortId, relationship: "active world kernel", nonCanon: false }),
      expect.objectContaining({ stableIdentity: direct.shortId, relationship: "direct depends_on", nonCanon: false }),
      expect.objectContaining({ stableIdentity: sibling.shortId, relationship: `shared origin ${kernel.shortId}`, nonCanon: true })
    ]));
    expect(first.sourceDocuments.find((document) => document.source === `related_world:${kernel.shortId}`)?.content).toContain("truncated at 2000 Unicode characters");
    expect(first.omissions).toContain(`${secondHop.shortId} ${secondHop.title}: outside the bounded relationship shapes (second hop)`);
    expect({ records: world.listRecords(), links: world.listLinks(), changes: world.db.totalChanges }).toEqual(before);
    expect(propagationRelatedWorldContext(world, source.id, "proposal")).toMatchObject({ selectedRecords: [], usedCharacters: 0, omissions: [] });
    world.close();
  });

  it("returns an actionable omission when no active kernel exists", () => {
    const world = createWorld();
    const source = world.createRecord({ recordTypeKey: "canon_fact", title: "Kernel-less fact", body: "A fact without its world kernel.", truthLayer: "Objective canon", canonStatus: "accepted" });

    expect(propagationRelatedWorldContext(world, source.id, "pressure")).toMatchObject({
      completeness: {
        status: "incomplete",
        failures: ["World kernel (not found): unavailable content; create or open the active world kernel before treating Pressure as context-complete."]
      },
      omissions: ["World kernel (not found): unavailable content; create or open the active world kernel before treating Pressure as context-complete."]
    });
    world.close();
  });

  it("prioritizes shared-origin current canon before direct proposed context", () => {
    const world = createWorld();
    const kernel = world.createRecord({ recordTypeKey: "world_kernel", title: "Kernel", body: "Premise: an oath fails monthly.", truthLayer: "Objective canon", canonStatus: "accepted" });
    const source = world.createRecord({ recordTypeKey: "canon_fact", title: "Oath", body: "One oath fails.", truthLayer: "Objective canon", canonStatus: "accepted" });
    world.createLink(source.id, kernel.id, "derived_from", "Kernel origin");
    const directProposed = world.createRecord({ recordTypeKey: "canon_fact", title: "Proposed registry", body: "A proposed registry.", truthLayer: "Objective canon", canonStatus: "proposed" });
    world.createLink(source.id, directProposed.id, "depends_on", "Direct but non-canon");
    const sharedAccepted = world.createRecord({ recordTypeKey: "canon_fact", title: "Accepted calendar", body: "An accepted calendar.", truthLayer: "Objective canon", canonStatus: "accepted" });
    world.createLink(sharedAccepted.id, kernel.id, "derived_from", "Shared current canon");

    expect(propagationRelatedWorldContext(world, source.id, "pressure").selectedRecords.map((record) => record.stableIdentity)).toEqual([
      kernel.shortId,
      sharedAccepted.shortId,
      directProposed.shortId
    ]);
    world.close();
  });
});
