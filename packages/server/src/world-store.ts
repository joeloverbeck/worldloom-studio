import Database from "better-sqlite3";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { APPLICATION_ID, CURRENT_SCHEMA_VERSION, migration001 } from "./schema.js";
import { LINK_TYPES, RECORD_TYPE_BY_KEY } from "@worldloom/shared";

export interface RecordInput {
  recordTypeKey: string;
  title: string;
  body?: string;
  truthLayer: string;
  canonStatus: string;
}

export interface RecordRow {
  id: number;
  shortId: string;
  recordTypeKey: string;
  title: string;
  body: string;
  truthLayer: string | null;
  canonStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LinkRow {
  id: number;
  fromRecordId: number;
  toRecordId: number;
  linkTypeKey: string;
  note: string;
  createdAt: string;
}

export interface TraversalRow extends LinkRow {
  depth: number;
}

const rowToRecord = (row: Record<string, unknown>): RecordRow => ({
  id: Number(row.id),
  shortId: String(row.short_id),
  recordTypeKey: String(row.record_type_key),
  title: String(row.title),
  body: String(row.body ?? ""),
  truthLayer: row.truth_layer == null ? null : String(row.truth_layer),
  canonStatus: row.canon_status == null ? null : String(row.canon_status),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at)
});

const rowToLink = (row: Record<string, unknown>): LinkRow => ({
  id: Number(row.id),
  fromRecordId: Number(row.from_record_id),
  toRecordId: Number(row.to_record_id),
  linkTypeKey: String(row.link_type_key),
  note: String(row.note ?? ""),
  createdAt: String(row.created_at)
});

const quoteSqlPath = (path: string): string => `'${path.replaceAll("'", "''")}'`;

export class WorldStore {
  readonly db: Database.Database;
  readonly path: string;

  private constructor(path: string, db: Database.Database) {
    this.path = path;
    this.db = db;
  }

  static create(path: string): WorldStore {
    const resolved = resolve(path);
    mkdirSync(dirname(resolved), { recursive: true });
    const db = new Database(resolved);
    const store = new WorldStore(resolved, db);
    store.configureConnection();
    store.migrate({ backupBeforeMigration: false });
    return store;
  }

  static open(path: string): WorldStore {
    if (!existsSync(path)) {
      throw new Error(`World file does not exist: ${path}`);
    }
    const resolved = resolve(path);
    const db = new Database(resolved);
    const store = new WorldStore(resolved, db);
    store.configureConnection();
    store.assertIntegrity();
    store.assertApplicationIdCanOpen();
    store.migrate({ backupBeforeMigration: true });
    return store;
  }

  close(): void {
    this.db.close();
  }

  snapshot(destinationPath?: string): string {
    const destination = destinationPath ? resolve(destinationPath) : this.backupPath("snapshot");
    mkdirSync(dirname(destination), { recursive: true });
    this.db.exec(`VACUUM INTO ${quoteSqlPath(destination)}`);
    return destination;
  }

  integrityCheck(): string {
    return String(this.db.pragma("integrity_check", { simple: true }));
  }

  listRecords(): RecordRow[] {
    return this.db.prepare("SELECT * FROM records ORDER BY updated_at DESC, id DESC").all().map((row) => rowToRecord(row as Record<string, unknown>));
  }

  getRecord(id: number): RecordRow {
    const row = this.db.prepare("SELECT * FROM records WHERE id = ?").get(id);
    if (!row) throw new Error(`Record not found: ${id}`);
    return rowToRecord(row as Record<string, unknown>);
  }

  createRecord(input: RecordInput): RecordRow {
    this.assertRecordType(input.recordTypeKey);
    if (!input.truthLayer || !input.canonStatus) {
      throw new Error("truthLayer and canonStatus are explicit steward choices");
    }
    const shortId = this.nextShortId(input.recordTypeKey);
    const result = this.db.prepare(`
      INSERT INTO records (short_id, record_type_key, title, body, truth_layer, canon_status)
      VALUES (@shortId, @recordTypeKey, @title, @body, @truthLayer, @canonStatus)
    `).run({
      shortId,
      recordTypeKey: input.recordTypeKey,
      title: input.title,
      body: input.body ?? "",
      truthLayer: input.truthLayer,
      canonStatus: input.canonStatus
    });
    return this.getRecord(Number(result.lastInsertRowid));
  }

  updateRecord(id: number, input: Partial<Omit<RecordInput, "recordTypeKey">>): RecordRow {
    const current = this.getRecord(id);
    this.db.prepare(`
      UPDATE records
      SET title = @title,
          body = @body,
          truth_layer = @truthLayer,
          canon_status = @canonStatus
      WHERE id = @id
    `).run({
      id,
      title: input.title ?? current.title,
      body: input.body ?? current.body,
      truthLayer: input.truthLayer === undefined ? current.truthLayer : input.truthLayer,
      canonStatus: input.canonStatus === undefined ? current.canonStatus : input.canonStatus
    });
    return this.getRecord(id);
  }

  promoteRecord(id: number, nextRecordTypeKey: string): RecordRow {
    const current = this.getRecord(id);
    const nextType = this.assertRecordType(nextRecordTypeKey);
    if (nextType.mutationRegime !== "card") {
      throw new Error("promotion target must use the card mutation regime");
    }
    this.db.transaction(() => {
      this.db.prepare("UPDATE records SET record_type_key = ? WHERE id = ?").run(nextRecordTypeKey, id);
      this.db.prepare(`
        INSERT OR IGNORE INTO record_links (from_record_id, to_record_id, link_type_key, note)
        VALUES (?, ?, 'tombstones', ?)
      `).run(id, current.id, `Promotion changed ${current.shortId} from ${current.recordTypeKey} to ${nextRecordTypeKey}`);
    })();
    return this.getRecord(id);
  }

