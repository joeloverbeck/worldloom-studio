import { LINK_TYPES, RECORD_TYPES, VOCABULARY_TERMS } from "@worldloom/shared";

export const APPLICATION_ID = 0x574c4f4d;
export const CURRENT_SCHEMA_VERSION = 2;

const sqlString = (value: string): string => `'${value.replaceAll("'", "''")}'`;

export const migration001 = `
PRAGMA application_id = ${APPLICATION_ID};
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
  truth_layer TEXT NOT NULL,
  canon_status TEXT NOT NULL,
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

CREATE TRIGGER IF NOT EXISTS record_links_no_retire_dangle
BEFORE DELETE ON record_links
WHEN old.link_type_key IN ('retired_by', 'supersedes', 'promoted_to', 'tombstones')
BEGIN
  SELECT RAISE(ABORT, 'retirement and genealogy links are append-only');
END;

CREATE TABLE IF NOT EXISTS record_facets (
  id INTEGER PRIMARY KEY,
  record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  vocabulary TEXT NOT NULL REFERENCES vocabularies(name),
  term TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE (record_id, vocabulary, term),
  FOREIGN KEY (vocabulary, term) REFERENCES vocabulary_terms(vocabulary, term)
) STRICT;

CREATE TABLE IF NOT EXISTS jurisdiction_events (
  id INTEGER PRIMARY KEY,
  record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  origin TEXT NOT NULL CHECK (origin IN ('admission', 'repair', 'sweep')),
  admission_decision_operation TEXT,
  repair_operation TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (
    (origin = 'admission' AND admission_decision_operation IS NOT NULL AND repair_operation IS NULL)
    OR (origin = 'repair' AND repair_operation IS NOT NULL AND admission_decision_operation IS NULL)
    OR (origin = 'sweep' AND admission_decision_operation IS NULL AND repair_operation IS NULL)
  )
) STRICT;

CREATE TRIGGER IF NOT EXISTS jurisdiction_events_validate_admission_operation
BEFORE INSERT ON jurisdiction_events
WHEN new.admission_decision_operation IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM vocabulary_terms
    WHERE vocabulary = 'admission_decision_operation'
      AND term = new.admission_decision_operation
  )
BEGIN
  SELECT RAISE(ABORT, 'unknown admission decision operation');
END;

CREATE TRIGGER IF NOT EXISTS jurisdiction_events_validate_repair_operation
BEFORE INSERT ON jurisdiction_events
WHEN new.repair_operation IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM vocabulary_terms
    WHERE vocabulary = 'repair_operation'
      AND term = new.repair_operation
  )
BEGIN
  SELECT RAISE(ABORT, 'unknown repair operation');
END;

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

CREATE TRIGGER IF NOT EXISTS records_au AFTER UPDATE OF short_id, title, body ON records BEGIN
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

CREATE TRIGGER IF NOT EXISTS records_provenance_no_update
BEFORE UPDATE OF actor_id, created_at ON records
BEGIN
  SELECT RAISE(ABORT, 'record provenance is immutable');
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

const headingValues = [
  ["world_kernel", 1, "World premise", "docs/worldbuilding-system/templates/world_kernel.md"],
  ["world_kernel", 2, "Core promise", "docs/worldbuilding-system/templates/world_kernel.md"],
  ["world_kernel", 3, "Starting scale", "docs/worldbuilding-system/templates/world_kernel.md"],
  ["world_kernel", 4, "Genre, tone, and consequence-mode commitments", "docs/worldbuilding-system/templates/world_kernel.md"],
  ["world_kernel", 5, "Foundational facts", "docs/worldbuilding-system/templates/world_kernel.md"],
  ["world_kernel", 6, "Foundational constraints", "docs/worldbuilding-system/templates/world_kernel.md"],
  ["world_kernel", 7, "Initial mysteries and protected effects", "docs/worldbuilding-system/templates/world_kernel.md"],
  ["world_kernel", 8, "Primary pressures and initial domains", "docs/worldbuilding-system/templates/world_kernel.md"],
  ["world_kernel", 9, "Ordinary-life promise", "docs/worldbuilding-system/templates/world_kernel.md"],
  ["canon_fact", 1, "Fact statement", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["canon_fact", 2, "Working scope", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["canon_fact", 3, "Consequence mode", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["canon_fact", 4, "Prerequisites", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["canon_fact", 5, "Costs and limits", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["canon_fact", 6, "Shock-cone summary", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["canon_fact", 7, "Evidence and belief", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["canon_fact", 8, "Contradiction risks", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["canon_fact", 9, "Mystery / wonder risks", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["canon_fact", 10, "Notes", "docs/worldbuilding-system/templates/canon_fact_card.md"],
  ["seed_decomposition", 1, "Kernel source", "docs/worldbuilding-system/05_creation_protocol.md"],
  ["seed_decomposition", 2, "Drafts consumed", "docs/worldbuilding-system/05_creation_protocol.md"],
  ["seed_decomposition", 3, "Granularity decisions", "docs/worldbuilding-system/05_creation_protocol.md"],
  ["seed_decomposition", 4, "Parked seeds", "docs/worldbuilding-system/05_creation_protocol.md"],
  ["seed_decomposition", 5, "Thin-start boundary", "docs/worldbuilding-system/05_creation_protocol.md"]
] as const;

export const migration002 = `
CREATE TABLE IF NOT EXISTS record_section_headings (
  record_type_key TEXT NOT NULL REFERENCES record_types(key) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  heading TEXT NOT NULL,
  package_source TEXT NOT NULL,
  PRIMARY KEY (record_type_key, position),
  UNIQUE (record_type_key, heading)
) STRICT;

