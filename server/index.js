const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const { parseHistory, appendHistoryEntry } = require("./history");

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

const app = express();
app.use(
  cors({
    origin: CLIENT_ORIGIN === "*" ? true : CLIENT_ORIGIN,
  }),
);
app.use(express.json());

const db = new sqlite3.Database("./docs.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      owner TEXT NOT NULL,
      history TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id INTEGER NOT NULL,
      user TEXT NOT NULL,
      UNIQUE(doc_id, user),
      FOREIGN KEY(doc_id) REFERENCES docs(id)
    )
  `);
});

// -------------------- DOC ROUTES --------------------
app.post("/docs", (req, res) => {
  const { title = "", content = "", owner } = req.body;

  if (!owner) {
    return res.status(400).json({ error: "owner is required" });
  }

  const now = new Date().toISOString();
  db.run(
    `
      INSERT INTO docs (title, content, owner, history, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [title, content, owner, "[]", now, now],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: "Failed to create document" });
      }

      return res.status(201).json({
        id: this.lastID,
        title,
        content,
        owner,
        history: [],
        created_at: now,
        updated_at: now,
      });
    },
  );
});

app.get("/docs/:owner", (req, res) => {
  const { owner } = req.params;
  db.all(
    `
      SELECT id, title, content, owner, history, created_at, updated_at
      FROM docs
      WHERE owner = ?
      ORDER BY updated_at DESC
    `,
    [owner],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch documents" });
      }

      const docs = rows.map((doc) => ({
        ...doc,
        history: parseHistory(doc.history),
      }));
      return res.json(docs);
    },
  );
});

app.put("/docs/:id", (req, res) => {
  const { id } = req.params;
  const { title = "", content = "" } = req.body;

  // Phase 3B: read existing doc -> append old content to history -> save with timestamp.
  db.get(`SELECT * FROM docs WHERE id = ?`, [id], (getErr, existingDoc) => {
    if (getErr) {
      return res.status(500).json({ error: "Failed to fetch existing document" });
    }

    if (!existingDoc) {
      return res.status(404).json({ error: "Document not found" });
    }

    const history = appendHistoryEntry(
      parseHistory(existingDoc.history),
      existingDoc.content || "",
    );

    const now = new Date().toISOString();
    db.run(
      `
        UPDATE docs
        SET title = ?, content = ?, history = ?, updated_at = ?
        WHERE id = ?
      `,
      [title, content, JSON.stringify(history), now, id],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: "Failed to update document" });
        }

        return res.json({
          id: Number(id),
          title,
          content,
          history,
          updated_at: now,
        });
      },
    );
  });
});

app.post("/share", (req, res) => {
  const { doc_id, user } = req.body;
  if (!doc_id || !user) {
    return res.status(400).json({ error: "doc_id and user are required" });
  }

  db.run(
    `
      INSERT OR IGNORE INTO shares (doc_id, user)
      VALUES (?, ?)
    `,
    [doc_id, user],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to share document" });
      }

      return res.json({ ok: true });
    },
  );
});

app.get("/shared/:user", (req, res) => {
  const { user } = req.params;
  db.all(
    `
      SELECT d.id, d.title, d.content, d.owner, d.history, d.created_at, d.updated_at
      FROM docs d
      INNER JOIN shares s ON d.id = s.doc_id
      WHERE s.user = ?
      ORDER BY d.updated_at DESC
    `,
    [user],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch shared documents" });
      }

      const docs = rows.map((doc) => ({
        ...doc,
        history: parseHistory(doc.history),
      }));
      return res.json(docs);
    },
  );
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN === "*" ? true : CLIENT_ORIGIN,
  },
});

// -------------------- SOCKET LOGIC --------------------
io.on("connection", (socket) => {
  socket.on("join-doc", (docId) => {
    if (docId) {
      socket.join(String(docId));
    }
  });

  socket.on("content-change", ({ docId, content }) => {
    if (!docId) return;
    socket.to(String(docId)).emit("receive-change", { docId, content });
  });
});

// -------------------- START SERVER --------------------
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
