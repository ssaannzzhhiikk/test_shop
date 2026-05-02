import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getMe, login as loginRequest, register as registerRequest } from "../api/client.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    setLoading(true);
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo(() => {
    async function login(credentials) {
      const data = await loginRequest(credentials);
      setToken(data.access_token);
    }

    async function register(payload) {
      await registerRequest(payload);
      await login({ email: payload.email, password: payload.password });
    }

    function logout() {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }

    return { token, user, loading, isAuthenticated: Boolean(token), login, register, logout };
  }, [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
