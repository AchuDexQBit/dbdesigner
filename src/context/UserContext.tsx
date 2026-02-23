import React, { createContext, useContext, useState, useCallback } from "react";

// ─── Types (match AuthUser from tools project) ─────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  greet_name: string;
  active: boolean;
  designation: string;
  created_at: string;
}

export interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────

const UserContext = React.createContext<UserContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────

export function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUserState] = useState<User | null>(null);
  const setUser = useCallback((value: User | null) => {
    setUserState(value);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useUser(): UserContextValue {
  const value = useContext(UserContext);
  if (value === null) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return value;
}
