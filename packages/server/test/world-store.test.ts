import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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

const explicitJudgment = {
  truthLayer: "Objective canon",
  canonStatus: "proposed"
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
    expect(store.db.pragma("journal_mode", { simple: true })).toBe("wal");
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM record_types").get()).toMatchObject({ count: 26 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM link_types").get()).toMatchObject({ count: 24 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'canon_status'").get()).toMatchObject({ count: 11 });
    expect(store.db.prepare("SELECT strict FROM pragma_table_list WHERE name = 'records'").get()).toMatchObject({ strict: 1 });

    store.close();
  });

  it("backs up an older world before migrating it and rejects corrupted files plainly", () => {
    const oldPath = tempPath("old.sqlite");
    const oldDb = new Database(oldPath);
    oldDb.pragma(`application_id = ${APPLICATION_ID}`);
    oldDb.exec("CREATE TABLE old_marker (value TEXT) STRICT;");
    oldDb.close();

    const migrated = WorldStore.open(oldPath);
    expect(migrated.db.pragma("user_version", { simple: true })).toBe(1);
    migrated.close();
    expect(readdirSync(join(oldPath, "..")).some((name) => name.includes("pre-migration-v0-to-v1"))).toBe(true);

    const corruptPath = tempPath("corrupt.sqlite");
    writeFileSync(corruptPath, "not sqlite");
    expect(() => WorldStore.open(corruptPath)).toThrow(/database|SQLite|file/i);
  });

  it("writes history for card-regime edits and rejects report-regime edits", () => {
    const path = tempPath("world.sqlite");
    const store = WorldStore.create(path);
    const card = store.createRecord({ recordTypeKey: "canon_fact", title: "Salt remembers", body: "First wording", ...explicitJudgment });
    store.updateRecord(card.id, { body: "Second wording" });

    expect(store.history(card.id)).toMatchObject([{ sequence: 1, retired_body: "First wording" }]);

    const report = store.createRecord({ recordTypeKey: "propagation_report", title: "Shock cone", body: "Audit wording", ...explicitJudgment });
    expect(() => store.updateRecord(report.id, { body: "Changed wording" })).toThrow(/append-only/);

    const secondConnection = new Database(path);
    secondConnection.pragma("foreign_keys = ON");
    expect(() => secondConnection.prepare("UPDATE records SET body = 'Changed' WHERE id = ?").run(report.id)).toThrow(/append-only/);
    expect(() => secondConnection.prepare("DELETE FROM records WHERE id = ?").run(report.id)).toThrow(/append-only/);
    expect(() => secondConnection.prepare("UPDATE records SET actor_id = 2 WHERE id = ?").run(card.id)).toThrow(/provenance/);
    secondConnection.close();
    store.close();
  });

  it("enforces jurisdiction, promotion genealogy, link integrity, traversal, and FTS freshness", () => {
    const store = WorldStore.create(tempPath("world.sqlite"));
    const named = store.createRecord({ recordTypeKey: "canon_fact", title: "Moon bridge", body: "A quiet crossing", ...explicitJudgment });
    const bodyOnly = store.createRecord({ recordTypeKey: "canon_fact", title: "River law", body: "The moon bridge appears in testimony", ...explicitJudgment });
    const ledger = store.createRecord({ recordTypeKey: "admission_ledger_row", title: "Ledger row", body: "Promotion candidate", ...explicitJudgment });

    expect(() => store.createLink(named.id, 999, "depends_on")).toThrow(/FOREIGN KEY/);
    store.createLink(bodyOnly.id, named.id, "depends_on");
    store.createLink(ledger.id, bodyOnly.id, "depends_on");

    expect(store.search("moon")).toMatchObject([{ id: named.id }, { id: bodyOnly.id }]);
    store.updateRecord(named.id, { title: "Star bridge", body: "A bright crossing" });
    expect(store.search("moon")).toMatchObject([{ id: bodyOnly.id }]);
    expect(store.search("star")).toMatchObject([{ id: named.id }]);

    expect(store.traverse(ledger.id, "depends_on")).toMatchObject([
      { fromRecordId: ledger.id, toRecordId: bodyOnly.id, depth: 1 },
      { fromRecordId: bodyOnly.id, toRecordId: named.id, depth: 2 }
    ]);

    const promoted = store.promoteRecord(ledger.id, "canon_fact");
    expect(promoted.id).toBe(ledger.id);
    expect(promoted.recordTypeKey).toBe("canon_fact");
    expect(store.listLinks(ledger.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: ledger.id, toRecordId: ledger.id, linkTypeKey: "tombstones" })
    ]));

    expect(() => store.db.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, repair_operation)
      VALUES (?, 'admission', 'retcon')
    `).run(named.id)).toThrow(/CHECK/);
    expect(() => store.db.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, admission_decision_operation)
      VALUES (?, 'repair', 'accept')
    `).run(named.id)).toThrow(/CHECK/);
    expect(store.db.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, admission_decision_operation)
      VALUES (?, 'admission', 'accept')
    `).run(named.id).changes).toBe(1);

    const ftsSql = store.db.prepare("SELECT sql FROM sqlite_schema WHERE name = 'records_fts'").get() as { sql: string };
    expect(ftsSql.sql).toContain("content='records'");
    store.close();
  });

  it("snapshots a live world to a chosen path as a valid complete world file", () => {
    const path = tempPath("world.sqlite");
    const snapshotPath = tempPath("snapshot.sqlite");
    const store = WorldStore.create(path);
    const record = store.createRecord({ recordTypeKey: "canon_fact", title: "Live backup", body: "Copy this", ...explicitJudgment });
    const written = store.snapshot(snapshotPath);
    store.updateRecord(record.id, { body: "Changed after snapshot" });
    expect(written).toBe(snapshotPath);
    expect(existsSync(snapshotPath)).toBe(true);

    const snapshot = WorldStore.open(snapshotPath);
    expect(snapshot.integrityCheck()).toBe("ok");
    expect(snapshot.getRecord(record.id)).toMatchObject({ title: "Live backup", body: "Copy this" });
    snapshot.close();
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
