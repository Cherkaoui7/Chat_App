# 06 - Folder Structure Plan

## Backend (Laravel)

```text
app/
  Actions/
  Events/
    MessageSent.php
    MessageRead.php
    UserTyping.php
    UserOnline.php
    UserOffline.php
  Http/
    Controllers/Api/
      AuthController.php
      UserController.php
      ConversationController.php
      MessageController.php
    Requests/
      Auth/
      Conversation/
      Message/
      User/
  Models/
    User.php
    Conversation.php
    Message.php
  Policies/
  Services/
  Support/

routes/
  api.php
  channels.php

database/
  migrations/
  seeders/
```

### Backend Structure Rules

- Controllers only coordinate request -> service/action -> response.
- Validation stays in Form Requests.
- Policies guard all conversation/message access.
- Events contain broadcast payload only, no business logic.

## Frontend (React)

```text
src/
  app/
    router/
    providers/
  components/
    chat/
      ChatSidebar/
      ChatWindow/
      MessageList/
      MessageInput/
    users/
      UserSearch/
    common/
  pages/
    Login/
    Register/
    Chat/
    Profile/
  hooks/
    useAuth.ts
    useConversations.ts
    useMessages.ts
    usePresence.ts
  services/
    api.ts
    socket.ts
  store/
  types/
  utils/
```

### Frontend Structure Rules

- UI components do not call Axios directly; use `services` + hooks.
- Socket subscriptions/unsubscriptions stay inside hooks.
- Keep API DTO types in `types/` to prevent shape drift.