  createLink(fromRecordId: number, toRecordId: number, linkTypeKey: string, note = ""): LinkRow {
    this.assertLinkType(linkTypeKey);
    const result = this.db.prepare(`
      INSERT INTO record_links (from_record_id, to_record_id, link_type_key, note)
      VALUES (?, ?, ?, ?)
    `).run(fromRecordId, toRecordId, linkTypeKey, note);
    return rowToLink(this.db.prepare("SELECT * FROM record_links WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>);
  }

  listLinks(recordId?: number): LinkRow[] {
    if (recordId == null) {
      return this.db.prepare("SELECT * FROM record_links ORDER BY id").all().map((row) => rowToLink(row as Record<string, unknown>));
    }
    return this.db.prepare(`
      SELECT * FROM record_links
      WHERE from_record_id = ? OR to_record_id = ?
      ORDER BY id
    `).all(recordId, recordId).map((row) => rowToLink(row as Record<string, unknown>));
  }

  traverse(recordId: number, linkTypeKey?: string): TraversalRow[] {
    return this.db.prepare(`
      WITH RECURSIVE walk(id, from_record_id, to_record_id, link_type_key, note, created_at, depth) AS (
        SELECT id, from_record_id, to_record_id, link_type_key, note, created_at, 1
        FROM record_links
        WHERE from_record_id = @recordId
          AND (@linkTypeKey IS NULL OR link_type_key = @linkTypeKey)
        UNION ALL
        SELECT rl.id, rl.from_record_id, rl.to_record_id, rl.link_type_key, rl.note, rl.created_at, walk.depth + 1
        FROM record_links rl
        JOIN walk ON rl.from_record_id = walk.to_record_id
        WHERE walk.depth < 32
          AND (@linkTypeKey IS NULL OR rl.link_type_key = @linkTypeKey)
      )
      SELECT * FROM walk ORDER BY depth, id
    `).all({ recordId, linkTypeKey: linkTypeKey ?? null }).map((row) => ({
      ...rowToLink(row as Record<string, unknown>),
      depth: Number((row as Record<string, unknown>).depth)
    }));
  }

  search(query: string): RecordRow[] {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return this.db.prepare(`
      SELECT r.*
      FROM records_fts f
      JOIN records r ON r.id = f.rowid
      WHERE records_fts MATCH ?
      ORDER BY bm25(records_fts, -3.0, -8.0, -1.0), r.updated_at DESC
      LIMIT 50
    `).all(trimmed).map((row) => rowToRecord(row as Record<string, unknown>));
  }

  vocabularies(): unknown[] {
    return this.db.prepare("SELECT * FROM vocabulary_terms ORDER BY vocabulary, term").all();
  }

  history(recordId: number): unknown[] {
    return this.db.prepare("SELECT * FROM record_history WHERE record_id = ? ORDER BY sequence").all(recordId);
  }

  private configureConnection(): void {
    this.db.pragma("foreign_keys = ON");
    this.db.pragma("busy_timeout = 5000");
  }

  private migrate(options: { backupBeforeMigration: boolean }): void {
    const version = Number(this.db.pragma("user_version", { simple: true }));
    if (version > CURRENT_SCHEMA_VERSION) {
      throw new Error(`World schema ${version} is newer than this app supports (${CURRENT_SCHEMA_VERSION})`);
    }
    if (version < CURRENT_SCHEMA_VERSION && options.backupBeforeMigration) {
      this.snapshot(this.backupPath(`pre-migration-v${version}-to-v${CURRENT_SCHEMA_VERSION}`));
    }
    if (version === 0) {
      this.db.exec("BEGIN");
      try {
        this.db.exec(migration001);
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
    }
    this.db.pragma("journal_mode = WAL");
  }

  private assertIntegrity(): void {
    const result = this.db.pragma("integrity_check", { simple: true });
    if (result !== "ok") {
      throw new Error(`SQLite integrity check failed: ${String(result)}`);
    }
  }

  private assertApplicationIdCanOpen(): void {
    const appId = Number(this.db.pragma("application_id", { simple: true }));
    const version = Number(this.db.pragma("user_version", { simple: true }));
    if (version > 0 && appId !== APPLICATION_ID) {
      throw new Error("This is not a Worldloom world file");
    }
  }

  private nextShortId(recordTypeKey: string): string {
    const recordType = RECORD_TYPE_BY_KEY.get(recordTypeKey);
    if (!recordType) throw new Error(`Unknown record type: ${recordTypeKey}`);
    const transaction = this.db.transaction(() => {
      const row = this.db.prepare("SELECT next_value FROM record_type_sequences WHERE record_type_key = ?").get(recordTypeKey) as { next_value: number } | undefined;
      if (!row) throw new Error(`No sequence for record type: ${recordTypeKey}`);
      this.db.prepare("UPDATE record_type_sequences SET next_value = next_value + 1 WHERE record_type_key = ?").run(recordTypeKey);
      return `${recordType.namespace}-${row.next_value}`;
    });
    return transaction();
  }

  private assertRecordType(recordTypeKey: string) {
    const recordType = RECORD_TYPE_BY_KEY.get(recordTypeKey);
    if (!recordType) {
      throw new Error(`Unknown record type: ${recordTypeKey}`);
    }
    return recordType;
  }

  private assertLinkType(linkTypeKey: string): void {
    if (!LINK_TYPES.some((linkType) => linkType.key === linkTypeKey)) {
      throw new Error(`Unknown link type: ${linkTypeKey}`);
    }
  }

  private backupPath(label: string): string {
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
    return `${this.path}.${label}.${timestamp}.sqlite`;
  }
}
