import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export function buildEcho(token) {
  return new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: import.meta.env.VITE_PUSHER_HOST ?? "127.0.0.1",
    wsPort: Number(import.meta.env.VITE_PUSHER_PORT ?? 6001),
    wssPort: Number(import.meta.env.VITE_PUSHER_PORT ?? 6001),
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? "http") === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: "/broadcasting/auth",
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });
}

// Chat messages
// echo.private(`chat.${conversationId}`).listen("MessageSent", ({ message }) => {
//   setMessages((prev) => [...prev, message]);
// });

// Typing indicator
// echo.private(`chat.${conversationId}`).listen("UserTyping", (payload) => {
//   setTyping(payload.is_typing);
// });

// Presence
// echo.join("online")
//   .here((users) => setOnlineUsers(users))
//   .joining((user) => addOnlineUser(user))
//   .leaving((user) => removeOnlineUser(user));
