import Database from "better-sqlite3";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { APPLICATION_ID, CURRENT_SCHEMA_VERSION, migration001 } from "./schema.js";
import { RECORD_TYPE_BY_KEY } from "@worldloom/shared";

export interface RecordInput {
  recordTypeKey: string;
  title: string;
  body?: string;
  truthLayer?: string | null;
  canonStatus?: string | null;
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
    store.migrate();
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
    store.migrate();
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
    const shortId = this.nextShortId(input.recordTypeKey);
    const result = this.db.prepare(`
      INSERT INTO records (short_id, record_type_key, title, body, truth_layer, canon_status)
      VALUES (@shortId, @recordTypeKey, @title, @body, @truthLayer, @canonStatus)
    `).run({
      shortId,
      recordTypeKey: input.recordTypeKey,
      title: input.title,
      body: input.body ?? "",
      truthLayer: input.truthLayer ?? null,
      canonStatus: input.canonStatus ?? null
    });
    return this.getRecord(Number(result.lastInsertRowid));
  }

  updateRecord(id: number, input: Partial<RecordInput>): RecordRow {
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

  createLink(fromRecordId: number, toRecordId: number, linkTypeKey: string, note = ""): unknown {
    const result = this.db.prepare(`
      INSERT INTO record_links (from_record_id, to_record_id, link_type_key, note)
      VALUES (?, ?, ?, ?)
    `).run(fromRecordId, toRecordId, linkTypeKey, note);
    return this.db.prepare("SELECT * FROM record_links WHERE id = ?").get(result.lastInsertRowid);
  }

  listLinks(recordId?: number): unknown[] {
    if (recordId == null) {
      return this.db.prepare("SELECT * FROM record_links ORDER BY id").all();
    }
    return this.db.prepare(`
      SELECT * FROM record_links
      WHERE from_record_id = ? OR to_record_id = ?
      ORDER BY id
    `).all(recordId, recordId);
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

  private migrate(): void {
    const version = Number(this.db.pragma("user_version", { simple: true }));
    if (version > CURRENT_SCHEMA_VERSION) {
      throw new Error(`World schema ${version} is newer than this app supports (${CURRENT_SCHEMA_VERSION})`);
    }
    if (version < CURRENT_SCHEMA_VERSION && version > 0) {
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

  private assertRecordType(recordTypeKey: string): void {
    if (!RECORD_TYPE_BY_KEY.has(recordTypeKey)) {
      throw new Error(`Unknown record type: ${recordTypeKey}`);
    }
  }

  private backupPath(label: string): string {
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
    return `${this.path}.${label}.${timestamp}.sqlite`;
  }
}
