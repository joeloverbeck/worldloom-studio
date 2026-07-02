import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { HealthPayload, LinkTypeDefinition, RecordTypeDefinition } from "@worldloom/shared";
import "./styles.css";

interface RecordRow {
  id: number;
  shortId: string;
  recordTypeKey: string;
  title: string;
  body: string;
  truthLayer: string | null;
  canonStatus: string | null;
  updatedAt: string;
}

interface VocabularyTerm {
  vocabulary: string;
  term: string;
}

interface RecentWorld {
  path: string;
  openedAt: string;
}

interface LinkRow {
  id: number;
  fromRecordId: number;
  toRecordId: number;
  linkTypeKey: string;
  note: string;
  depth?: number;
}

const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const token = localStorage.getItem("worldloom-token");
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-worldloom-token": token } : {}),
      ...init?.headers
    }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? response.statusText);
  return payload as T;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("worldloom-token") ?? "");
  const [worldPath, setWorldPath] = useState("");
  const [openWorld, setOpenWorld] = useState<string | null>(null);
  const [recordTypes, setRecordTypes] = useState<RecordTypeDefinition[]>([]);
  const [linkTypes, setLinkTypes] = useState<LinkTypeDefinition[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [recentWorlds, setRecentWorlds] = useState<RecentWorld[]>([]);
  const [terms, setTerms] = useState<VocabularyTerm[]>([]);
  const [message, setMessage] = useState("");
  const [serverVersion, setServerVersion] = useState("");
  const [search, setSearch] = useState("");
  const [snapshotPath, setSnapshotPath] = useState("");
  const [recordTypeKey, setRecordTypeKey] = useState("canon_fact");
  const [promotionRecordTypeKey, setPromotionRecordTypeKey] = useState("canon_fact");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [truthLayer, setTruthLayer] = useState("");
  const [canonStatus, setCanonStatus] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fromRecordId, setFromRecordId] = useState("");
  const [toRecordId, setToRecordId] = useState("");
  const [linkTypeKey, setLinkTypeKey] = useState("depends_on");

  const truthLayers = useMemo(() => terms.filter((term) => term.vocabulary === "truth_layer"), [terms]);
  const canonStatuses = useMemo(() => terms.filter((term) => term.vocabulary === "canon_status"), [terms]);
  const recordTypeByKey = useMemo(() => new Map(recordTypes.map((recordType) => [recordType.key, recordType])), [recordTypes]);
  const selectedRecordType = editingId == null ? null : recordTypeByKey.get(recordTypeKey);
  const editingReportRecord = selectedRecordType?.mutationRegime === "report";
  const canSaveRecord = Boolean(openWorld && title.trim() && truthLayer && canonStatus && !editingReportRecord);

  useEffect(() => {
    if (!token) return;
    api<HealthPayload>("/api/health")
      .then((health) => setServerVersion(health.version))
      .catch((error: Error) => setMessage(error.message));
    api<{ recordTypes: RecordTypeDefinition[]; linkTypes: LinkTypeDefinition[] }>("/api/catalog")
      .then((catalog) => {
        setRecordTypes(catalog.recordTypes);
        setLinkTypes(catalog.linkTypes);
        setRecordTypeKey(catalog.recordTypes[0]?.key ?? "canon_fact");
        setPromotionRecordTypeKey(catalog.recordTypes.find((recordType) => recordType.key === "canon_fact")?.key ?? catalog.recordTypes[0]?.key ?? "canon_fact");
        setLinkTypeKey(catalog.linkTypes[0]?.key ?? "depends_on");
        return loadRecentWorlds();
      })
      .catch((error: Error) => setMessage(error.message));
  }, [token]);

  const rememberToken = (next: string) => {
    setToken(next);
    localStorage.setItem("worldloom-token", next);
  };

  const refreshRecords = async () => {
    const payload = await api<{ records: RecordRow[] }>("/api/records");
    setRecords(payload.records);
    await refreshLinks();
  };

  const refreshLinks = async () => {
    const payload = await api<{ links: LinkRow[] }>("/api/links");
    setLinks(payload.links);
  };

  const loadVocabularies = async () => {
    const payload = await api<{ terms: VocabularyTerm[] }>("/api/vocabularies");
    setTerms(payload.terms);
  };

  const loadRecentWorlds = async () => {
    const payload = await api<{ recentWorlds: RecentWorld[] }>("/api/recent-worlds");
    setRecentWorlds(payload.recentWorlds);
  };

  const createOrOpen = async (mode: "create" | "open", selectedPath = worldPath) => {
    const payload = await api<{ path: string; records: RecordRow[] }>(`/api/worlds/${mode}`, {
      method: "POST",
      body: JSON.stringify({ path: selectedPath })
    });
    setOpenWorld(payload.path);
    setRecords(payload.records);
    setLinks([]);
    await loadVocabularies();
    await refreshLinks();
    await loadRecentWorlds();
    setMessage(`${mode === "create" ? "Created" : "Opened"} ${payload.path}`);
  };

  const saveRecord = async () => {
    const payload = await api<{ record: RecordRow }>(editingId == null ? "/api/records" : `/api/records/${editingId}`, {
      method: editingId == null ? "POST" : "PATCH",
      body: JSON.stringify({ recordTypeKey, title, body, truthLayer: truthLayer || null, canonStatus: canonStatus || null })
    });
    setMessage(`Saved ${payload.record.shortId}`);
    setEditingId(null);
    setTitle("");
    setBody("");
    setTruthLayer("");
    setCanonStatus("");
    await refreshRecords();
  };

  const editRecord = (record: RecordRow) => {
    setEditingId(record.id);
    setRecordTypeKey(record.recordTypeKey);
    setTitle(record.title);
    setBody(record.body);
    setTruthLayer(record.truthLayer ?? "");
    setCanonStatus(record.canonStatus ?? "");
  };

  const runSearch = async () => {
    const payload = await api<{ records: RecordRow[] }>(`/api/search?q=${encodeURIComponent(search)}`);
    setRecords(payload.records);
  };

  const createLink = async () => {
    await api("/api/links", {
      method: "POST",
      body: JSON.stringify({
        fromRecordId: Number(fromRecordId),
        toRecordId: Number(toRecordId),
        linkTypeKey
      })
    });
    setMessage("Link recorded");
    await refreshLinks();
  };

  const traverseLinks = async () => {
    const payload = await api<{ links: LinkRow[] }>(`/api/links/traverse?recordId=${encodeURIComponent(fromRecordId)}&linkTypeKey=${encodeURIComponent(linkTypeKey)}`);
    setLinks(payload.links);
    setMessage(`Traversal returned ${payload.links.length} link${payload.links.length === 1 ? "" : "s"}`);
  };

  const promoteRecord = async (record: RecordRow) => {
    const payload = await api<{ record: RecordRow }>(`/api/records/${record.id}/promote`, {
      method: "POST",
      body: JSON.stringify({ recordTypeKey: promotionRecordTypeKey })
    });
    setMessage(`Promoted ${payload.record.shortId} to ${payload.record.recordTypeKey}`);
    await refreshRecords();
  };

  const snapshot = async () => {
    const payload = await api<{ path: string }>("/api/worlds/snapshot", {
      method: "POST",
      body: JSON.stringify({ destinationPath: snapshotPath || undefined })
    });
    setMessage(`Snapshot written to ${payload.path}`);
  };

  return (
    <main>
      <header className="topbar">
        <div>
          <h1>Worldloom Studio</h1>
          <p>{serverVersion ? `Server ${serverVersion} · ` : ""}{openWorld ?? "No world file open"}</p>
        </div>
        <input aria-label="Worldloom token" placeholder="server token" value={token} onChange={(event) => rememberToken(event.target.value)} />
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <label>
            World file path
            <input value={worldPath} onChange={(event) => setWorldPath(event.target.value)} placeholder="/tmp/example.worldloom.sqlite" />
          </label>
          <div className="row">
            <button onClick={() => createOrOpen("create")}>Create</button>
            <button onClick={() => createOrOpen("open")}>Open</button>
          </div>
          <label>
            Snapshot path
            <input value={snapshotPath} onChange={(event) => setSnapshotPath(event.target.value)} placeholder="/tmp/example.snapshot.sqlite" />
          </label>
          <button onClick={snapshot} disabled={!openWorld}>Snapshot</button>

          <div className="recent">
            {recentWorlds.map((recent) => (
              <button key={recent.path} onClick={() => { setWorldPath(recent.path); void createOrOpen("open", recent.path); }} title={recent.openedAt}>
                {recent.path}
              </button>
            ))}
          </div>

          <label>
            Search
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="record title or prose" />
          </label>
          <div className="row">
            <button onClick={runSearch} disabled={!openWorld}>Search</button>
            <button onClick={refreshRecords} disabled={!openWorld}>All</button>
          </div>

          <label>
            Link from
            <input value={fromRecordId} onChange={(event) => setFromRecordId(event.target.value)} placeholder="record id" />
          </label>
          <label>
            Link to
            <input value={toRecordId} onChange={(event) => setToRecordId(event.target.value)} placeholder="record id" />
          </label>
          <label>
            Link type
            <select value={linkTypeKey} onChange={(event) => setLinkTypeKey(event.target.value)}>
              {linkTypes.map((linkType) => <option key={linkType.key} value={linkType.key}>{linkType.label}</option>)}
            </select>
          </label>
          <label>
            Promotion target
            <select value={promotionRecordTypeKey} onChange={(event) => setPromotionRecordTypeKey(event.target.value)}>
              {recordTypes.filter((recordType) => recordType.mutationRegime === "card").map((recordType) => (
                <option key={recordType.key} value={recordType.key}>{recordType.label}</option>
              ))}
            </select>
          </label>
          <button onClick={createLink} disabled={!openWorld}>Create Link</button>
          <button onClick={traverseLinks} disabled={!openWorld || !fromRecordId}>Traverse</button>
        </aside>

        <section className="editor">
          <div className="panel">
            <h2>{editingId == null ? "New record" : `Editing record ${editingId}`}</h2>
            {editingReportRecord && <p className="status">Report-regime records are append-only and view-only after creation.</p>}
            <div className="grid">
              <label>
                Record type
                <select value={recordTypeKey} onChange={(event) => setRecordTypeKey(event.target.value)} disabled={editingId != null}>
                  {recordTypes.map((recordType) => <option key={recordType.key} value={recordType.key}>{recordType.label} ({recordType.mutationRegime})</option>)}
                </select>
              </label>
              <label>
                Truth layer
                <select value={truthLayer} onChange={(event) => setTruthLayer(event.target.value)} disabled={editingReportRecord}>
                  <option></option>
                  {truthLayers.map((term) => <option key={term.term}>{term.term}</option>)}
                </select>
              </label>
              <label>
                Canon status
                <select value={canonStatus} onChange={(event) => setCanonStatus(event.target.value)} disabled={editingReportRecord}>
                  <option></option>
                  {canonStatuses.map((term) => <option key={term.term}>{term.term}</option>)}
                </select>
              </label>
            </div>
            <label>
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} disabled={editingReportRecord} />
            </label>
            <label>
              Prose
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={10} disabled={editingReportRecord} />
            </label>
            <div className="row">
              <button onClick={saveRecord} disabled={!canSaveRecord}>Save Record</button>
              <button onClick={() => { setEditingId(null); setTitle(""); setBody(""); setTruthLayer(""); setCanonStatus(""); }}>Clear</button>
            </div>
          </div>

          {message && <p className="status">{message}</p>}

          <div className="records">
            {records.map((record) => (
              <article key={record.id}>
                <button onClick={() => editRecord(record)}>Edit</button>
                {recordTypeByKey.get(record.recordTypeKey)?.mutationRegime === "card" && (
                  <button className="promote" onClick={() => promoteRecord(record)}>Promote</button>
                )}
                <h3>{record.shortId} · {record.title}</h3>
                <p className="meta">{record.recordTypeKey} · {record.updatedAt}</p>
                <p>{record.body || "No prose yet."}</p>
              </article>
            ))}
          </div>
          {links.length > 0 && (
            <div className="links">
              <h2>Links</h2>
              {links.map((link) => (
                <p key={`${link.id}-${link.depth ?? 0}`}>
                  {link.depth ? `${link.depth}. ` : ""}{link.fromRecordId} {link.linkTypeKey} {link.toRecordId}{link.note ? ` · ${link.note}` : ""}
                </p>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
