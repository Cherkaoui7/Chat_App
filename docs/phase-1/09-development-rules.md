# 09 - Development Rules

These rules are mandatory for Phase 2+ implementation.

## Backend Rules

- Do not place socket logic inside controllers.
- Controllers must stay thin.
- Validate every input using Form Requests.
- Use policy checks for every conversation/message access.
- Use pagination for message retrieval.
- Keep business logic in services/actions.

## Frontend Rules

- Keep API calls in `services/api.ts` only.
- Keep socket setup in `services/socket.ts` and hooks.
- Do not duplicate server data models; use shared TypeScript interfaces.
- Handle reconnect and re-sync for socket disconnects.

## API Rules

- Keep a consistent JSON error format.
- Return correct HTTP status codes.
- Version breaking API changes using `/api/v1` strategy when needed.

## Data Rules

- Add DB indexes for all common query paths before load testing.
- Use transactions for multi-write operations.
- Avoid N+1 by eager loading relationships.

## Testing Rules

- Test API endpoints before integrating UI.
- Add unit tests for auth and message creation.
- Add integration tests for conversation and message APIs.
- Add E2E happy path for real-time send/receive.
