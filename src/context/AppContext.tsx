"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredToken, setStoredToken, clearStoredToken } from "@/lib/client-auth";

export type Role = "admin" | "teacher" | "student" | "parent";
export type Language = "en" | "ar";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  parentPhone?: string;
  stage?: string;
  grade?: string;
  streak?: number;
  points?: number;
  level?: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "student" | "parent";
  stage?: string;
  grade?: string;
  phone?: string;
  parentPhone?: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  toggleLang: () => void;
  notificationsCount: number;
  refreshNotifications: () => Promise<void>;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  appName: { en: "Professional Academy", ar: "أكاديمية المستر أونلاين" },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>("ar");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsCount, setNotificationsCount] = useState<number>(0);

  // Live unread notification badge (polls quietly while logged in)
  const refreshNotifications = async () => {
    const stored = getStoredToken();
    if (!stored) return;
    try {
      const res = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${stored}` } });
      if (res.ok) {
        const json = await res.json();
        setNotificationsCount(json.unreadCount || 0);
      }
    } catch {}
  };

  // Restore session on first load
  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setAuthLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "GET",
          headers: { Authorization: `Bearer ${stored}` },
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          setToken(stored);
        } else {
          clearStoredToken();
        }
      } catch {
        clearStoredToken();
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  // Poll unread notifications while a user session is active
  useEffect(() => {
    if (!user) {
      setNotificationsCount(0);
      return;
    }
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 45000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const toggleLang = () => setLang((prev) => (prev === "en" ? "ar" : "en"));
  const clearAuthError = () => setAuthError(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        setStoredToken(data.token);
        return true;
      }
      setAuthError(data.error || "Login failed");
      return false;
    } catch {
      setAuthError("Network error. Please try again.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", ...payload }),
      });
      const data = await res.json();
      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        setStoredToken(data.token);
        return true;
      }
      setAuthError(data.error || "Registration failed");
      return false;
    } catch {
      setAuthError("Network error. Please try again.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}` },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {}
    setUser(null);
    setToken(null);
    clearStoredToken();
  };

  const t = (key: string): string => translations[key]?.[lang] ?? key;

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        authLoading,
        authError,
        login,
        register,
        logout,
        clearAuthError,
        lang,
        setLang,
        theme,
        toggleTheme,
        toggleLang,
        notificationsCount,
        refreshNotifications,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
