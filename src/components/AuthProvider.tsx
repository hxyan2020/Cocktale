"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  requireAuth: (then?: () => void) => boolean;
  authPromptOpen: boolean;
  closeAuthPrompt: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [data, setData] = useState<UserData>(emptyUserData());
  const [ready, setReady] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);

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

  const closeAuthPrompt = useCallback(() => {
    pendingRef.current = null;
    setAuthPromptOpen(false);
  }, []);

  const requireAuth = useCallback(
    (then?: () => void) => {
      if (user) {
        then?.();
        return true;
      }
      pendingRef.current = then ?? null;
      setAuthPromptOpen(true);
      return false;
    },
    [user],
  );

  useEffect(() => {
    if (!user || !pendingRef.current) return;
    const fn = pendingRef.current;
    pendingRef.current = null;
    setAuthPromptOpen(false);
    fn();
  }, [user]);

  const collect = useCallback(
    (cocktailId: string) => {
      requireAuth(() => {
        const session = getSession();
        if (!session) return;
        setData(toggleCollect(session.id, cocktailId));
      });
    },
    [requireAuth],
  );

  const markTried = useCallback(
    (cocktailId: string, triedAt: string, note: string) => {
      requireAuth(() => {
        const session = getSession();
        if (!session) return;
        setData(addJournalEntry(session.id, cocktailId, triedAt, note));
      });
    },
    [requireAuth],
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
      if (!user) {
        setData((d) => ({
          ...d,
          history: [
            { cocktailId, action, at: new Date().toISOString() },
            ...d.history,
          ].slice(0, 500),
        }));
        return;
      }
      setData(trackBrowse(user.id, { cocktailId, action }));
    },
    [user],
  );

  const setMood = useCallback(
    (mood: string | null) => {
      if (!user) {
        setData((d) => ({ ...d, moodPreference: mood }));
        return;
      }
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
      requireAuth,
      authPromptOpen,
      closeAuthPrompt,
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
      requireAuth,
      authPromptOpen,
      closeAuthPrompt,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
