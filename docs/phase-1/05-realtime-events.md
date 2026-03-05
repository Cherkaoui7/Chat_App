# 05 - Real-Time Event Contract

## Stack

- Laravel Broadcasting
- Laravel Echo client
- Soketi server
- Redis pub/sub

## Channel Naming

- Private chat channel: `private-chat.{conversation_id}`
- Presence channel (online users): `presence-online`

## Authorization Rules

- `private-chat.{conversation_id}`: only conversation participants can subscribe.
- `presence-online`: authenticated users only.

## Events

### `MessageSent`

Channel: `private-chat.{conversation_id}`

Payload:

```json
{
  "event": "MessageSent",
  "conversation_id": 10,
  "message": {
    "id": 1001,
    "conversation_id": 10,
    "sender_id": 1,
    "message": "Hello",
    "type": "text",
    "seen": false,
    "created_at": "2026-03-05T13:00:00Z"
  }
}
```

### `UserTyping`

Channel: `private-chat.{conversation_id}`

Payload:

```json
{
  "event": "UserTyping",
  "conversation_id": 10,
  "user_id": 1,
  "is_typing": true
}
```

### `MessageRead`

Channel: `private-chat.{conversation_id}`

Payload:

```json
{
  "event": "MessageRead",
  "conversation_id": 10,
  "message_id": 1001,
  "reader_id": 2,
  "read_at": "2026-03-05T13:01:00Z"
}
```

### `UserOnline`

Channel: `presence-online`

Payload:

```json
{
  "event": "UserOnline",
  "user_id": 2,
  "last_seen": null
}
```

### `UserOffline`

Channel: `presence-online`

Payload:

```json
{
  "event": "UserOffline",
  "user_id": 2,
  "last_seen": "2026-03-05T13:02:00Z"
}
```

## Client Rules

- Ignore duplicated `MessageSent` events by message `id`.
- Re-sync conversation history from API on reconnect.
- Use exponential backoff for socket reconnect.
