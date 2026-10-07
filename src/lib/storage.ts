"use client";

import type {
  BrowseEvent,
  CollectionItem,
  JournalEntry,
  LoginMethod,
  SessionUser,
  SurveyPreferences,
  UserData,
  UserProfile,
} from "@/lib/types";

const USERS_KEY = "cocktale:users";
const SESSION_KEY = "cocktale:session";
const DATA_PREFIX = "cocktale:data:";
const GUEST_DATA_KEY = "cocktale:data:guest";

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
  return {
    collected: [],
    journal: [],
    history: [],
    moodPreference: null,
    surveyPreferences: null,
  };
}

export function getGuestData(): UserData {
  if (typeof window === "undefined") return emptyUserData();
  try {
    const raw = localStorage.getItem(GUEST_DATA_KEY);
    return raw ? { ...emptyUserData(), ...(JSON.parse(raw) as UserData) } : emptyUserData();
  } catch {
    return emptyUserData();
  }
}

export function saveGuestData(data: UserData) {
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
  return data;
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
    provider: "password",
    lastLoginMethod: "password",
  };
  users.push(profile);
  writeUsers(users);
  localStorage.setItem(DATA_PREFIX + profile.id, JSON.stringify(emptyUserData()));
  return persistSession(profile);
}

function persistSession(profile: UserProfile, method?: LoginMethod): SessionUser {
  const lastLoginMethod =
    method ||
    profile.lastLoginMethod ||
    (profile.googleId ? "google" : profile.phone ? "sms" : "password");
  const session: SessionUser = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    createdAt: profile.createdAt,
    provider: profile.provider || (profile.googleId ? "google" : profile.phone ? "sms" : "password"),
    lastLoginMethod,
    picture: profile.picture,
    phone: profile.phone,
  };
  setSession(session);
  return session;
}

export function loginUser(email: string, password: string): SessionUser {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  const found = users.find((u) => u.email === normalized);
  if (!found) throw new Error("INVALID_CREDENTIALS");
  if (!found.password) throw new Error(found.phone && !found.googleId ? "SMS_ONLY" : "GOOGLE_ONLY");
  if (found.password !== password) throw new Error("INVALID_CREDENTIALS");
  found.lastLoginMethod = "password";
  writeUsers(users);
  return persistSession(found, "password");
}

export type GoogleProfile = {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
};

export function loginWithGoogle(profile: GoogleProfile): SessionUser {
  const users = readUsers();
  const normalized = profile.email.trim().toLowerCase();
  if (!normalized) throw new Error("GOOGLE_FAILED");

  let found = users.find((u) => u.googleId === profile.googleId || u.email === normalized);
  if (!found) {
    found = {
      id: uid(),
      name: profile.name.trim() || "Guest",
      email: normalized,
      password: "",
      createdAt: new Date().toISOString(),
      provider: "google",
      lastLoginMethod: "google",
      googleId: profile.googleId,
      picture: profile.picture,
    };
    users.push(found);
    writeUsers(users);
    localStorage.setItem(DATA_PREFIX + found.id, JSON.stringify(emptyUserData()));
    return persistSession(found, "google");
  }

  found.googleId = profile.googleId;
  if (profile.picture) found.picture = profile.picture;
  if (profile.name.trim() && found.name === "Guest") found.name = profile.name.trim();
  found.provider = found.password || found.phone ? "both" : "google";
  found.lastLoginMethod = "google";
  writeUsers(users);
  return persistSession(found, "google");
}

export function loginWithSms(phone: string): SessionUser {
  const users = readUsers();
  const normalized = phone.trim();
  if (!normalized) throw new Error("SMS_FAILED");

  let found = users.find((u) => u.phone === normalized);
  if (!found) {
    found = {
      id: uid(),
      name: normalized,
      email: "",
      password: "",
      createdAt: new Date().toISOString(),
      provider: "sms",
      lastLoginMethod: "sms",
      phone: normalized,
    };
    users.push(found);
    writeUsers(users);
    localStorage.setItem(DATA_PREFIX + found.id, JSON.stringify(emptyUserData()));
    return persistSession(found, "sms");
  }

  found.phone = normalized;
  found.provider = found.password || found.googleId ? "both" : "sms";
  found.lastLoginMethod = "sms";
  writeUsers(users);
  return persistSession(found, "sms");
}

export function changePassword(userId: string, currentPassword: string, nextPassword: string): SessionUser {
  if (nextPassword.length < 4) throw new Error("PASSWORD_SHORT");
  const users = readUsers();
  const found = users.find((u) => u.id === userId);
  if (!found) throw new Error("INVALID_CREDENTIALS");
  if (found.password && found.password !== currentPassword) throw new Error("WRONG_PASSWORD");
  found.password = nextPassword;
  found.provider = found.googleId ? "both" : "password";
  writeUsers(users);
  return persistSession(found);
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

export function setSurveyPreferences(
  userId: string,
  preferences: SurveyPreferences,
): UserData {
  const data = getUserData(userId);
  data.surveyPreferences = preferences;
  data.moodPreference = preferences.mood;
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
    provider: "password",
  };
  writeUsers([...users, profile]);
  if (!localStorage.getItem(DATA_PREFIX + profile.id)) {
    localStorage.setItem(DATA_PREFIX + profile.id, JSON.stringify(emptyUserData()));
  }
}