${headingValues.map(([recordTypeKey, position, heading, packageSource]) => `INSERT OR IGNORE INTO record_section_headings (record_type_key, position, heading, package_source) VALUES (${sqlString(recordTypeKey)}, ${position}, ${sqlString(heading)}, ${sqlString(packageSource)});`).join("\n")}

CREATE TABLE IF NOT EXISTS record_sections (
  id INTEGER PRIMARY KEY,
  record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  heading TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL CHECK (position > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (record_id, heading),
  UNIQUE (record_id, position)
) STRICT;

CREATE TABLE IF NOT EXISTS record_section_history (
  id INTEGER PRIMARY KEY,
  section_id INTEGER NOT NULL,
  record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  retired_heading TEXT NOT NULL,
  retired_body TEXT NOT NULL,
  retired_position INTEGER NOT NULL,
  retired_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  UNIQUE (section_id, sequence)
) STRICT;

CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS prompt_templates (
  key TEXT PRIMARY KEY,
  role_name TEXT NOT NULL,
  original_text TEXT NOT NULL,
  package_source TEXT NOT NULL,
  current_version INTEGER NOT NULL DEFAULT 1
) STRICT;

CREATE TABLE IF NOT EXISTS prompt_template_versions (
  id INTEGER PRIMARY KEY,
  template_key TEXT NOT NULL REFERENCES prompt_templates(key) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (template_key, version)
) STRICT;

INSERT OR IGNORE INTO prompt_templates (key, role_name, original_text, package_source) VALUES
  ('kernel_pressure', 'Consequence scout', 'Given this canon fact and its constraints, list consequences across the domain atlas. Separate direct consequences from speculative ones. Do not invent new canon facts; label assumptions.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md'),
  ('decomposition_pressure', 'Prerequisite auditor', 'What hard, soft, economic, institutional, temporal, spatial, and psychological prerequisites does this fact require? Flag any prerequisite that would itself need canon admission.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md');

INSERT OR IGNORE INTO prompt_template_versions (template_key, version, text)
SELECT key, 1, original_text FROM prompt_templates;

CREATE TABLE IF NOT EXISTS advisory_dispositions (
  id INTEGER PRIMARY KEY,
  advisory_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  disposition TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  standing_ruling INTEGER NOT NULL DEFAULT 0 CHECK (standing_ruling IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS advisory_dispositions_validate
BEFORE INSERT ON advisory_dispositions
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'advisory_disposition'
    AND term = new.disposition
)
BEGIN
  SELECT RAISE(ABORT, 'unknown advisory disposition');
END;

CREATE TABLE IF NOT EXISTS flow_instances (
  id INTEGER PRIMARY KEY,
  flow_key TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'in_progress',
  current_step TEXT NOT NULL,
  kernel_record_id INTEGER REFERENCES records(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS report_sections_no_update
BEFORE UPDATE ON record_sections
WHEN (SELECT mutation_regime FROM record_types rt JOIN records r ON r.record_type_key = rt.key WHERE r.id = old.record_id) = 'report'
BEGIN
  SELECT RAISE(ABORT, 'report-regime sections are append-only');
END;

CREATE TRIGGER IF NOT EXISTS report_sections_no_delete
BEFORE DELETE ON record_sections
WHEN (SELECT mutation_regime FROM record_types rt JOIN records r ON r.record_type_key = rt.key WHERE r.id = old.record_id) = 'report'
BEGIN
  SELECT RAISE(ABORT, 'report-regime sections are append-only');
END;

CREATE TRIGGER IF NOT EXISTS card_sections_history
BEFORE UPDATE OF heading, body ON record_sections
WHEN (SELECT mutation_regime FROM record_types rt JOIN records r ON r.record_type_key = rt.key WHERE r.id = old.record_id) = 'card'
  AND (old.heading IS NOT new.heading OR old.body IS NOT new.body)
BEGIN
  INSERT INTO record_section_history (section_id, record_id, sequence, retired_heading, retired_body, retired_position)
  VALUES (
    old.id,
    old.record_id,
    COALESCE((SELECT MAX(sequence) + 1 FROM record_section_history WHERE section_id = old.id), 1),
    old.heading,
    old.body,
    old.position
  );
END;

CREATE TRIGGER IF NOT EXISTS record_sections_touch_updated_at
AFTER UPDATE ON record_sections
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE record_sections SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

CREATE TRIGGER IF NOT EXISTS drafts_touch_updated_at
AFTER UPDATE ON drafts
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE drafts SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

CREATE TRIGGER IF NOT EXISTS flow_instances_touch_updated_at
AFTER UPDATE ON flow_instances
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE flow_instances SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

DROP TRIGGER IF EXISTS records_ai;
DROP TRIGGER IF EXISTS records_ad;
DROP TRIGGER IF EXISTS records_au;
DROP TRIGGER IF EXISTS record_sections_ai;
DROP TRIGGER IF EXISTS record_sections_ad;
DROP TRIGGER IF EXISTS record_sections_au;

CREATE TRIGGER records_ai AFTER INSERT ON records BEGIN
  INSERT INTO records_fts(rowid, short_id, title, body)
  VALUES (new.id, new.short_id, new.title, new.body);
END;

CREATE TRIGGER records_ad AFTER DELETE ON records BEGIN
  INSERT INTO records_fts(records_fts, rowid, short_id, title, body)
  VALUES ('delete', old.id, old.short_id, old.title, old.body);
END;

CREATE TRIGGER records_au AFTER UPDATE OF short_id, title, body ON records BEGIN
  INSERT INTO records_fts(records_fts, rowid, short_id, title, body)
  VALUES ('delete', old.id, old.short_id, old.title, old.body);
  INSERT INTO records_fts(rowid, short_id, title, body)
  VALUES (new.id, new.short_id, new.title, new.body || char(10) || COALESCE((SELECT group_concat(heading || char(10) || body, char(10)) FROM record_sections WHERE record_id = new.id ORDER BY position), ''));
END;

CREATE TRIGGER record_sections_ai AFTER INSERT ON record_sections BEGIN
  INSERT INTO records_fts(records_fts, rowid, short_id, title, body)
  VALUES ('delete', new.record_id, (SELECT short_id FROM records WHERE id = new.record_id), (SELECT title FROM records WHERE id = new.record_id), (SELECT body FROM records WHERE id = new.record_id));
  INSERT INTO records_fts(rowid, short_id, title, body)
  SELECT id, short_id, title, body || char(10) || COALESCE((SELECT group_concat(heading || char(10) || body, char(10)) FROM record_sections WHERE record_id = records.id ORDER BY position), '')
  FROM records WHERE id = new.record_id;
END;

CREATE TRIGGER record_sections_ad AFTER DELETE ON record_sections BEGIN
  INSERT INTO records_fts(records_fts, rowid, short_id, title, body)
  VALUES ('delete', old.record_id, (SELECT short_id FROM records WHERE id = old.record_id), (SELECT title FROM records WHERE id = old.record_id), (SELECT body FROM records WHERE id = old.record_id));
  INSERT INTO records_fts(rowid, short_id, title, body)
  SELECT id, short_id, title, body || char(10) || COALESCE((SELECT group_concat(heading || char(10) || body, char(10)) FROM record_sections WHERE record_id = records.id ORDER BY position), '')
  FROM records WHERE id = old.record_id;
END;

CREATE TRIGGER record_sections_au AFTER UPDATE OF heading, body, position ON record_sections BEGIN
  INSERT INTO records_fts(records_fts, rowid, short_id, title, body)
  VALUES ('delete', new.record_id, (SELECT short_id FROM records WHERE id = new.record_id), (SELECT title FROM records WHERE id = new.record_id), (SELECT body FROM records WHERE id = new.record_id));
  INSERT INTO records_fts(rowid, short_id, title, body)
  SELECT id, short_id, title, body || char(10) || COALESCE((SELECT group_concat(heading || char(10) || body, char(10)) FROM record_sections WHERE record_id = records.id ORDER BY position), '')
  FROM records WHERE id = new.record_id;
END;

INSERT INTO records_fts(records_fts) VALUES('rebuild');

PRAGMA user_version = 2;
`;
