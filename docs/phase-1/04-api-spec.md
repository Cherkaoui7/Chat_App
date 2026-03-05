# 04 - API Specification (MVP)

Base path: `/api`  
Auth: `Authorization: Bearer <token>` for protected routes  
Content type: `application/json` (multipart for avatar upload)

## Authentication

### `POST /api/register`

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "strong-password",
  "password_confirmation": "strong-password"
}
```

Response `201`:

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "last_seen": null
  },
  "token": "sanctum-token"
}
```

### `POST /api/login`

Request:

```json
{
  "email": "john@example.com",
  "password": "strong-password"
}
```

Response `200`: same shape as register.

### `POST /api/logout` (auth)

Response `200`:

```json
{
  "message": "Logged out"
}
```

### `GET /api/user` (auth)

Response `200`:

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": null,
  "last_seen": "2026-03-05T12:00:00Z"
}
```

## Users

### `GET /api/users` (auth)

Query:
- `page` (default 1)
- `per_page` (default 20, max 100)

### `GET /api/users/{id}` (auth)

### `GET /api/search-users` (auth)

Query:
- `q` required, min 2 chars
- `page`, `per_page`

## Conversations

### `POST /api/conversations` (auth)

Request:

```json
{
  "participant_id": 2
}
```

Behavior:
- For private chat, return existing conversation if same 2 users already have one.

### `GET /api/conversations` (auth)

Returns current user conversations sorted by latest message timestamp.

### `GET /api/conversations/{id}` (auth)

Returns conversation metadata and participants. Authorization required (member only).

## Messages

### `POST /api/messages` (auth)

Request:

```json
{
  "conversation_id": 10,
  "message": "Hello",
  "type": "text"
}
```

Validation:
- `conversation_id`: exists and belongs to current user
- `message`: required if `type = text`, max 5000 chars
- `type`: `text|image|file` (MVP uses `text`)

### `GET /api/messages/{conversation_id}` (auth)

Query:
- `page` default 1
- `per_page` default 30 max 100

Response includes:
- message list
- pagination meta

## Error Contract

All validation failures return `422`:

```json
{
  "message": "Validation failed",
  "errors": {
    "field": ["Error text"]
  }
}
```

All unauthorized access returns `401` or `403` with consistent `message` field.
