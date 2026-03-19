import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "rr_favorites";
const WRITE_DEBOUNCE_MS = 300;

function readFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

function writeToStorage(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // storage unavailable — silently ignore
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() =>
    readFromStorage(),
  );
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (writeTimerRef.current !== null) {
      clearTimeout(writeTimerRef.current);
    }
    writeTimerRef.current = setTimeout(() => {
      writeToStorage(favorites);
      writeTimerRef.current = null;
    }, WRITE_DEBOUNCE_MS);

    return () => {
      if (writeTimerRef.current !== null) {
        clearTimeout(writeTimerRef.current);
      }
    };
  }, [favorites]);

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites],
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
