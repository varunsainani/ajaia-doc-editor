# Architecture

## Frontend Structure

- `client/src/App.jsx`
  - Owns app state (`docs`, `sharedDocs`, `docId`, `title`, `content`, `history`, status flags)
  - Fetches REST data from backend
  - Emits and receives Socket.IO events for real-time collaboration
  - Renders sidebar (docs/shared docs/history) and editor shell
- `client/src/Editor.jsx`
  - TipTap editor wrapper
  - Emits content updates via `onChange`
  - Applies incoming remote content safely with `emitUpdate: false`
- `client/src/styles.css`
  - UI layout, cards, toolbar, states

## Backend Structure

- `server/index.js`
  - Express API + SQLite persistence
  - HTTP server + Socket.IO server
  - Endpoints:
    - `POST /docs`
    - `GET /docs/:owner`
    - `PUT /docs/:id`
    - `POST /share`
    - `GET /shared/:user`
  - SQLite tables:
    - `docs` (title/content/owner/history/timestamps)
    - `shares` (doc_id, user)

## Socket.IO Flow

1. User opens doc in frontend.
2. Frontend emits `join-doc` with doc id.
3. Server joins socket to room = doc id.
4. On editor change, frontend emits `content-change` with `{ docId, content }`.
5. Server broadcasts `receive-change` to room except sender.
6. Other clients update editor content in real time.

## Version History Flow

1. Frontend saves document (`PUT /docs/:id`).
2. Backend reads current document from DB.
3. Backend appends previous content with current timestamp to `history`.
4. Backend saves new content and updated history.
5. Frontend renders history timeline and supports restore-to-editor.

## Data Flow Diagram (Text)

```text
[TipTap Editor]
      |
      | onChange
      v
[App State: content] ---- emit ----> [Socket.IO Server Room(docId)]
      ^                                    |
      |                                    | broadcast
      |                                    v
 setContent <---- receive-change ---- [Other Clients in Room]

[App Save Button] --> [PUT /docs/:id] --> [Express Route]
                                         -> [Read old doc]
                                         -> [Append history[]]
                                         -> [Update docs table]
                                         -> [Return updated history]
```
