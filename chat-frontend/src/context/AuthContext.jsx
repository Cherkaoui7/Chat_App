import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

const TOKEN_KEY = "token";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    disconnectSocket();
  }, []);

  const saveAuthState = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
    connectSocket(nextToken);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await api.post("/login", credentials);
      saveAuthState(response.data.token, response.data.user);
      return response.data.user;
    },
    [saveAuthState],
  );

  const register = useCallback(
    async (payload) => {
      const response = await api.post("/register", payload);
      saveAuthState(response.data.token, response.data.user);
      return response.data.user;
    },
    [saveAuthState],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch {
      // Keep UI consistent even if API logout fails.
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  useEffect(() => {
    if (!token) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    setAuthLoading(true);
    connectSocket(token);

    api
      .get("/user")
      .then((response) => {
        if (mounted) {
          setUser(response.data);
        }
      })
      .catch(() => {
        if (mounted) {
          clearAuthState();
        }
      })
      .finally(() => {
        if (mounted) {
          setAuthLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [token, clearAuthState]);

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [token, user, authLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
