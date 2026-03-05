import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { API_BASE_URL } from "./api";

window.Pusher = Pusher;

let echoInstance = null;

const APP_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveSocketConfig() {
  const scheme = import.meta.env.VITE_PUSHER_SCHEME ?? "http";
  const host = import.meta.env.VITE_PUSHER_HOST ?? "127.0.0.1";
  const port = Number(import.meta.env.VITE_PUSHER_PORT ?? 6001);
  const key = import.meta.env.VITE_PUSHER_APP_KEY ?? "app-key";

  return { scheme, host, key, port };
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export function connectSocket(token) {
  if (!token) {
    return null;
  }

  if (echoInstance) {
    echoInstance.connector.options.auth = {
      headers: authHeaders(token),
    };

    return echoInstance;
  }

  const { scheme, host, key, port } = resolveSocketConfig();

  echoInstance = new Echo({
    broadcaster: "pusher",
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${APP_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: authHeaders(token),
    },
  });

  return echoInstance;
}

export function getSocket() {
  return echoInstance;
}

export function disconnectSocket() {
  if (!echoInstance) {
    return;
  }

  echoInstance.disconnect();
  echoInstance = null;
}
