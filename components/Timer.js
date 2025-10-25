import { useEffect, useRef, useState } from "react";

// Countdown timer with Start/Pause/Reset and persistence per-session
// Persists via localStorage using a provided storageKey

export default function Timer({ totalSeconds, storageKey }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const endRef = useRef(null);

  // Load persisted state
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem(storageKey);
      if (raw) {
        const s = JSON.parse(raw);
        setRemaining(s.remaining ?? totalSeconds);
        setRunning(Boolean(s.running));
        if (s.running && s.endAt) {
          endRef.current = s.endAt;
        }
      }
    } catch {}
  }, [storageKey, totalSeconds]);

  // Tick interval
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const now = Date.now();
      const endAt = endRef.current || now + remaining * 1000;
      const diff = Math.max(0, Math.floor((endAt - now) / 1000));
      setRemaining(diff);
      if (diff <= 0) setRunning(false);
    }, 250);
    return () => clearInterval(id);
  }, [running, remaining]);

  // Persist state
  useEffect(() => {
    try {
      const data = { remaining, running, endAt: endRef.current };
      if (typeof window !== "undefined") localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {}
  }, [remaining, running, storageKey]);

  function start() {
    if (running) return;
    endRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  }

  function pause() {
    setRunning(false);
    endRef.current = null;
  }

  function reset() {
    setRunning(false);
    endRef.current = null;
    setRemaining(totalSeconds);
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const buttonClass =
    "focus-ring inline-flex items-center justify-center gap-1 rounded-full border border-brand/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-700 transition-all duration-300 ease-in-out hover:border-brand hover:bg-brand hover:text-white dark:border-white/10 dark:text-gray-200 dark:hover:bg-brand dark:hover:text-gray-900";

  return (
    <div className="flex flex-wrap items-center gap-3" aria-live="polite">
      <div className="min-w-[72px] text-xl font-mono font-semibold text-gray-900 tabular-nums dark:text-gray-100">
        {mm}:{ss}
      </div>
      <div className="flex items-center gap-2">
        {!running ? (
          <button className={buttonClass} onClick={start}>Start</button>
        ) : (
          <button className={buttonClass} onClick={pause}>Pause</button>
        )}
        <button className={buttonClass} onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
