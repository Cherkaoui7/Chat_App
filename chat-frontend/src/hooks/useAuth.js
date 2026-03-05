import { useState, useEffect } from "react";
import api from "../services/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get("/user");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/login", { email, password });
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (name, email, password, password_confirmation) => {
    const response = await api.post("/register", {
      name,
      email,
      password,
      password_confirmation,
    });
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await api.post("/logout");
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
