"use client";

import type {
  BrowseEvent,
  CollectionItem,
  JournalEntry,
  SessionUser,
  UserData,
  UserProfile,
} from "@/lib/types";

const USERS_KEY = "cocktale:users";
const SESSION_KEY = "cocktale:session";
const DATA_PREFIX = "cocktale:data:";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function readUsers(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as UserProfile[];
  } catch {
    return [];
  }
}

function writeUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function emptyUserData(): UserData {
  return { collected: [], journal: [], history: [], moodPreference: null };
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

export function registerUser(name: string, email: string, password: string): SessionUser {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    throw new Error("EMAIL_EXISTS");
  }
  if (password.length < 4) throw new Error("PASSWORD_SHORT");
  const profile: UserProfile = {
    id: uid(),
    name: name.trim() || "Guest",
    email: normalized,
    password,
    createdAt: new Date().toISOString(),
  };
  users.push(profile);
  writeUsers(users);
  localStorage.setItem(DATA_PREFIX + profile.id, JSON.stringify(emptyUserData()));
  const session: SessionUser = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    createdAt: profile.createdAt,
  };
  setSession(session);
  return session;
}

export function loginUser(email: string, password: string): SessionUser {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  const found = users.find((u) => u.email === normalized && u.password === password);
  if (!found) throw new Error("INVALID_CREDENTIALS");
  const session: SessionUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    createdAt: found.createdAt,
  };
  setSession(session);
  return session;
}

export function logoutUser() {
  setSession(null);
}

export function getUserData(userId: string): UserData {
  if (typeof window === "undefined") return emptyUserData();
  try {
    const raw = localStorage.getItem(DATA_PREFIX + userId);
    if (!raw) return emptyUserData();
    return { ...emptyUserData(), ...(JSON.parse(raw) as UserData) };
  } catch {
    return emptyUserData();
  }
}

export function saveUserData(userId: string, data: UserData) {
  localStorage.setItem(DATA_PREFIX + userId, JSON.stringify(data));
}

export function trackBrowse(userId: string, event: Omit<BrowseEvent, "at">) {
  const data = getUserData(userId);
  data.history = [{ ...event, at: new Date().toISOString() }, ...data.history].slice(0, 500);
  saveUserData(userId, data);
  return data;
}

export function toggleCollect(userId: string, cocktailId: string): UserData {
  const data = getUserData(userId);
  const exists = data.collected.find((c) => c.cocktailId === cocktailId);
  if (exists) {
    data.collected = data.collected.filter((c) => c.cocktailId !== cocktailId);
  } else {
    const item: CollectionItem = { cocktailId, collectedAt: new Date().toISOString() };
    data.collected = [item, ...data.collected];
    data.history = [
      { cocktailId, action: "collect" as const, at: new Date().toISOString() },
      ...data.history,
    ].slice(0, 500);
  }
  saveUserData(userId, data);
  return data;
}

export function addJournalEntry(
  userId: string,
  cocktailId: string,
  triedAt: string,
  note: string,
): UserData {
  const data = getUserData(userId);
  const entry: JournalEntry = {
    id: uid(),
    cocktailId,
    triedAt,
    note: note.trim(),
  };
  data.journal = [entry, ...data.journal];
  data.history = [
    { cocktailId, action: "tried" as const, at: new Date().toISOString() },
    ...data.history,
  ].slice(0, 500);
  saveUserData(userId, data);
  return data;
}

export function updateJournalNote(userId: string, entryId: string, note: string): UserData {
  const data = getUserData(userId);
  data.journal = data.journal.map((j) =>
    j.id === entryId ? { ...j, note: note.trim() } : j,
  );
  saveUserData(userId, data);
  return data;
}

export function removeJournalEntry(userId: string, entryId: string): UserData {
  const data = getUserData(userId);
  data.journal = data.journal.filter((j) => j.id !== entryId);
  saveUserData(userId, data);
  return data;
}

export function setMoodPreference(userId: string, mood: string | null): UserData {
  const data = getUserData(userId);
  data.moodPreference = mood;
  saveUserData(userId, data);
  return data;
}

export function ensureDemoUser(): void {
  if (typeof window === "undefined") return;
  const users = readUsers();
  if (users.some((u) => u.email === "demo@cocktale.app")) return;
  const profile: UserProfile = {
    id: "demo-user",
    name: "Demo Drinker",
    email: "demo@cocktale.app",
    password: "demo",
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, profile]);
  if (!localStorage.getItem(DATA_PREFIX + profile.id)) {
    localStorage.setItem(DATA_PREFIX + profile.id, JSON.stringify(emptyUserData()));
  }
}
