# Phase 3 - Real-Time Messaging

This phase adds WebSocket broadcasting for instant message delivery.

## Backend Changes Implemented

- Broadcasting driver configured to Pusher protocol in:
  - `chat-backend/.env`
  - `chat-backend/.env.example`
  - `chat-backend/config/broadcasting.php`
- Private channel authorization added in:
  - `chat-backend/routes/channels.php`
- Real-time events added:
  - `App\Events\MessageSent`
  - `App\Events\UserTyping`
  - `App\Events\UserOnline`
  - `App\Events\UserOffline`
- Message send endpoint now broadcasts `MessageSent`.
- Typing endpoint added:
  - `POST /api/conversations/{conversation}/typing`
- Login/logout now broadcast online/offline presence events.

## Run Soketi (Docker)

```powershell
docker run --rm -p 6001:6001 `
  -e SOKETI_DEBUG=1 `
  -e SOKETI_DEFAULT_APP_ID=app-id `
  -e SOKETI_DEFAULT_APP_KEY=app-key `
  -e SOKETI_DEFAULT_APP_SECRET=app-secret `
  quay.io/soketi/soketi:latest
```

## Backend Run

```powershell
cd chat-backend
php artisan optimize:clear
php artisan serve
```

## Expected Real-Time Channels

- Private chat: `private-chat.{conversationId}` at Echo level as `private('chat.{conversationId}')`
- Presence: `presence-online` at Echo level as `join('online')`

## Frontend Integration

Use the sample file:

- `docs/phase-3/react-socket.example.js`

The client must send Bearer token to `/broadcasting/auth`.
