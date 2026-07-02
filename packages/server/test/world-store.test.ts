import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { APPLICATION_ID } from "../src/schema.js";
import { WorldStore } from "../src/world-store.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-store-"));
  tempDirs.push(dir);
  return join(dir, name);
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("WorldStore", () => {
  it("creates a world file with application id, schema version, and seeded catalogs", () => {
    const path = tempPath("world.sqlite");
    const store = WorldStore.create(path);

    expect(store.db.pragma("application_id", { simple: true })).toBe(APPLICATION_ID);
    expect(store.db.pragma("user_version", { simple: true })).toBe(1);
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM record_types").get()).toMatchObject({ count: 26 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM link_types").get()).toMatchObject({ count: 24 });

    store.close();
  });

  it("writes history for card-regime edits and rejects report-regime edits", () => {
    const store = WorldStore.create(tempPath("world.sqlite"));
    const card = store.createRecord({ recordTypeKey: "canon_fact", title: "Salt remembers", body: "First wording" });
    store.updateRecord(card.id, { body: "Second wording" });

    expect(store.history(card.id)).toMatchObject([{ sequence: 1, retired_body: "First wording" }]);

    const report = store.createRecord({ recordTypeKey: "propagation_report", title: "Shock cone", body: "Audit wording" });
    expect(() => store.updateRecord(report.id, { body: "Changed wording" })).toThrow(/append-only/);

    store.close();
  });

  it("enforces record-link referential integrity and searches titles before body prose", () => {
    const store = WorldStore.create(tempPath("world.sqlite"));
    const named = store.createRecord({ recordTypeKey: "canon_fact", title: "Moon bridge", body: "A quiet crossing" });
    const bodyOnly = store.createRecord({ recordTypeKey: "canon_fact", title: "River law", body: "The moon bridge appears in testimony" });

    expect(() => store.createLink(named.id, 999, "depends_on")).toThrow(/FOREIGN KEY/);
    store.createLink(bodyOnly.id, named.id, "depends_on");

    expect(store.search("moon")).toMatchObject([{ id: named.id }, { id: bodyOnly.id }]);
    store.close();
  });

  it("rejects files with the wrong application id", () => {
    const path = tempPath("wrong.sqlite");
    const db = new Database(path);
    db.pragma("application_id = 1234");
    db.pragma("user_version = 1");
    db.close();

    expect(() => WorldStore.open(path)).toThrow(/not a Worldloom/);
  });
});
