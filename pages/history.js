import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "../lib/storage";

export default function History() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(loadJSON("celpip:history", []));
  }, []);

  const clearAll = () => {
    if (!confirm("Clear all local history?")) return;
    saveJSON("celpip:history", []);
    setItems([]);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Progress archive</p>
          <h1 className="text-3xl font-display font-semibold">Your saved evaluations</h1>
          <p className="mt-1 text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
            Entries are stored locally. Clearing history removes them from this browser only.
          </p>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand transition-all duration-300 ease-in-out hover:bg-brand hover:text-white"
        >
          Clear all
        </button>
      </header>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-brand-light/70 bg-white/70 p-6 text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:border-white/15 dark:bg-[#0f1218]/70 dark:text-gray-300">
            No evaluations yet. Submit a response from the practice page to build your archive.
          </div>
        )}

        {items.map((entry) => (
          <article
            key={entry.id}
            className="space-y-4 rounded-2xl border border-brand-light/70 bg-white/80 p-6 shadow-soft transition-colors duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#10131a]/80"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
                  {entry.task?.toUpperCase()}
                </span>
                <span>{new Date(entry.at).toLocaleString()}</span>
              </div>
              <span>{entry.name || "Guest"}</span>
            </header>

            <div className="space-y-3 text-sm">
              <section>
                <p className="font-semibold text-gray-800 transition-colors duration-300 ease-in-out dark:text-gray-100">Prompt</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
                  {entry.prompt}
                </p>
              </section>

              <section>
                <p className="font-semibold text-gray-800 transition-colors duration-300 ease-in-out dark:text-gray-100">Your answer</p>
                <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded-xl border border-brand-light/60 bg-white/90 p-4 text-sm text-gray-700 transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#0f1116]/80 dark:text-gray-200">
                  {entry.answer}
                </pre>
              </section>

              <section className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-brand">
                <span>Band: {entry.result?.band ?? "-"}</span>
                <span>Task Response: {entry.result?.scores?.task_response ?? "-"}</span>
                <span>Coherence: {entry.result?.scores?.coherence ?? "-"}</span>
              </section>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

