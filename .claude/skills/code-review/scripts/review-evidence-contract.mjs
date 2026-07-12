const childTableHeader = "| Issue | Acceptance source | Evidence reviewed | Findings/residuals |";

export const DEFAULT_REVIEW_CLOSEOUT_BODY_MAX_BYTES = 65_536;

export const validateReviewClosingBodySize = (body, errors, options = {}) => {
  if (!options.closing) return;
  const maxBytes = options.maxBytes ?? DEFAULT_REVIEW_CLOSEOUT_BODY_MAX_BYTES;
  const bodyBytes = Buffer.byteLength(body, "utf8");
  if (bodyBytes > maxBytes) {
    errors.push(`review closeout body is ${bodyBytes} bytes; maximum is ${maxBytes} bytes`);
  }
};

const fieldPattern = (label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^\\s*[-*]?\\s*(?:\\*\\*)?${escaped}(?:\\*\\*)?:\\s*(.+)$`, "im");
};

export const fieldValue = (body, label) => body.match(fieldPattern(label))?.[1]?.trim() ?? "";

export const unresolvedValue = (value) =>
  !value ||
  /^<.*>$/.test(value) ||
  /\b(?:TBD|TODO|pending|unknown)\b/i.test(value) ||
  /<[^>]+>/.test(value);

const splitMarkdownTableRow = (row) =>
  row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());

const findRowsAfterTableHeader = (body) => {
  const lines = body.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.trim() === childTableHeader);
  if (headerIndex === -1) return [];

  const rows = [];
  for (const line of lines.slice(headerIndex + 2)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) break;
    rows.push(trimmed);
  }
  return rows;
};

const sourceEnumeratesAcceptanceItems = (source) =>
  /\b(?:AC|A)\s*#?\d+\b/i.test(source) ||
  /\b(?:acceptance item|acceptance criterion|criterion|criteria|checkbox|checklist item|user story|story)\s*#?\d+\b/i.test(source);

const sourceCitesExactAcceptanceRows = (source) =>
  /\b(?:exact\s+)?(?:acceptance|criterion|checkbox|audit|closeout)\s+(?:table|rows?)\b/i.test(source) &&
  /\b(?:row|rows?|range|below|above|adjacent|#\d+)\b/i.test(source);

const cellClaimsNoResidualFindings = (cell) =>
  /\b(?:no findings|none|no residuals?|residuals?\s+none|0 residuals?)\b/i.test(cell);

const validateSequenceSource = (source) => {
  const sequence = source.match(/\bsequence:\s*(.+)$/i)?.[1]?.trim() ?? "";
  if (unresolvedValue(sequence)) return "must include sequence: with ordered proof or a justified N/A";
  if (/^N\/A\b/i.test(sequence)) {
    return /^N\/A\s+because\s+\S.+/i.test(sequence)
      ? ""
      : "must justify sequence N/A with 'N/A because ...'";
  }

  const hasOrder = /(?:→|->|\b(?:before|after|then|followed by|ordered)\b)/i.test(sequence);
  const hasProof = /\b(?:observ(?:e|ed|es|ing)|asserted|verified|proved|test|trace|evidence|artifact|log|browser|report|API)\b/i.test(sequence);
  if (!hasOrder || !hasProof) {
    return "must name ordered events and the proof that observes their order";
  }
  return "";
};

const specClaimsZeroFindings = (body) => {
  const lines = body.split(/\r?\n/);
  const specStart = lines.findIndex((line) => line.trim() === "## Spec");
  const specEndOffset = specStart < 0
    ? -1
    : lines.slice(specStart + 1).findIndex((line) => /^##\s+/.test(line.trim()));
  const specEnd = specEndOffset < 0 ? lines.length : specStart + 1 + specEndOffset;
  const specSection = specStart < 0 ? "" : lines.slice(specStart + 1, specEnd).join("\n");
  return (
    /^\s*Findings:\s*(?:none|no findings|0)\b/im.test(specSection) ||
    /^(?:0|none|no findings)\b/i.test(fieldValue(body, "Final Spec outcome")) ||
    /\bSpec\s+(?:0|none|no findings)\b/i.test(fieldValue(body, "Axis summary"))
  );
};

const validateAcceptanceManifest = (manifest, errors, coverageLabel) => {
  if (!manifest) {
    errors.push(`${coverageLabel} requires an acceptance manifest`);
    return [];
  }
  if (manifest.version !== 1 || !Array.isArray(manifest.issues) || manifest.issues.length === 0) {
    errors.push("acceptance manifest must have version 1 and a non-empty issues array");
    return [];
  }

  const seen = new Set();
  for (const issue of manifest.issues) {
    if (!Number.isInteger(issue?.number) || seen.has(issue.number) || !Array.isArray(issue.checks) || !issue.checks.length) {
      errors.push("acceptance manifest issues require unique integer numbers and non-empty checks arrays");
      return [];
    }
    seen.add(issue.number);
    if (issue.checks.some((check) => typeof check?.id !== "string" || !check.id.trim())) {
      errors.push(`acceptance manifest issue #${issue.number} has an invalid check id`);
      return [];
    }
  }
  return manifest.issues;
};

