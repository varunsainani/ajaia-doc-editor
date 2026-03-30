# Improvements

## Future Scope

- Real authentication with JWT/session and role-based access.
- Presence indicators (who is editing) and cursor-level collaboration.
- Rich comments, mentions, and inline suggestions.
- Folder/workspace support for organizing documents.

## Scaling Ideas

- Move from SQLite to PostgreSQL for multi-instance production workloads.
- Add Redis for Socket.IO adapter and distributed room broadcasting.
- Introduce background jobs for analytics, backups, and audit logs.
- Add CDN and edge caching for static frontend delivery.

## Performance Enhancements

- Debounce autosave and send minimal diff patches instead of full HTML payload.
- Add document pagination/lazy loading for large doc lists/history entries.
- Optimize editor updates using collaborative CRDT/OT libraries (e.g., Yjs).
- Add indexes on `docs.owner`, `shares.user`, and `docs.updated_at`.

## Reliability and Ops

- Add structured logging and request tracing.
- Add integration tests for REST and socket flows.
- Add health checks and uptime monitoring for backend service.
- Add backup/restore strategy for persistent storage.
