import { LINK_TYPES, RECORD_TYPES, VOCABULARY_TERMS } from "@worldloom/shared";

export const APPLICATION_ID = 0x574c4f4d;
export const CURRENT_SCHEMA_VERSION = 1;

const sqlString = (value: string): string => `'${value.replaceAll("'", "''")}'`;

export const migration001 = `
PRAGMA application_id = ${APPLICATION_ID};
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS world_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
) STRICT;

INSERT OR REPLACE INTO world_metadata (key, value) VALUES
  ('schema_name', 'worldloom'),
  ('schema_version', '1');

CREATE TABLE IF NOT EXISTS actors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'steward',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

INSERT OR IGNORE INTO actors (id, name, role) VALUES (1, 'steward', 'steward');

CREATE TABLE IF NOT EXISTS continuity_scopes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT ''
) STRICT;

INSERT OR IGNORE INTO continuity_scopes (id, name, description)
VALUES (1, 'main continuity', 'Default v1 continuity scope');

CREATE TABLE IF NOT EXISTS record_types (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  namespace TEXT NOT NULL UNIQUE,
  mutation_regime TEXT NOT NULL CHECK (mutation_regime IN ('card', 'report')),
  package_source TEXT NOT NULL,
  untested_surface INTEGER NOT NULL DEFAULT 0 CHECK (untested_surface IN (0, 1))
) STRICT;

${RECORD_TYPES.map((recordType) => `INSERT OR IGNORE INTO record_types (key, label, namespace, mutation_regime, package_source, untested_surface) VALUES (${sqlString(recordType.key)}, ${sqlString(recordType.label)}, ${sqlString(recordType.namespace)}, ${sqlString(recordType.mutationRegime)}, ${sqlString(recordType.packageSource)}, ${recordType.untestedSurface ? 1 : 0});`).join("\n")}

CREATE TABLE IF NOT EXISTS record_type_sequences (
  record_type_key TEXT PRIMARY KEY REFERENCES record_types(key) ON DELETE CASCADE,
  next_value INTEGER NOT NULL CHECK (next_value > 0)
) STRICT;

${RECORD_TYPES.map((recordType) => `INSERT OR IGNORE INTO record_type_sequences (record_type_key, next_value) VALUES (${sqlString(recordType.key)}, 1);`).join("\n")}

CREATE TABLE IF NOT EXISTS vocabularies (
  name TEXT PRIMARY KEY
) STRICT;

${[...new Set(VOCABULARY_TERMS.map((term) => term.vocabulary))]
  .map((vocabulary) => `INSERT OR IGNORE INTO vocabularies (name) VALUES (${sqlString(vocabulary)});`)
  .join("\n")}

CREATE TABLE IF NOT EXISTS vocabulary_terms (
  id INTEGER PRIMARY KEY,
  vocabulary TEXT NOT NULL REFERENCES vocabularies(name) ON DELETE CASCADE,
  term TEXT NOT NULL,
  package_source TEXT NOT NULL,
  extension_allowed INTEGER NOT NULL DEFAULT 0 CHECK (extension_allowed IN (0, 1)),
  seeded_other INTEGER NOT NULL DEFAULT 0 CHECK (seeded_other IN (0, 1)),
  UNIQUE (vocabulary, term)
) STRICT;

${VOCABULARY_TERMS.map((term) => `INSERT OR IGNORE INTO vocabulary_terms (vocabulary, term, package_source, extension_allowed, seeded_other) VALUES (${sqlString(term.vocabulary)}, ${sqlString(term.term)}, ${sqlString(term.packageSource)}, ${term.extensionAllowed ? 1 : 0}, ${term.seededOther ? 1 : 0});`).join("\n")}

CREATE TABLE IF NOT EXISTS link_types (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  package_source TEXT NOT NULL
) STRICT;

${LINK_TYPES.map((linkType) => `INSERT OR IGNORE INTO link_types (key, label, package_source) VALUES (${sqlString(linkType.key)}, ${sqlString(linkType.label)}, ${sqlString(linkType.packageSource)});`).join("\n")}

CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY,
  short_id TEXT NOT NULL UNIQUE,
  record_type_key TEXT NOT NULL REFERENCES record_types(key),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  truth_layer TEXT,
  canon_status TEXT,
  continuity_scope_id INTEGER NOT NULL DEFAULT 1 REFERENCES continuity_scopes(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS record_history (
  id INTEGER PRIMARY KEY,
  record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  retired_title TEXT NOT NULL,
  retired_body TEXT NOT NULL,
  retired_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  retiring_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  UNIQUE (record_id, sequence)
) STRICT;

CREATE TABLE IF NOT EXISTS record_links (
  id INTEGER PRIMARY KEY,
  from_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  to_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  link_type_key TEXT NOT NULL REFERENCES link_types(key),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (from_record_id, to_record_id, link_type_key)
) STRICT;

CREATE TABLE IF NOT EXISTS record_facets (
  id INTEGER PRIMARY KEY,
  record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  vocabulary TEXT NOT NULL REFERENCES vocabularies(name),
  term TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE (record_id, vocabulary, term),
  FOREIGN KEY (vocabulary, term) REFERENCES vocabulary_terms(vocabulary, term)
) STRICT;

CREATE VIRTUAL TABLE IF NOT EXISTS records_fts
USING fts5(short_id, title, body, content='records', content_rowid='id');

CREATE TRIGGER IF NOT EXISTS records_ai AFTER INSERT ON records BEGIN
  INSERT INTO records_fts(rowid, short_id, title, body)
  VALUES (new.id, new.short_id, new.title, new.body);
END;

CREATE TRIGGER IF NOT EXISTS records_validate_truth_layer_insert
BEFORE INSERT ON records
WHEN new.truth_layer IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM vocabulary_terms WHERE vocabulary = 'truth_layer' AND term = new.truth_layer)
BEGIN
  SELECT RAISE(ABORT, 'unknown truth layer');
END;

CREATE TRIGGER IF NOT EXISTS records_validate_truth_layer_update
BEFORE UPDATE OF truth_layer ON records
WHEN new.truth_layer IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM vocabulary_terms WHERE vocabulary = 'truth_layer' AND term = new.truth_layer)
BEGIN
  SELECT RAISE(ABORT, 'unknown truth layer');
END;

CREATE TRIGGER IF NOT EXISTS records_validate_canon_status_insert
BEFORE INSERT ON records
WHEN new.canon_status IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM vocabulary_terms WHERE vocabulary = 'canon_status' AND term = new.canon_status)
BEGIN
  SELECT RAISE(ABORT, 'unknown canon status');
END;

CREATE TRIGGER IF NOT EXISTS records_validate_canon_status_update
BEFORE UPDATE OF canon_status ON records
WHEN new.canon_status IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM vocabulary_terms WHERE vocabulary = 'canon_status' AND term = new.canon_status)
BEGIN
  SELECT RAISE(ABORT, 'unknown canon status');
END;

CREATE TRIGGER IF NOT EXISTS records_ad AFTER DELETE ON records BEGIN
  INSERT INTO records_fts(records_fts, rowid, short_id, title, body)
  VALUES ('delete', old.id, old.short_id, old.title, old.body);
END;

CREATE TRIGGER IF NOT EXISTS records_au AFTER UPDATE ON records BEGIN
  INSERT INTO records_fts(records_fts, rowid, short_id, title, body)
  VALUES ('delete', old.id, old.short_id, old.title, old.body);
  INSERT INTO records_fts(rowid, short_id, title, body)
  VALUES (new.id, new.short_id, new.title, new.body);
END;

CREATE TRIGGER IF NOT EXISTS report_records_no_update
BEFORE UPDATE ON records
WHEN (SELECT mutation_regime FROM record_types WHERE key = old.record_type_key) = 'report'
BEGIN
  SELECT RAISE(ABORT, 'report-regime records are append-only');
END;

CREATE TRIGGER IF NOT EXISTS report_records_no_delete
BEFORE DELETE ON records
WHEN (SELECT mutation_regime FROM record_types WHERE key = old.record_type_key) = 'report'
BEGIN
  SELECT RAISE(ABORT, 'report-regime records are append-only');
END;

CREATE TRIGGER IF NOT EXISTS card_records_history
BEFORE UPDATE OF title, body ON records
WHEN (SELECT mutation_regime FROM record_types WHERE key = old.record_type_key) = 'card'
  AND (old.title IS NOT new.title OR old.body IS NOT new.body)
BEGIN
  INSERT INTO record_history (record_id, sequence, retired_title, retired_body, actor_id)
  VALUES (
    old.id,
    COALESCE((SELECT MAX(sequence) + 1 FROM record_history WHERE record_id = old.id), 1),
    old.title,
    old.body,
    old.actor_id
  );
END;

CREATE TRIGGER IF NOT EXISTS records_touch_updated_at
AFTER UPDATE ON records
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE records SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

PRAGMA user_version = 1;
`;
