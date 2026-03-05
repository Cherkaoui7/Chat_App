# 03 - Database Schema

## Engine

- Default: MySQL 8+
- Charset: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

## Tables

### users

| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK, auto increment |
| name | varchar(120) | not null |
| email | varchar(255) | not null, unique |
| password | varchar(255) | not null |
| avatar | varchar(500) | nullable |
| last_seen | timestamp | nullable, indexed |
| created_at | timestamp | not null |
| updated_at | timestamp | not null |

Indexes:
- `users_email_unique (email)`
- `users_last_seen_index (last_seen)`

### conversations

| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK, auto increment |
| type | enum('private','group') | default 'private', indexed |
| created_at | timestamp | not null |
| updated_at | timestamp | not null |

Indexes:
- `conversations_type_index (type)`

### conversation_user

| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK, auto increment |
| conversation_id | bigint unsigned | FK -> conversations.id, cascade delete |
| user_id | bigint unsigned | FK -> users.id, cascade delete |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

Indexes:
- `conversation_user_unique (conversation_id, user_id)` unique
- `conversation_user_user_index (user_id)`

### messages

| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK, auto increment |
| conversation_id | bigint unsigned | FK -> conversations.id, cascade delete, indexed |
| sender_id | bigint unsigned | FK -> users.id, restrict delete, indexed |
| message | text | not null |
| type | enum('text','image','file') | default 'text', indexed |
| seen | boolean | default false, indexed |
| created_at | timestamp | not null, indexed |
| updated_at | timestamp | not null |

Indexes:
- `messages_conversation_created_index (conversation_id, created_at, id)`
- `messages_sender_index (sender_id)`

## Relationship Rules

- A private conversation must have exactly 2 users in `conversation_user`.
- A user can belong to many conversations.
- A conversation can have many messages.
- A message has exactly 1 sender.

## Pagination Baseline

- Default message page size: 30
- Max page size: 100
- Direction: reverse chronological fetch, then reverse in client for display
