# DocVault

DocVault is a SaaS-style collaborative document editor built with React, TipTap, Express, SQLite, and Socket.IO. It supports personal documents, sharing, live multi-user sync, and version history restore.

## Features

- Real-time collaboration with Socket.IO rooms (`join-doc`, `content-change`, `receive-change`)
- Document CRUD with SQLite persistence
- Shared document access between users
- File import into editor (`.txt` and `.md`)
- Version history tracking on every update with timestamped snapshots
- Restore previous versions from a sidebar timeline
- Clean SaaS-style UI with active state, empty state, and saving/sync indicators

## Tech Stack

- Frontend: React (Vite), TipTap, Socket.IO Client, CSS
- Backend: Node.js, Express, Socket.IO, SQLite3, CORS

## Project Structure

```text
ajaia-docs/
├── client/
│   └── src/
│       ├── App.jsx
│       ├── Editor.jsx
│       ├── styles.css
│       ├── main.jsx
│       └── index.css
├── server/
│   ├── index.js
│   ├── package.json
│   └── docs.db (auto-created at runtime)
├── README.md
├── ARCHITECTURE.md
├── AI_USAGE.md
└── IMPROVEMENTS.md
```

## Local Setup

### Backend

```bash
cd server
npm install
node index.js
```

Run tests:

```bash
npm test
```

### Frontend

```bash
cd client
npm install
npm run dev
```