const sourceNamesCheck = (source, id) => {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`(?:^|[^A-Za-z0-9])${escapedId}(?:[^A-Za-z0-9]|$)`, "i").test(source)) return true;

  const numericId = id.match(/^([A-Za-z]+)(\d+)$/);
  if (!numericId) return false;

  const [, prefix, numberText] = numericId;
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rangePattern = new RegExp(
    `(?:^|[^A-Za-z0-9])${escapedPrefix}\\s*#?(\\d+)\\s*(?:-|–|—|to|through)\\s*(?:${escapedPrefix}\\s*)?#?(\\d+)(?:[^A-Za-z0-9]|$)`,
    "gi"
  );
  const number = Number(numberText);
  return [...source.matchAll(rangePattern)].some((match) => {
    const start = Number(match[1]);
    const end = Number(match[2]);
    return number >= Math.min(start, end) && number <= Math.max(start, end);
  });
};

export const validateReviewSpecCoverage = (body, errors, options = {}) => {
  const requiresCoverageTable = options.requireChildFamily || options.requireParentPrd || options.requireIssueSet;
  if (!requiresCoverageTable) {
    if (specClaimsZeroFindings(body)) {
      const sequenceCoverage = fieldValue(body, "Spec sequence coverage");
      const sequenceError = validateSequenceSource(sequenceCoverage);
      if (sequenceError) errors.push(`Spec sequence coverage ${sequenceError}`);
    }
    return;
  }

  const coverageLabel = options.requireIssueSet && !options.requireChildFamily && !options.requireParentPrd
    ? "issue-set coverage"
    : "PRD child coverage";
  const manifestIssues = validateAcceptanceManifest(options.acceptanceManifest, errors, coverageLabel);

  if (!body.includes(childTableHeader)) {
    errors.push(`missing ${coverageLabel} table header`);
    return;
  }
  if (!body.includes("|---|---|---|---|")) {
    errors.push(`missing ${coverageLabel} table separator`);
  }

  const childIssueRows = findRowsAfterTableHeader(body).filter((row) => {
    const cells = splitMarkdownTableRow(row);
    return cells.length >= 4 && /^#\d+\b/.test(cells[0]);
  });
  if (!childIssueRows.length) {
    errors.push(`${coverageLabel} table has no issue rows`);
    return;
  }

  const actualIssueNumbers = new Set(childIssueRows.map((row) => Number(splitMarkdownTableRow(row)[0].slice(1))));
  const expectedIssueNumbers = new Set(manifestIssues.map((issue) => issue.number));
  for (const issue of manifestIssues) {
    if (!actualIssueNumbers.has(issue.number)) errors.push(`${coverageLabel} table is missing issue #${issue.number}`);
  }
  for (const issueNumber of actualIssueNumbers) {
    if (!expectedIssueNumbers.has(issueNumber)) errors.push(`${coverageLabel} table has unexpected issue #${issueNumber}`);
  }

  for (const row of childIssueRows) {
    const [issue, acceptanceSource, , findingsCell] = splitMarkdownTableRow(row);
    if (!cellClaimsNoResidualFindings(findingsCell ?? "")) continue;

    if (
      !sourceEnumeratesAcceptanceItems(acceptanceSource ?? "") &&
      !sourceCitesExactAcceptanceRows(acceptanceSource ?? "")
    ) {
      errors.push(
        `${coverageLabel} row ${issue} acceptance source is too broad for zero residual Spec findings; enumerate exact acceptance items or cite adjacent exact acceptance table rows: ${acceptanceSource}`
      );
    }

    const sequenceError = validateSequenceSource(acceptanceSource ?? "");
    if (sequenceError) errors.push(`${coverageLabel} row ${issue} ${sequenceError}`);
  }

  for (const issue of manifestIssues) {
    const issueSources = childIssueRows
      .map((row) => splitMarkdownTableRow(row))
      .filter(([rowIssue]) => rowIssue === `#${issue.number}`)
      .map(([, source]) => source);
    for (const check of issue.checks) {
      if (!issueSources.some((source) => sourceNamesCheck(source, check.id))) {
        errors.push(`${coverageLabel} issue #${issue.number} is missing acceptance source ${check.id}`);
      }
    }
  }
};

const identityCategories = [
  "fixture paths",
  "browser sessions",
  "packet paths/hashes",
  "active revisions",
  "artifacts"
];

