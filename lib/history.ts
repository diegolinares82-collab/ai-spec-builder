import type { GenerateSpecResponse } from "./types";

const STORAGE_KEY = "ai-spec-builder:history";

export interface SpecHistoryEntry {
  id: string;
  name: string;
  idea: string;
  spec: GenerateSpecResponse;
  createdAt: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): SpecHistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: SpecHistoryEntry[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota exceeded, serialization error — silent fail
  }
}

function deriveName(idea: string): string {
  const trimmed = idea.trim().replace(/\s+/g, " ");
  return trimmed.length > 60 ? trimmed.slice(0, 60).trimEnd() + "…" : trimmed || "Spec sin título";
}

function generateId(): string {
  if (isBrowser() && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadHistory(): SpecHistoryEntry[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveSpec(input: {
  idea: string;
  spec: GenerateSpecResponse;
  name?: string;
}): SpecHistoryEntry {
  const entry: SpecHistoryEntry = {
    id: generateId(),
    name: input.name?.trim() || deriveName(input.idea),
    idea: input.idea,
    spec: input.spec,
    createdAt: Date.now(),
  };
  const all = readAll();
  writeAll([entry, ...all]);
  return entry;
}

export function getSpec(id: string): SpecHistoryEntry | null {
  return readAll().find((e) => e.id === id) ?? null;
}

export function renameSpec(id: string, newName: string): void {
  const trimmed = newName.trim();
  if (!trimmed) return;
  const all = readAll();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], name: trimmed };
  writeAll(all);
}

export function deleteSpec(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}
