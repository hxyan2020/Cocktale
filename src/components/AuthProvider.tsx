"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser, UserData } from "@/lib/types";
import {
  addJournalEntry,
  emptyUserData,
  ensureDemoUser,
  getSession,
  getUserData,
  loginUser,
  logoutUser,
  registerUser,
  removeJournalEntry,
  setMoodPreference,
  toggleCollect,
  trackBrowse,
  updateJournalNote,
} from "@/lib/storage";

type AuthContextValue = {
  user: SessionUser | null;
  data: UserData;
  ready: boolean;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  refreshData: () => void;
  collect: (cocktailId: string) => void;
  markTried: (cocktailId: string, triedAt: string, note: string) => void;
  editJournal: (entryId: string, note: string) => void;
  deleteJournal: (entryId: string) => void;
  browse: (cocktailId: string, action: "view" | "open" | "skip") => void;
  setMood: (mood: string | null) => void;
  isCollected: (cocktailId: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [data, setData] = useState<UserData>(emptyUserData());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureDemoUser();
    const session = getSession();
    setUser(session);
    if (session) setData(getUserData(session.id));
    setReady(true);
  }, []);

  const refreshData = useCallback(() => {
    const session = getSession();
    if (session) setData(getUserData(session.id));
  }, []);

  const login = useCallback((email: string, password: string) => {
    const session = loginUser(email, password);
    setUser(session);
    setData(getUserData(session.id));
  }, []);

  const register = useCallback((name: string, email: string, password: string) => {
    const session = registerUser(name, email, password);
    setUser(session);
    setData(getUserData(session.id));
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setData(emptyUserData());
  }, []);

  const collect = useCallback(
    (cocktailId: string) => {
      if (!user) return;
      setData(toggleCollect(user.id, cocktailId));
    },
    [user],
  );

  const markTried = useCallback(
    (cocktailId: string, triedAt: string, note: string) => {
      if (!user) return;
      setData(addJournalEntry(user.id, cocktailId, triedAt, note));
    },
    [user],
  );

  const editJournal = useCallback(
    (entryId: string, note: string) => {
      if (!user) return;
      setData(updateJournalNote(user.id, entryId, note));
    },
    [user],
  );

  const deleteJournal = useCallback(
    (entryId: string) => {
      if (!user) return;
      setData(removeJournalEntry(user.id, entryId));
    },
    [user],
  );

  const browse = useCallback(
    (cocktailId: string, action: "view" | "open" | "skip") => {
      if (!user) return;
      setData(trackBrowse(user.id, { cocktailId, action }));
    },
    [user],
  );

  const setMood = useCallback(
    (mood: string | null) => {
      if (!user) return;
      setData(setMoodPreference(user.id, mood));
    },
    [user],
  );

  const isCollected = useCallback(
    (cocktailId: string) => data.collected.some((c) => c.cocktailId === cocktailId),
    [data.collected],
  );

  const value = useMemo(
    () => ({
      user,
      data,
      ready,
      login,
      register,
      logout,
      refreshData,
      collect,
      markTried,
      editJournal,
      deleteJournal,
      browse,
      setMood,
      isCollected,
    }),
    [
      user,
      data,
      ready,
      login,
      register,
      logout,
      refreshData,
      collect,
      markTried,
      editJournal,
      deleteJournal,
      browse,
      setMood,
      isCollected,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
