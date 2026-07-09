import {
  MIGRATION_004_CONTRADICTION_DISPOSITIONS,
  MIGRATION_004_PRESERVATION_OPERATIONS,
  MIGRATION_004_PROTECTED_EFFECT_TYPES,
  MIGRATION_004_REPAIR_OPERATIONS,
  MIGRATION_004_RETCON_TYPES,
  MIGRATION_001_LINK_TYPES,
  MIGRATION_001_RECORD_TYPES,
  MIGRATION_001_VOCABULARY_TERMS,
  MIGRATION_003_CONSEQUENCE_DISPOSITIONS
} from "./migration-snapshots.js";
import { QA_RED_TEAM_PROMPT_TEXT, QA_TEST_CATALOG } from "./qa-catalog.js";

export const APPLICATION_ID = 0x574c4f4d;
export const CURRENT_SCHEMA_VERSION = 9;

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

${MIGRATION_001_RECORD_TYPES.map((recordType) => `INSERT OR IGNORE INTO record_types (key, label, namespace, mutation_regime, package_source, untested_surface) VALUES (${sqlString(recordType.key)}, ${sqlString(recordType.label)}, ${sqlString(recordType.namespace)}, ${sqlString(recordType.mutationRegime)}, ${sqlString(recordType.packageSource)}, ${"untestedSurface" in recordType && recordType.untestedSurface ? 1 : 0});`).join("\n")}

CREATE TABLE IF NOT EXISTS record_type_sequences (
  record_type_key TEXT PRIMARY KEY REFERENCES record_types(key) ON DELETE CASCADE,
  next_value INTEGER NOT NULL CHECK (next_value > 0)
) STRICT;

${MIGRATION_001_RECORD_TYPES.map((recordType) => `INSERT OR IGNORE INTO record_type_sequences (record_type_key, next_value) VALUES (${sqlString(recordType.key)}, 1);`).join("\n")}

CREATE TABLE IF NOT EXISTS vocabularies (
  name TEXT PRIMARY KEY
) STRICT;

