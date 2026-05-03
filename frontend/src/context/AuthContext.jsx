import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { logout as apiLogout } from "../api/auth";
import { clearTokens, getAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we rehydrate from localStorage

  // Rehydrate user on first load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = getAccessToken();
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearTokens();
      }
    }
    setLoading(false);
  }, []);

  /** Called after a successful login response */
  const setAuthUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  /** Logs out the user, clearing server-side refresh token and local storage */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Even if the API call fails, clear local state
      clearTokens();
    }
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!getAccessToken();

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, setAuthUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to consume the auth context */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
