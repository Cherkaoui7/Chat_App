# Phase 1 - Architecture and Planning

This folder is the Phase 1 build contract for the React + Laravel real-time chat MVP.

## Documents

1. `01-scope-mvp.md`
2. `02-system-architecture.md`
3. `03-database-schema.md`
4. `03-er-diagram.dbml`
5. `04-api-spec.md`
6. `05-realtime-events.md`
7. `06-folder-structure.md`
8. `07-security-plan.md`
9. `08-ui-wireframe.md`
10. `09-development-rules.md`

## Phase 1 Deliverables Checklist

- [x] Database schema
- [x] API endpoint list
- [x] System architecture
- [x] Folder structure
- [x] Socket event list
- [x] UI layout plan

## Decision Summary

- Frontend: React + Axios + Laravel Echo
- Backend: Laravel API + Broadcasting + Queues
- Real-time stack: Echo + Soketi + Redis (primary), Pusher fallback
- Database: MySQL (default for MVP)
- Auth: Laravel Sanctum
