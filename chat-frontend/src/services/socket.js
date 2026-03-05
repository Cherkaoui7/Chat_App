import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

let echo = null;

export const connectSocket = () => {
  if (echo) return echo;

  const token = localStorage.getItem("token");
  const wsHost = import.meta.env.VITE_PUSHER_HOST || '127.0.0.1';
  const wsPort = import.meta.env.VITE_PUSHER_PORT || 6001;
  const appKey = import.meta.env.VITE_PUSHER_APP_KEY || 'app-key';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  echo = new Echo({
    broadcaster: "pusher",
    key: appKey,
    wsHost: wsHost,
    wsPort: wsPort,
    forceTLS: false,
    disableStats: true,
    cluster: "mt1",
    authorizer: (channel, options) => {
      return {
        authorize: (socketId, callback) => {
          fetch(`${apiUrl}/api/broadcasting/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then((response) => response.json())
            .then((data) => callback(false, data))
            .catch((error) => callback(true, error));
        },
      };
    },
  });

  return echo;
};

export const disconnectSocket = () => {
  if (echo) {
    echo.disconnect();
    echo = null;
  }
};

export const getEcho = () => echo;

export default echo;
