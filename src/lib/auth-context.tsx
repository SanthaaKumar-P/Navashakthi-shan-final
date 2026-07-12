import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "customer" | "artisan" | "government" | "admin" | "kiosk" | "trainer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  village?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: Role) => void;
  signup: (name: string, email: string, role: Role) => void;
  logout: () => void;
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "navshakthi_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user, hydrated]);

  const login: AuthContextValue["login"] = (email, role = "customer") => {
    setUser({
      id: crypto.randomUUID(),
      name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role,
    });
  };
  const signup: AuthContextValue["signup"] = (name, email, role) => {
    setUser({ id: crypto.randomUUID(), name, email, role });
  };
  const logout = () => setUser(null);
  const setRole = (role: Role) => setUser((u) => (u ? { ...u, role } : u));

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
