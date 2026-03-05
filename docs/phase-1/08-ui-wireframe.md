# 08 - UI Wireframe Plan (MVP)

## Main Chat Layout

```text
+---------------------------------------------------------------+
| Header: App name | Search users | Profile menu               |
+-------------------+-------------------------------------------+
| Chat List         | Chat Window                               |
|                   |                                           |
| User A            | Message stream                            |
| User B            | [10:10] Hi                                |
| User C            | [10:11] Hello                             |
|                   |                                           |
|                   | Typing / status                           |
+-------------------+-------------------------------------------+
| Message input (text)                                [Send]    |
+---------------------------------------------------------------+
```

## Page Inventory

- `/login`
- `/register`
- `/chat` (main dashboard)
- `/profile`

## Core Components

- `ChatSidebar`
- `ChatWindow`
- `MessageList`
- `MessageItem`
- `MessageInput`
- `UserSearch`
- `PresenceBadge`

## Responsive Behavior

- Desktop: split layout (sidebar + chat panel).
- Mobile: stacked view with conversation list screen and chat screen.
- Keep message input sticky at bottom.

## MVP UX Rules

- Disable send button when message is empty.
- Show optimistic message bubble while waiting API confirmation.
- Display server timestamp and sender alignment.
- Show online/offline badge near participant name.
