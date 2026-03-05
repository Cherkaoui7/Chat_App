# 01 - MVP Scope

## Objective

Deliver a secure first version of a real-time web chat where authenticated users can run private conversations and exchange text messages with live updates.

## In Scope (MVP)

### User System

- Register
- Login
- Logout
- Get current user profile
- Update profile (name, avatar)

### Chat System

- Private chat (1-to-1)
- Send text message
- Receive message in real-time
- Fetch message history
- Show message timestamps

### UI

- Chat list
- Chat window
- Message input
- User search

### Real-Time

- Message broadcast
- Online/offline presence

## Out of Scope (Post-MVP)

- Group chats
- Media and file messages
- Message edit/delete/reply/reactions
- Typing indicator
- Read receipts
- Push notifications
- Admin moderation tools

## MVP Success Criteria

- User can register and login.
- User can search another user and start a private conversation.
- User can send and receive text messages in under 500ms in normal network conditions.
- Message history is paginated and ordered consistently.
- Presence status updates without page refresh.
