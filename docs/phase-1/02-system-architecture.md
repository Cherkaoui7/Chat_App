# 02 - System Architecture

## High-Level Flow

```text
React Frontend
     |
     | HTTPS REST API
     v
Laravel Backend
     |
     | Broadcast Events
     v
WebSocket Server (Soketi)
     |
     v
React Frontend (Echo subscriptions)

Laravel Backend <-> MySQL
Laravel Backend <-> Redis (cache, queue, pub/sub)
```

## Component Responsibilities

### React Frontend

- Render UI and manage client state.
- Authenticate and call REST endpoints using Axios.
- Subscribe to private/presence channels with Laravel Echo.
- Render message and presence updates in real-time.

### Laravel Backend

- Authenticate users with Sanctum.
- Validate requests and enforce authorization policies.
- Handle database CRUD operations.
- Dispatch broadcast events and queue jobs.

### WebSocket Server (Soketi)

- Maintain socket connections.
- Broadcast events to channel subscribers.
- Support private and presence channel authorization via Laravel.

### MySQL

- Persist users, conversations, and messages.
- Provide indexed reads for chat list and message history.

### Redis

- Queue backend jobs.
- Support broadcasting/pub-sub.
- Optional cache for hot conversation reads.

## Key Technical Decisions

- API style: REST for CRUD, WebSocket for push updates.
- Real-time choice: Echo + Soketi + Redis.
- Authentication: Sanctum personal access/session tokens.
- Message ordering: `messages.created_at`, tie-break by `messages.id`.

## Phase 2 Constraints

- Controllers remain thin; business logic goes to services/actions.
- No socket code in controllers besides event dispatching.
- All external payloads pass form request validation.
