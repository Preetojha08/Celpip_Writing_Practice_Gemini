// Simple localStorage helpers. In SSR these are no-ops.

const isBrowser = () => typeof window !== "undefined";

export function loadJSON(key, fallback = null) {
  try {
    if (!isBrowser()) return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn("Failed to load JSON from localStorage", key, e);
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    if (!isBrowser()) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Failed to save JSON to localStorage", key, e);
  }
}

export function remove(key) {
  try {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key);
  } catch (e) {
    console.warn("Failed to remove key from localStorage", key, e);
  }
}