${[...new Set(MIGRATION_001_VOCABULARY_TERMS.map((term) => term.vocabulary))]
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

${MIGRATION_001_VOCABULARY_TERMS.map((term) => `INSERT OR IGNORE INTO vocabulary_terms (vocabulary, term, package_source, extension_allowed, seeded_other) VALUES (${sqlString(term.vocabulary)}, ${sqlString(term.term)}, ${sqlString(term.packageSource)}, ${term.extensionAllowed ? 1 : 0}, ${term.seededOther ? 1 : 0});`).join("\n")}

CREATE TABLE IF NOT EXISTS link_types (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  package_source TEXT NOT NULL
) STRICT;

${MIGRATION_001_LINK_TYPES.map((linkType) => `INSERT OR IGNORE INTO link_types (key, label, package_source) VALUES (${sqlString(linkType.key)}, ${sqlString(linkType.label)}, ${sqlString(linkType.packageSource)});`).join("\n")}

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
  ('kernel_pressure', 'Consequence scout', 'Pressure-test this steward-authored kernel as a pressure seed. Work from the kernel first, then surface direct consequences, speculative assumptions, ordinary-life residue, institutions, constraints, and quiet domains that the world may need to answer. Do not write first-draft or final canon; label surfaced facts as proposed-only.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md'),
  ('decomposition_pressure', 'Prerequisite auditor', 'Pressure-test this steward-authored seed decomposition. Work from the split seeds first, then identify hidden prerequisites across hard, soft, economic, institutional, temporal, spatial, and psychological domains. Flag bundled seeds, missing prerequisites, and any prerequisite that needs its own canon admission. Do not write final canon; label assumptions plainly.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md'),
  ('admission_prerequisite_audit', 'Prerequisite auditor', 'Pressure-test this proposed fact statement and its dependencies. Identify hard, soft, economic, institutional, temporal, spatial, and psychological prerequisites; flag any prerequisite that needs its own admission.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md'),
  ('admission_constraint_challenge', 'Constraint challenger', 'Challenge the proposed capability, access, cost, and constraints. Look for hostile optimization, cheap countermeasures, missing prices, quiet domains, and places where a constraint should be typed rather than hidden in prose.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md');

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

const propagationReportHeadings = [
  [1, "Fact and run"],
  [2, "Shock-cone orders"],
  [3, "Domain-atlas sweep"],
  [4, "Negative domains"],
  [5, "Consequences and dispositions"],
  [6, "Surfaced proposals"],
  [7, "Debt and preservation boundaries"],
  [8, "Stopping-rule audit"]
] as const;

export const migration003 = `
${MIGRATION_003_CONSEQUENCE_DISPOSITIONS
  .map((term) => `INSERT OR IGNORE INTO vocabularies (name) VALUES (${sqlString(term.vocabulary)});
INSERT OR IGNORE INTO vocabulary_terms (vocabulary, term, package_source, extension_allowed, seeded_other) VALUES (${sqlString(term.vocabulary)}, ${sqlString(term.term)}, ${sqlString(term.packageSource)}, ${term.extensionAllowed ? 1 : 0}, ${term.seededOther ? 1 : 0});`)
  .join("\n")}

${propagationReportHeadings.map(([position, heading]) => `INSERT OR IGNORE INTO record_section_headings (record_type_key, position, heading, package_source) VALUES ('propagation_report', ${position}, ${sqlString(heading)}, 'docs/worldbuilding-system/templates/propagation_report.md');`).join("\n")}

INSERT OR IGNORE INTO prompt_templates (key, role_name, original_text, package_source) VALUES
  ('propagation_consequence_scout', 'Consequence scout', 'Pressure-test this propagation step. Work from the steward material first, then list direct consequences, adaptations, countermeasures, fossils, quiet domains, and assumptions. Do not admit facts; label any surfaced fact as proposed-only.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md');

INSERT OR IGNORE INTO prompt_template_versions (template_key, version, text)
SELECT key, 1, original_text FROM prompt_templates WHERE key = 'propagation_consequence_scout';

ALTER TABLE flow_instances ADD COLUMN propagation_fact_record_id INTEGER REFERENCES records(id);
ALTER TABLE flow_instances ADD COLUMN propagation_debt_record_id INTEGER REFERENCES records(id);
ALTER TABLE flow_instances ADD COLUMN propagation_report_record_id INTEGER REFERENCES records(id);

CREATE TABLE IF NOT EXISTS propagation_consequences (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  fact_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  order_key TEXT NOT NULL,
  order_label TEXT NOT NULL,
  domain_name TEXT,
  body TEXT NOT NULL,
  pressure TEXT NOT NULL DEFAULT 'normal' CHECK (pressure IN ('normal', 'high')),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS propagation_domain_sweeps (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  triage TEXT NOT NULL CHECK (triage IN ('direct', 'dependency', 'reaction', 'negative')),
  declaration TEXT NOT NULL DEFAULT '',
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (flow_id, domain_name)
) STRICT;

CREATE TABLE IF NOT EXISTS propagation_consequence_dispositions (
  id INTEGER PRIMARY KEY,
  consequence_id INTEGER NOT NULL UNIQUE REFERENCES propagation_consequences(id) ON DELETE CASCADE,
  disposition TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  preservation_boundary TEXT,
  debt_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (
    (disposition = 'assigned as canon debt' AND debt_record_id IS NOT NULL AND preservation_boundary IS NULL)
    OR (disposition = 'protected as a mystery boundary' AND preservation_boundary IS NOT NULL AND debt_record_id IS NULL)
    OR (disposition IN ('answered', 'intentionally scoped out') AND debt_record_id IS NULL)
  )
) STRICT;

CREATE TRIGGER IF NOT EXISTS propagation_dispositions_validate
BEFORE INSERT ON propagation_consequence_dispositions
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'consequence_disposition'
    AND term = new.disposition
)
BEGIN
  SELECT RAISE(ABORT, 'unknown consequence disposition');
END;

CREATE TRIGGER IF NOT EXISTS propagation_dispositions_no_update
BEFORE UPDATE ON propagation_consequence_dispositions
BEGIN
  SELECT RAISE(ABORT, 'consequence dispositions are standing rulings; add a new consequence/report to correct');
END;

CREATE TABLE IF NOT EXISTS propagation_surfaced_proposals (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  proposal_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  report_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

PRAGMA user_version = 3;
`;

const migration004VocabularyTerms = [
  ...MIGRATION_004_REPAIR_OPERATIONS,
  ...MIGRATION_004_CONTRADICTION_DISPOSITIONS,
  ...MIGRATION_004_PRESERVATION_OPERATIONS,
  ...MIGRATION_004_RETCON_TYPES,
  ...MIGRATION_004_PROTECTED_EFFECT_TYPES
] as const;

const contradictionReportHeadings = [
  [1, "Contradiction statement"],
  [2, "Affected truth layers"],
  [3, "Affected scope"],
  [4, "Who can notice"],
  [5, "Audience notice"],
  [6, "Contradiction type"],
  [7, "Higher-authority material"],
  [8, "Mystery / protected-effect relationship"],
  [9, "Work scale"],
  [10, "Disposition"],
  [11, "Repair operation(s), primary first"],
  [12, "Retcon cost"],
  [13, "Propagation required"],
  [14, "Resulting canon status or branch decision"],
  [15, "Notes"],
  [16, "Close audit"]
] as const;

const mysteryLedgerHeadings = [
  [1, "Protected effect type"],
  [2, "Puzzle question, if any"],
  [3, "What is fixed"],
  [4, "What is secret or undecided"],
  [5, "Damaging explanations"],
  [6, "Preserved consequences"],
  [7, "Recurrence / motif / transformation"],
  [8, "Reveal permissions"],
  [9, "Reveal prohibitions"],
  [10, "Explanation-pressure operation"],
  [11, "What would break if solved or flattened"],
  [12, "Sacred-opacity accountability"]
] as const;

export const migration004 = `
DELETE FROM record_facets
WHERE vocabulary = 'repair_operation'
  AND term IN ('branch', 'supersede', 'deprecate');

DELETE FROM vocabulary_terms
WHERE vocabulary = 'repair_operation'
  AND term IN ('branch', 'supersede', 'deprecate');

${migration004VocabularyTerms
  .map((term) => `INSERT OR IGNORE INTO vocabularies (name) VALUES (${sqlString(term.vocabulary)});
INSERT OR IGNORE INTO vocabulary_terms (vocabulary, term, package_source, extension_allowed, seeded_other) VALUES (${sqlString(term.vocabulary)}, ${sqlString(term.term)}, ${sqlString(term.packageSource)}, ${term.extensionAllowed ? 1 : 0}, ${term.seededOther ? 1 : 0});`)
  .join("\n")}

CREATE TABLE IF NOT EXISTS seed_divergences (
  id INTEGER PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  package_source TEXT NOT NULL,
  app_decision TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

INSERT OR IGNORE INTO seed_divergences (key, package_source, app_decision, note)
VALUES (
  'contradiction_report_foundational_work_scale',
  'docs/worldbuilding-system/templates/contradiction_report.md',
  'Worldloom Studio keeps work_scale aligned to docs/worldbuilding-system/06_canon_fact_admission_protocol.md: minor, moderate, major, severe, catastrophic.',
  'The contradiction report template names foundational; this is logged as package divergence rather than amending package text.'
);

${contradictionReportHeadings.map(([position, heading]) => `INSERT OR IGNORE INTO record_section_headings (record_type_key, position, heading, package_source) VALUES ('contradiction_report', ${position}, ${sqlString(heading)}, 'docs/worldbuilding-system/templates/contradiction_report.md');`).join("\n")}

${mysteryLedgerHeadings.map(([position, heading]) => `INSERT OR IGNORE INTO record_section_headings (record_type_key, position, heading, package_source) VALUES ('mystery_ledger_entry', ${position}, ${sqlString(heading)}, 'docs/worldbuilding-system/templates/mystery_ledger_entry.md');`).join("\n")}

INSERT OR IGNORE INTO prompt_templates (key, role_name, original_text, package_source) VALUES
  ('repair_challenge', 'Contradiction hunter', 'Pressure-test the quoted claims, chosen repair operation, retcon costs, status changes, and propagation obligations. Suggest repair pressure only; do not decide canon standing.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md'),
  ('boundary_guard', 'Mystery guardian', 'Pressure-test the preservation boundary, protected effect type, explanation-pressure operation, reveal permissions, reveal prohibitions, and sacred-opacity accountability. Protect consequence; do not solve by default.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md');

INSERT OR IGNORE INTO prompt_template_versions (template_key, version, text)
SELECT key, 1, original_text FROM prompt_templates WHERE key IN ('repair_challenge', 'boundary_guard');

ALTER TABLE flow_instances ADD COLUMN contradiction_source_record_id INTEGER REFERENCES records(id);
ALTER TABLE flow_instances ADD COLUMN contradiction_report_record_id INTEGER REFERENCES records(id);

CREATE TABLE IF NOT EXISTS contradiction_implicated_records (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (flow_id, record_id)
) STRICT;

CREATE TABLE IF NOT EXISTS contradiction_triage_entries (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  body TEXT NOT NULL,
  doctrine_source TEXT NOT NULL DEFAULT 'docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (flow_id, step_key)
) STRICT;

CREATE TRIGGER IF NOT EXISTS contradiction_triage_touch_updated_at
AFTER UPDATE ON contradiction_triage_entries
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE contradiction_triage_entries SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

CREATE TABLE IF NOT EXISTS contradiction_work_scales (
  flow_id INTEGER PRIMARY KEY REFERENCES flow_instances(id) ON DELETE CASCADE,
  work_scale TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS contradiction_work_scales_validate
BEFORE INSERT ON contradiction_work_scales
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'work_scale'
    AND term = new.work_scale
)
BEGIN
  SELECT RAISE(ABORT, 'unknown work scale');
END;

CREATE TABLE IF NOT EXISTS contradiction_dispositions (
  flow_id INTEGER PRIMARY KEY REFERENCES flow_instances(id) ON DELETE CASCADE,
  disposition TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS contradiction_dispositions_validate
BEFORE INSERT ON contradiction_dispositions
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'contradiction_disposition'
    AND term = new.disposition
)
BEGIN
  SELECT RAISE(ABORT, 'unknown contradiction disposition');
END;

CREATE TABLE IF NOT EXISTS contradiction_repair_operations (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  operation TEXT NOT NULL,
  repair_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (flow_id, position)
) STRICT;

CREATE TRIGGER IF NOT EXISTS contradiction_repair_operations_validate
BEFORE INSERT ON contradiction_repair_operations
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'repair_operation'
    AND term = new.operation
)
BEGIN
  SELECT RAISE(ABORT, 'unknown repair operation');
END;

CREATE TABLE IF NOT EXISTS contradiction_repair_targets (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  next_canon_status TEXT NOT NULL,
  new_title TEXT,
  new_body TEXT,
  note TEXT NOT NULL DEFAULT '',
  advisory_record_id INTEGER REFERENCES records(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS contradiction_repair_created_proposals (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  proposal_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  report_record_id INTEGER REFERENCES records(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS contradiction_retcon_costs (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  retcon_type TEXT NOT NULL,
  cost_key TEXT NOT NULL CHECK (cost_key IN ('continuity', 'institutional', 'character', 'mystery', 'aesthetic', 'future')),
  cost_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (flow_id, cost_key)
) STRICT;

CREATE TRIGGER IF NOT EXISTS contradiction_retcon_costs_validate
BEFORE INSERT ON contradiction_retcon_costs
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'retcon_type'
    AND term = new.retcon_type
)
BEGIN
  SELECT RAISE(ABORT, 'unknown retcon type');
END;

CREATE TABLE IF NOT EXISTS contradiction_repair_propagation (
  flow_id INTEGER PRIMARY KEY REFERENCES flow_instances(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('assign', 'decline')),
  debt_record_id INTEGER REFERENCES records(id),
  skip_record_id INTEGER REFERENCES records(id),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (
    (action = 'assign' AND debt_record_id IS NOT NULL AND skip_record_id IS NULL)
    OR (action = 'decline' AND skip_record_id IS NOT NULL AND debt_record_id IS NULL)
  )
) STRICT;

CREATE TABLE IF NOT EXISTS contradiction_mystery_boundary_links (
  id INTEGER PRIMARY KEY,
  propagation_disposition_id INTEGER NOT NULL UNIQUE REFERENCES propagation_consequence_dispositions(id) ON DELETE CASCADE,
  ledger_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS mystery_preservation_checklists (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER REFERENCES flow_instances(id) ON DELETE CASCADE,
  ledger_record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
  protected_record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  effect_type TEXT NOT NULL,
  body TEXT NOT NULL,
  sacred_guard_body TEXT NOT NULL DEFAULT '',
  completed INTEGER NOT NULL DEFAULT 1 CHECK (completed IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS mystery_preservation_checklists_validate_operation
BEFORE INSERT ON mystery_preservation_checklists
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'preservation_operation'
    AND term = new.operation
)
BEGIN
  SELECT RAISE(ABORT, 'unknown preservation operation');
END;

CREATE TRIGGER IF NOT EXISTS mystery_preservation_checklists_validate_effect
BEFORE INSERT ON mystery_preservation_checklists
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'protected_effect_type'
    AND term = new.effect_type
)
BEGIN
  SELECT RAISE(ABORT, 'unknown protected effect type');
END;

PRAGMA user_version = 4;
`;

const qaPassHeadings = [
  [1, "Subject and run"],
  [2, "Score summary"],
  [3, "Regression profile"],
  [4, "Pass/fail floor"],
  [5, "Repair routing"],
  [6, "Prompt-out and skips"],
  [7, "Close audit"]
] as const;

const qaCatalogSeedSql = QA_TEST_CATALOG.map((test) => `INSERT OR IGNORE INTO qa_test_catalog (
  number,
  name,
  cluster,
  package_source,
  failure_smell,
  weak_anchor,
  adequate_anchor,
  strong_anchor,
  mode_benchmark
) VALUES (
  ${test.number},
  ${sqlString(test.name)},
  ${sqlString(test.cluster)},
  ${sqlString(test.packageSource)},
  ${sqlString(test.failureSmell)},
  ${sqlString(test.anchors.weak)},
  ${sqlString(test.anchors.adequate)},
  ${sqlString(test.anchors.strong)},
  ${sqlString(test.modeBenchmark)}
);`).join("\n");

export const migration005 = `
INSERT OR IGNORE INTO record_types (key, label, namespace, mutation_regime, package_source, untested_surface)
VALUES ('qa_pass', 'QA pass', 'QAP', 'report', 'docs/worldbuilding-system/18_quality_assurance_tests.md', 0);

INSERT OR IGNORE INTO record_type_sequences (record_type_key, next_value)
VALUES ('qa_pass', 1);

INSERT OR IGNORE INTO link_types (key, label, package_source)
VALUES ('assesses', 'assesses', 'docs/worldbuilding-system/18_quality_assurance_tests.md');

${qaPassHeadings.map(([position, heading]) => `INSERT OR IGNORE INTO record_section_headings (record_type_key, position, heading, package_source) VALUES ('qa_pass', ${position}, ${sqlString(heading)}, 'docs/worldbuilding-system/18_quality_assurance_tests.md');`).join("\n")}

CREATE TABLE IF NOT EXISTS qa_test_catalog (
  number INTEGER PRIMARY KEY CHECK (number BETWEEN 1 AND 28),
  name TEXT NOT NULL,
  cluster TEXT NOT NULL,
  package_source TEXT NOT NULL,
  failure_smell TEXT NOT NULL,
  weak_anchor TEXT NOT NULL,
  adequate_anchor TEXT NOT NULL,
  strong_anchor TEXT NOT NULL,
  mode_benchmark TEXT NOT NULL
) STRICT;

${qaCatalogSeedSql}

ALTER TABLE flow_instances ADD COLUMN qa_subject_record_id INTEGER REFERENCES records(id);
ALTER TABLE flow_instances ADD COLUMN qa_pass_record_id INTEGER REFERENCES records(id);

CREATE TABLE IF NOT EXISTS qa_test_scores (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  qa_pass_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  test_number INTEGER NOT NULL REFERENCES qa_test_catalog(number),
  score TEXT NOT NULL CHECK (score IN ('0', '1', '2', '3', 'na')),
  na_reason TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  required_repair TEXT NOT NULL DEFAULT '',
  load_bearing INTEGER NOT NULL DEFAULT 0 CHECK (load_bearing IN (0, 1)),
  repair_routed INTEGER NOT NULL DEFAULT 0 CHECK (repair_routed IN (0, 1)),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (qa_pass_record_id, test_number),
  CHECK (score != 'na' OR length(trim(na_reason)) > 0)
) STRICT;

CREATE TRIGGER IF NOT EXISTS qa_test_scores_na_reason
BEFORE INSERT ON qa_test_scores
WHEN new.score = 'na' AND length(trim(new.na_reason)) = 0
BEGIN
  SELECT RAISE(ABORT, 'n/a reason required');
END;

CREATE TRIGGER IF NOT EXISTS qa_test_scores_na_reason_update
BEFORE UPDATE ON qa_test_scores
WHEN new.score = 'na' AND length(trim(new.na_reason)) = 0
BEGIN
  SELECT RAISE(ABORT, 'n/a reason required');
END;

CREATE TRIGGER IF NOT EXISTS qa_test_scores_touch_updated_at
AFTER UPDATE ON qa_test_scores
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE qa_test_scores SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

CREATE TABLE IF NOT EXISTS qa_regression_profiles (
  qa_pass_record_id INTEGER PRIMARY KEY REFERENCES records(id) ON DELETE CASCADE,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  strongest_domain TEXT NOT NULL DEFAULT '',
  weakest_domain TEXT NOT NULL DEFAULT '',
  most_dangerous_under_propagated_fact TEXT NOT NULL DEFAULT '',
  most_likely_contradiction TEXT NOT NULL DEFAULT '',
  most_fragile_mystery TEXT NOT NULL DEFAULT '',
  most_overloaded_constraint TEXT NOT NULL DEFAULT '',
  most_suspicious_absent_institution_response TEXT NOT NULL DEFAULT '',
  most_at_risk_aesthetic_drift TEXT NOT NULL DEFAULT '',
  canon_debt_before_foundational_facts TEXT NOT NULL DEFAULT '',
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS qa_regression_profiles_touch_updated_at
AFTER UPDATE ON qa_regression_profiles
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE qa_regression_profiles SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE qa_pass_record_id = new.qa_pass_record_id;
END;

CREATE TABLE IF NOT EXISTS qa_floor_verdicts (
  qa_pass_record_id INTEGER PRIMARY KEY REFERENCES records(id) ON DELETE CASCADE,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  repeatable_high_impact_capability INTEGER NOT NULL CHECK (repeatable_high_impact_capability IN (0, 1)),
  lacks_access_limits INTEGER NOT NULL CHECK (lacks_access_limits IN (0, 1)),
  lacks_cost INTEGER NOT NULL CHECK (lacks_cost IN (0, 1)),
  lacks_countermeasure INTEGER NOT NULL CHECK (lacks_countermeasure IN (0, 1)),
  lacks_actor_adaptation INTEGER NOT NULL CHECK (lacks_actor_adaptation IN (0, 1)),
  lacks_temporal_residue INTEGER NOT NULL CHECK (lacks_temporal_residue IN (0, 1)),
  lacks_distribution_pattern INTEGER NOT NULL CHECK (lacks_distribution_pattern IN (0, 1)),
  lacks_institution_or_mode_equivalent INTEGER NOT NULL CHECK (lacks_institution_or_mode_equivalent IN (0, 1)),
  triggered INTEGER NOT NULL CHECK (triggered IN (0, 1)),
  override INTEGER NOT NULL DEFAULT 0 CHECK (override IN (0, 1)),
  override_reason TEXT NOT NULL DEFAULT '',
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS qa_floor_verdicts_touch_updated_at
AFTER UPDATE ON qa_floor_verdicts
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE qa_floor_verdicts SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE qa_pass_record_id = new.qa_pass_record_id;
END;

CREATE TABLE IF NOT EXISTS qa_repairs (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  qa_pass_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  test_number INTEGER NOT NULL REFERENCES qa_test_catalog(number),
  repair_kind TEXT NOT NULL CHECK (repair_kind IN ('fact', 'canon_debt')),
  debt_kind TEXT,
  repair_text TEXT NOT NULL,
  proposal_record_id INTEGER REFERENCES records(id),
  debt_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (
    (repair_kind = 'fact' AND proposal_record_id IS NOT NULL AND debt_record_id IS NULL)
    OR (repair_kind = 'canon_debt' AND debt_record_id IS NOT NULL AND proposal_record_id IS NULL)
  )
) STRICT;

INSERT OR IGNORE INTO prompt_templates (key, role_name, original_text, package_source) VALUES
  ('qa_red_team', 'QA hostile reader', ${sqlString(QA_RED_TEAM_PROMPT_TEXT)}, 'docs/worldbuilding-system/18_quality_assurance_tests.md');

INSERT OR IGNORE INTO prompt_template_versions (template_key, version, text)
SELECT key, 1, original_text FROM prompt_templates WHERE key = 'qa_red_team';

PRAGMA user_version = 5;
`;

const stage12PassReportHeadings = [
  [1, "Source and run"],
  [2, "Coverage lenses"],
  [3, "Linked cards"],
  [4, "Admission proposals"],
  [5, "Canon debt"],
  [6, "Prompt-out and skips"],
  [7, "Close readiness"]
] as const;

export const migration006 = `
${stage12PassReportHeadings.map(([position, heading]) => `INSERT OR IGNORE INTO record_section_headings (record_type_key, position, heading, package_source) VALUES ('pass_report', ${position}, ${sqlString(heading)}, 'docs/worldbuilding-system/21_templates_index.md');`).join("\n")}

INSERT OR IGNORE INTO prompt_templates (key, role_name, original_text, package_source) VALUES
  ('institution_economy_analyst', 'Institution/economy analyst', 'Pressure-test this institutional, economic, and suppression sweep. Work from steward-authored material first. Identify action arenas, rules-in-use, transaction costs, surplus capture, suppression residue, counter-institutions, daily-life residue, and power conflict. Do not admit facts; label surfaced facts as proposed-only and name unresolved canon debt.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md');

INSERT OR IGNORE INTO prompt_template_versions (template_key, version, text)
SELECT key, 1, original_text FROM prompt_templates WHERE key = 'institution_economy_analyst';

CREATE TABLE IF NOT EXISTS stage12_run_sources (
  flow_id INTEGER PRIMARY KEY REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('fact', 'under_review_fact', 'canon_debt', 'material', 'record_section')),
  source_record_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
  source_section_heading TEXT,
  material_title TEXT NOT NULL DEFAULT '',
  material_body TEXT NOT NULL DEFAULT '',
  source_summary TEXT NOT NULL,
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS stage12_coverage (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  lens_key TEXT NOT NULL,
  lens_label TEXT NOT NULL,
  body TEXT NOT NULL,
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (flow_id, lens_key)
) STRICT;

CREATE TRIGGER IF NOT EXISTS stage12_coverage_touch_updated_at
AFTER UPDATE ON stage12_coverage
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE stage12_coverage SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

CREATE TABLE IF NOT EXISTS stage12_linked_cards (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  card_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  card_type_key TEXT NOT NULL CHECK (card_type_key IN ('action_arena', 'institution', 'counter_institution')),
  lens_key TEXT,
  relation TEXT NOT NULL DEFAULT '',
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (flow_id, card_record_id)
) STRICT;

CREATE TABLE IF NOT EXISTS stage12_proposals (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  proposal_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  lens_key TEXT NOT NULL,
  advisory_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS stage12_debts (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  debt_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  lens_key TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity_or_consequence_mode TEXT NOT NULL DEFAULT '',
  advisory_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS stage12_advisories (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  advisory_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS stage12_advisory_uses (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  advisory_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  outcome_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  outcome_kind TEXT NOT NULL CHECK (outcome_kind IN ('card', 'proposal', 'debt', 'report')),
  note TEXT NOT NULL DEFAULT '',
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (advisory_record_id, outcome_record_id, outcome_kind)
) STRICT;

CREATE TABLE IF NOT EXISTS stage12_skips (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  skip_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  unresolved INTEGER NOT NULL DEFAULT 0 CHECK (unresolved IN (0, 1)),
  debt_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (unresolved = 0 OR debt_record_id IS NOT NULL)
) STRICT;

PRAGMA user_version = 6;
`;

const constraintPassReportHeadings = [
  [8, "Constraint source and run"],
  [9, "Constraint coverage"],
  [10, "Constraint cards"],
  [11, "Constraint proposals"],
  [12, "Constraint debt"],
  [13, "Constraint Prompt-out and skips"],
  [14, "Constraint close readiness"]
] as const;

export const migration007 = `
${constraintPassReportHeadings.map(([position, heading]) => `INSERT OR IGNORE INTO record_section_headings (record_type_key, position, heading, package_source) VALUES ('pass_report', ${position}, ${sqlString(heading)}, 'docs/worldbuilding-system/08_constraint_composition.md');`).join("\n")}

INSERT OR IGNORE INTO prompt_templates (key, role_name, original_text, package_source) VALUES
  ('constraint_challenger', 'Constraint challenger', 'Pressure-test this constraint-composition pass. Work from steward-authored material first. Identify what the constraint prevents, what remains possible, who knows the boundary, who tests it, loopholes, enforcement, residue, and places where a constraint card, Admission proposal, or canon debt is owed. Do not admit facts; label surfaced facts as proposed-only.', 'docs/worldbuilding-system/20_ai_assisted_workflow.md');

INSERT OR IGNORE INTO prompt_template_versions (template_key, version, text)
SELECT key, 1, original_text FROM prompt_templates WHERE key = 'constraint_challenger';

CREATE TABLE IF NOT EXISTS constraint_run_sources (
  flow_id INTEGER PRIMARY KEY REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('fact', 'capability', 'constraint_card', 'canon_debt', 'material', 'record_section')),
  source_record_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
  source_section_heading TEXT,
  material_title TEXT NOT NULL DEFAULT '',
  material_body TEXT NOT NULL DEFAULT '',
  constrained_subject TEXT NOT NULL DEFAULT '',
  source_summary TEXT NOT NULL,
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS constraint_inventory_entries (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  constrained_fact TEXT NOT NULL,
  constraint_statement TEXT NOT NULL,
  constraint_type TEXT NOT NULL,
  prevents TEXT NOT NULL,
  allows TEXT NOT NULL,
  boundary_knowledge TEXT NOT NULL,
  bypass_actors TEXT NOT NULL,
  cause_or_mystery_boundary TEXT NOT NULL,
  enforcement TEXT NOT NULL,
  residue TEXT NOT NULL,
  cost_or_observable TEXT NOT NULL DEFAULT '',
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS constraint_inventory_validate_type
BEFORE INSERT ON constraint_inventory_entries
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'constraint_type'
    AND term = new.constraint_type
)
BEGIN
  SELECT RAISE(ABORT, 'unknown constraint type');
END;

CREATE TRIGGER IF NOT EXISTS constraint_inventory_validate_type_update
BEFORE UPDATE ON constraint_inventory_entries
WHEN NOT EXISTS (
  SELECT 1 FROM vocabulary_terms
  WHERE vocabulary = 'constraint_type'
    AND term = new.constraint_type
)
BEGIN
  SELECT RAISE(ABORT, 'unknown constraint type');
END;

CREATE TRIGGER IF NOT EXISTS constraint_inventory_touch_updated_at
AFTER UPDATE ON constraint_inventory_entries
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE constraint_inventory_entries SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

CREATE TABLE IF NOT EXISTS constraint_composition_entries (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('stacking', 'gate', 'tradeoff', 'threshold', 'sequential', 'cancellation', 'contradiction', 'chain')),
  body TEXT NOT NULL,
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (flow_id, analysis_type)
) STRICT;

CREATE TRIGGER IF NOT EXISTS constraint_composition_touch_updated_at
AFTER UPDATE ON constraint_composition_entries
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE constraint_composition_entries SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

CREATE TABLE IF NOT EXISTS constraint_leakage_entries (
  flow_id INTEGER PRIMARY KEY REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  bottleneck TEXT NOT NULL,
  loopholes TEXT NOT NULL,
  partial_workarounds TEXT NOT NULL,
  false_bypasses TEXT NOT NULL,
  accidents TEXT NOT NULL,
  countermeasures TEXT NOT NULL,
  boundary_testers TEXT NOT NULL,
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS constraint_leakage_touch_updated_at
AFTER UPDATE ON constraint_leakage_entries
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE constraint_leakage_entries SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE flow_id = new.flow_id;
END;

CREATE TABLE IF NOT EXISTS constraint_residue_entries (
  flow_id INTEGER PRIMARY KEY REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  ordinary_life TEXT NOT NULL,
  institutional_effects TEXT NOT NULL,
  economic_effects TEXT NOT NULL,
  visible_traces TEXT NOT NULL,
  expertise TEXT NOT NULL,
  resentment TEXT NOT NULL,
  crime TEXT NOT NULL,
  ritual TEXT NOT NULL,
  markets TEXT NOT NULL,
  failure_modes TEXT NOT NULL,
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TRIGGER IF NOT EXISTS constraint_residue_touch_updated_at
AFTER UPDATE ON constraint_residue_entries
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE constraint_residue_entries SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE flow_id = new.flow_id;
END;

CREATE TABLE IF NOT EXISTS constraint_linked_cards (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  card_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  inventory_id INTEGER REFERENCES constraint_inventory_entries(id) ON DELETE SET NULL,
  relation TEXT NOT NULL DEFAULT '',
  advisory_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (flow_id, card_record_id)
) STRICT;

CREATE TABLE IF NOT EXISTS constraint_proposals (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  proposal_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  source_step TEXT NOT NULL,
  advisory_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS constraint_debts (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  debt_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  source_step TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity_or_consequence_mode TEXT NOT NULL DEFAULT '',
  advisory_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS constraint_advisories (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  advisory_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE TABLE IF NOT EXISTS constraint_advisory_uses (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  advisory_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  outcome_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  outcome_kind TEXT NOT NULL CHECK (outcome_kind IN ('card', 'proposal', 'debt', 'report', 'skip')),
  note TEXT NOT NULL DEFAULT '',
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (advisory_record_id, outcome_record_id, outcome_kind)
) STRICT;

CREATE TABLE IF NOT EXISTS constraint_skips (
  id INTEGER PRIMARY KEY,
  flow_id INTEGER NOT NULL REFERENCES flow_instances(id) ON DELETE CASCADE,
  pass_report_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  skip_record_id INTEGER NOT NULL UNIQUE REFERENCES records(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  unresolved INTEGER NOT NULL DEFAULT 0 CHECK (unresolved IN (0, 1)),
  debt_record_id INTEGER REFERENCES records(id),
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (unresolved = 0 OR debt_record_id IS NOT NULL)
) STRICT;

PRAGMA user_version = 7;
`;

export const migration008 = `
INSERT OR IGNORE INTO vocabulary_terms (vocabulary, term, package_source, extension_allowed, seeded_other)
VALUES ('advisory_disposition', 'adopted with steward revision', 'docs/worldbuilding-system/20_ai_assisted_workflow.md', 0, 0);

PRAGMA user_version = 8;
`;

export const migration009 = `
CREATE TABLE IF NOT EXISTS creation_seed_family_coverage (
  id INTEGER PRIMARY KEY,
  kernel_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  seed_decomposition_report_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  source_kernel_context TEXT NOT NULL DEFAULT '',
  required INTEGER NOT NULL DEFAULT 1 CHECK (required IN (0, 1)),
  disposition TEXT NOT NULL DEFAULT 'unresolved' CHECK (disposition IN ('unresolved', 'covered', 'deferred', 'out_of_scope')),
  disposition_rationale TEXT NOT NULL DEFAULT '',
  debt_record_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
  out_of_scope_rationale TEXT NOT NULL DEFAULT '',
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  flow_step TEXT NOT NULL DEFAULT 'decomposition:coverage',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (kernel_record_id, label),
  CHECK (disposition != 'deferred' OR (length(trim(disposition_rationale)) > 0 AND debt_record_id IS NOT NULL)),
  CHECK (disposition != 'out_of_scope' OR length(trim(out_of_scope_rationale)) > 0)
) STRICT;

CREATE TABLE IF NOT EXISTS creation_seed_family_coverage_links (
  id INTEGER PRIMARY KEY,
  coverage_row_id INTEGER NOT NULL REFERENCES creation_seed_family_coverage(id) ON DELETE CASCADE,
  seed_record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  seed_decomposition_report_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
  note TEXT NOT NULL DEFAULT '',
  actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (coverage_row_id, seed_record_id)
) STRICT;

CREATE TRIGGER IF NOT EXISTS creation_seed_family_coverage_touch_updated_at
AFTER UPDATE ON creation_seed_family_coverage
WHEN old.updated_at = new.updated_at
BEGIN
  UPDATE creation_seed_family_coverage SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = new.id;
END;

PRAGMA user_version = 9;
`;
