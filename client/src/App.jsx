import { useEffect, useMemo, useState } from "react";
import Editor from "./Editor";
import { io } from "socket.io-client";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_BASE_URL);

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p>Start writing...</p>");
  const [docId, setDocId] = useState(null);
  const [history, setHistory] = useState([]);

  const [docs, setDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const activeDocLabel = useMemo(() => {
    if (!docId) return "No active document";
    return `Active doc #${docId}`;
  }, [docId]);

  const fetchDocs = async () => {
    const res = await fetch(`${API_BASE_URL}/docs/user1`);
    const data = await res.json();
    setDocs(data);
  };

  const fetchSharedDocs = async () => {
    const res = await fetch(`${API_BASE_URL}/shared/user2`);
    const data = await res.json();
    setSharedDocs(data);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchDocs();
      await fetchSharedDocs();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (docId) {
      socket.emit("join-doc", docId);
    }
  }, [docId]);

  useEffect(() => {
    const handleReceiveChange = (payload) => {
      if (!payload || payload.docId !== docId) return;
      setIsReceiving(true);
      setContent(payload.content || "<p></p>");
      setTimeout(() => setIsReceiving(false), 400);
    };

    socket.on("receive-change", handleReceiveChange);
    return () => socket.off("receive-change", handleReceiveChange);
  }, [docId]);

  const saveDocument = async () => {
    setSaving(true);

    if (docId === null) {
      const res = await fetch(`${API_BASE_URL}/docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          owner: "user1",
        }),
      });

      const data = await res.json();
      setDocId(data.id);
      setHistory(data.history || []);
    } else {
      const res = await fetch(`${API_BASE_URL}/docs/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      setHistory(data.history || []);
    }

    await fetchDocs();
    setSaving(false);
  };

  const openDoc = (doc) => {
    setTitle(doc.title);
    setContent(doc.content);
    setDocId(doc.id);
    setHistory(doc.history || []);
  };

  const shareDoc = async (id) => {
    await fetch(`${API_BASE_URL}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doc_id: id,
        user: "user2",
      }),
    });

    fetchSharedDocs();
  };

  const newDoc = () => {
    setTitle("");
    setContent("<p>Start writing...</p>");
    setDocId(null);
    setHistory([]);
  };

  const handleContentChange = (nextContent) => {
    setContent(nextContent);
    if (!docId) return;
    socket.emit("content-change", { docId, content: nextContent });
  };

  const restoreVersion = (version) => {
    setContent(version.content || "<p></p>");
  };

  const plainTextToHtml = (value) => {
    const escaped = value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    const paragraphs = escaped
      .split(/\r?\n\r?\n/)
      .map((chunk) => chunk.replaceAll("\n", "<br/>"));
    return paragraphs.map((chunk) => `<p>${chunk || "<br/>"}</p>`).join("");
  };

  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const supportedTypes = [".txt", ".md"];
    const lowerName = file.name.toLowerCase();
    const isSupported = supportedTypes.some((ext) => lowerName.endsWith(ext));
    if (!isSupported) {
      setUploadMessage("Unsupported file type. Use .txt or .md only.");
      event.target.value = "";
      return;
    }

    const text = await file.text();
    setContent(plainTextToHtml(text));
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    setUploadMessage(`Imported ${file.name} into editor.`);
    event.target.value = "";
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Docs</h2>
          <button onClick={newDoc} className="primary-btn">
            + New Document
          </button>
        </div>

        <section className="sidebar-section">
          <p className="section-label">My Documents</p>
          {docs.length === 0 && <p className="empty-note">No documents yet</p>}
          {docs.map((doc) => (
            <div key={doc.id} className="doc-row">
              <button
                className={`doc-card ${doc.id === docId ? "active" : ""}`}
                onClick={() => openDoc(doc)}
              >
                <span className="doc-title">📄 {doc.title || "Untitled"}</span>
                <span className="doc-meta">Owner: {doc.owner}</span>
              </button>
              <button onClick={() => shareDoc(doc.id)} className="ghost-btn">
                Share
              </button>
            </div>
          ))}
        </section>

        <section className="sidebar-section">
          <p className="section-label">Shared With Me</p>
          {sharedDocs.length === 0 && (
            <p className="empty-note">No shared docs yet</p>
          )}
          {sharedDocs.map((doc) => (
            <button
              key={doc.id}
              className={`doc-card ${doc.id === docId ? "active" : ""}`}
              onClick={() => openDoc(doc)}
            >
              <span className="doc-title">📄 {doc.title || "Untitled"}</span>
              <span className="doc-meta">From: {doc.owner}</span>
            </button>
          ))}
        </section>

        <section className="sidebar-section history-panel">
          <p className="section-label">Version History</p>
          {history.length === 0 && (
            <p className="empty-note">
              No versions yet. Save to create history.
            </p>
          )}
          {history
            .slice()
            .reverse()
            .map((version, index) => (
              <button
                key={`${version.timestamp}-${index}`}
                className="history-item"
                onClick={() => restoreVersion(version)}
              >
                {new Date(version.timestamp).toLocaleString()}
              </button>
            ))}
        </section>
      </aside>

      <main className="editor-area">
        <div className="editor-wrap">
          <div className="editor-header">
            <div>
              <h1>DocVault</h1>
              <small className="subtext">Collaborative document editor</small>
            </div>
            <span className="active-indicator">{activeDocLabel}</span>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title..."
            className="title-input"
          />

          <div className="upload-row">
            <label htmlFor="doc-upload" className="ghost-btn upload-label">
              Import .txt/.md
            </label>
            <input
              id="doc-upload"
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              onChange={handleFileImport}
              className="hidden-upload"
            />
            {uploadMessage ? (
              <span className="status-text">{uploadMessage}</span>
            ) : null}
          </div>

          <Editor content={content} onChange={handleContentChange} />

          <div className="editor-footer">
            <button onClick={saveDocument} className="primary-btn save-btn">
              Save
            </button>

            <span className="status-text">
              {saving
                ? "Saving..."
                : isReceiving
                  ? "Synced live update"
                  : "All changes saved"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
