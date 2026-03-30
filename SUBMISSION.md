# Submission Checklist

Candidate: Varun Sainani  
Assignment: Ajaia LLC - AI-Native Full Stack Developer Assignment

## Included Deliverables

- Source code (`client/` and `server/`)
- `README.md` (local setup and run instructions)
- `ARCHITECTURE.md` (architecture and data flow note)
- `AI_USAGE.md` (AI workflow note)
- `IMPROVEMENTS.md` (future scope and scaling ideas)
- `WALKTHROUGH_VIDEO_URL.txt` (video link placeholder)

## Core Requirements Status

1. Document creation/editing: **Complete**
   - create, rename, edit rich content, save, reopen
2. File upload/import: **Complete**
   - `.txt`/`.md` import into editor
3. Sharing model: **Complete**
   - owner + share to another user
   - separate owned/shared sections in UI
4. Persistence: **Complete**
   - SQLite stores docs + sharing + version history
5. Product and engineering quality: **Mostly Complete**
   - setup docs + validation/error handling + architecture note
   - at least one automated test included (`server/test/history.test.js`)

## Stretch Features Implemented

- Real-time collaboration with Socket.IO room model
- Version history with timestamped restore
- UI polish for SaaS-style experience

## Known Scope Limits

- Simulated users (`user1` and `user2`) instead of full auth
- File import supports `.txt` and `.md` only (not `.docx`)
- Collaboration is room-based full-content sync (not CRDT cursors)

## If Additional 2-4 Hours Were Available

- Add login and identity-aware sharing UI
- Add richer file parsing (`.docx`) and attachment support
- Add end-to-end API/integration tests
- Add presence indicators (who is editing now)
