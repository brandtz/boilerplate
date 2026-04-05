const STORAGE_KEY = 'dashboard_recent_projects';
const MAX_RECENT = 10;

function readStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

function writeStorage(paths: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function getRecentProjects(): string[] {
  return readStorage();
}

export function saveRecentPath(pathStr: string): void {
  const current = readStorage();
  const filtered = current.filter((p) => p !== pathStr);
  const updated = [pathStr, ...filtered].slice(0, MAX_RECENT);
  writeStorage(updated);
}

export function removeRecentPath(pathStr: string): void {
  const current = readStorage();
  writeStorage(current.filter((p) => p !== pathStr));
}

export function clearRecentProjects(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}