const identityInventory = (value) => {
  const inventory = new Map();
  for (const category of identityCategories) {
    const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = value.match(new RegExp(`(?:^|;)\\s*${escaped}\\s+([^;]+)`, "i"));
    inventory.set(category, match?.[1]?.trim() ?? "");
  }
  return inventory;
};

export const validateReviewFixtureSnapshotCurrentness = (body, errors, options = {}) => {
  if (!options.requireBrowser) return;

  const fixturePaths = identityInventory(fieldValue(body, "Current evidence identities")).get("fixture paths") ?? "";
  if (!fixturePaths || /^none$/i.test(fixturePaths)) return;

  const backendCurrentness = fieldValue(body, "Backend process currentness");
  if (/\bN\/A because no stateful fixture was copied\b/i.test(backendCurrentness)) return;

  const hasSnapshotMethod = /\bstateful fixture snapshot method\b/i.test(backendCurrentness);
  const hasSnapshotSource = /\bsnapshot source\b/i.test(backendCurrentness);
  const hasExpectedStateProbe = /\bexpected-state probe\b/i.test(backendCurrentness);
  if (hasSnapshotMethod && hasSnapshotSource && hasExpectedStateProbe) return;

  errors.push(
    "Backend process currentness with non-none fixture paths must state stateful fixture snapshot method, snapshot source, and expected-state probe, or 'N/A because no stateful fixture was copied'"
  );
};

const validateIdentityInventory = (value, label, errors) => {
  if (unresolvedValue(value)) {
    errors.push(`${label} is empty or unresolved`);
    return;
  }
  const inventory = identityInventory(value);
  for (const category of identityCategories) {
    if (!value.toLowerCase().includes(category.toLowerCase())) {
      errors.push(`${label} must enumerate ${category}`);
    } else if (!inventory.get(category)) {
      errors.push(`${label} ${category} requires a value or none`);
    }
  }
};

export const validateReviewEvidenceIdentities = (body, errors) => {
  if (!body.includes("Evidence identity refresh:")) {
    errors.push("missing Evidence identity refresh block");
  }

  const current = fieldValue(body, "Current evidence identities");
  const historicalRed = fieldValue(body, "Historical red identities retained");
  const superseded = fieldValue(body, "Superseded evidence identities");
  const sweep = fieldValue(body, "Superseded-token sweep");

  validateIdentityInventory(current, "Current evidence identities", errors);
  validateIdentityInventory(superseded, "Superseded evidence identities", errors);
  const fixturePaths = identityInventory(current).get("fixture paths") ?? "";
  if (/^none published because\b/i.test(fixturePaths)) {
    errors.push("withheld fixture paths must use the structured 'fixture paths withheld because ...' identity form");
  }
  if (
    /^withheld\b/i.test(fixturePaths) &&
    !/fixture paths\s+withheld because\s+[^;]+;\s*logical fixture\s+[^;]+;\s*content SHA-256\s+[0-9a-f]{64};\s*provenance\s+[^;]+(?=;|$)/i.test(
      current
    )
  ) {
    errors.push(
      "withheld fixture identity must include reason, logical fixture, 64-character content SHA-256, and provenance"
    );
  }
  if (unresolvedValue(historicalRed)) {
    errors.push("Historical red identities retained is empty or unresolved");
  } else if (!/^none$/i.test(historicalRed)) {
    validateIdentityInventory(historicalRed, "Historical red identities retained", errors);
  }
  if (unresolvedValue(sweep)) {
    errors.push("Superseded-token sweep is empty or unresolved");
    return;
  }

  const supersededInventory = identityInventory(superseded);
  const supersededValues = [...supersededInventory.values()].filter((value) => value && !/^none$/i.test(value));
  const everySupersededCategoryIsNone = supersededValues.length === 0;
  if (/^N\/A\b/i.test(sweep)) {
    if (!everySupersededCategoryIsNone || !/because every superseded category is none/i.test(sweep)) {
      errors.push("Superseded-token sweep may be N/A only because every superseded category is none");
    }
    return;
  }

  const namesAllSupersededValues = supersededValues.every((value) => sweep.includes(value));
  const hasSearchCommand = /\b(?:rg|grep)\b/i.test(sweep);
  const classifiesActiveProof = /\b(?:no|0) active-proof hits\b/i.test(sweep);
  const classifiesHistoricalRed = /^none$/i.test(historicalRed) || /historical-red .+classified/i.test(sweep);
  if (!hasSearchCommand || !classifiesActiveProof || !classifiesHistoricalRed || !namesAllSupersededValues) {
    errors.push("Superseded-token sweep must name rg/grep, every superseded value, no active-proof hits, and classified historical-red hits");
  }
};
