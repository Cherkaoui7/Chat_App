import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

let echo = null;

export const connectSocket = () => {
  if (echo) return echo;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_REVERB_APP_KEY || 'reverb-app-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    cluster: 'mt1',
    authorizer: (channel, options) => {
      return {
        authorize: (socketId, callback) => {
          const token = localStorage.getItem("token");
          console.log("Authorizing presence channel:", channel.name, "socketId:", socketId, "token exists:", !!token);
          
          fetch(`${apiUrl}/broadcasting/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then((response) => {
              console.log("Auth response status:", response.status);
              if (!response.ok) {
                return response.text().then(text => {
                  console.error("Auth error response:", text);
                  throw new Error(`Auth failed with status ${response.status}: ${text}`);
                });
              }
              return response.json();
            })
            .then((data) => {
              console.log("Auth success:", data);
              callback(false, data);
            })
            .catch((error) => {
              console.error("Auth exception:", error);
              callback(true, error);
            });
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
