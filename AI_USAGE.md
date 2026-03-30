# AI Usage

## Where AI Was Used

- Implementing Socket.IO room-based collaboration wiring in frontend and backend.
- Building backend SQLite route logic for document CRUD, sharing, and history storage.
- Refactoring frontend UI to polished SaaS-style layout and state indicators.
- Generating project documentation files for submission.

## What Was Generated

- Code scaffolding for:
  - Socket event handlers (`join-doc`, `content-change`, `receive-change`)
  - REST endpoint logic for docs/share/history
  - Sidebar version history restore panel
  - CSS styling for polished UI
- Draft technical documentation content for architecture and improvements.

## What Was Modified Manually

- Endpoint compatibility details to preserve existing client/server route patterns.
- UI behavior details (active document indicator, saving/sync text, empty states).
- Document wording and project-specific structure sections.

## Validation Steps

- Frontend build/lint checks.
- Backend syntax/startup checks.
- Manual flow verification:
  - open doc -> join room
  - edit content -> live sync
  - save doc -> history entry
  - restore history version -> editor content update
