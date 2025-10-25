import { useEffect, useMemo, useState } from "react";
import { Lightbulb, RefreshCw, Save, Send, Trash2 } from "lucide-react";
import Timer from "./Timer";
import { loadJSON, saveJSON } from "../lib/storage";

const AUTO_SAVE_DELAY = 400;

export default function WritingEditor({
  taskKey,
  name,
  prompt,
  value,
  onChange,
  timerMinutes,
  timerStorageKey,
  onSubmit,
  loading,
  onClear,
  onRandom,
  onSaveDraft,
}) {
  const [text, setText] = useState(value || "");
  const [savedHint, setSavedHint] = useState("");
  const storageKey = useMemo(() => {
    const who = name?.trim() ? name.trim() : "guest";
    return `celpip:autosave:${taskKey}:${who}`;
  }, [taskKey, name]);

  useEffect(() => {
    if (value && value.length) {
      setText(value);
      return;
    }
    const saved = loadJSON(storageKey);
    if (saved?.text) {
      setText(saved.text);
      onChange?.(saved.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    setText(value || "");
  }, [value]);

  useEffect(() => {
    const id = setTimeout(() => {
      saveJSON(storageKey, { text, updatedAt: Date.now() });
    }, AUTO_SAVE_DELAY);
    return () => clearTimeout(id);
  }, [storageKey, text]);

  const wordCount = useMemo(() => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }, [text]);

  const handleChange = (event) => {
    const next = event.target.value;
    setText(next);
    onChange?.(next);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.();
  };

  const handleSaveDraft = () => {
    const message = onSaveDraft?.(text) || "Draft saved locally.";
    setSavedHint(message);
    setTimeout(() => setSavedHint(""), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Writing editor">
      <div className="rounded-2xl border border-brand-light/70 bg-white/80 p-4 shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#10131a]/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm font-semibold text-brand">
            <span className="rounded-full bg-brand/15 px-3 py-1">Timer</span>
            <Timer totalSeconds={timerMinutes * 60} storageKey={timerStorageKey} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-brand/10 px-3 py-1 font-semibold text-brand">Word Count</span>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{wordCount}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-light/70 bg-brand-light/30 p-5 text-sm leading-relaxed shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-brand" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Current prompt</p>
            <h3 className="text-lg font-display font-semibold text-gray-900 transition-colors duration-300 ease-in-out dark:text-gray-100">{prompt?.title}</h3>
          </div>
        </div>
        <p className="mt-3 text-gray-700 transition-colors duration-300 ease-in-out dark:text-gray-200">{prompt?.text}</p>
      </div>

      <div className="rounded-2xl border border-brand-light/80 bg-white/70 p-4 shadow-soft transition-colors duration-300 ease-in-out focus-within:ring-2 focus-within:ring-brand dark:border-white/10 dark:bg-[#0f1218]/80">
        <label htmlFor="answer" className="mb-2 block text-sm font-semibold text-gray-700 transition-colors duration-300 ease-in-out dark:text-gray-300">
          Your Answer
        </label>
        <textarea
          id="answer"
          name="answer"
          value={text}
          onChange={handleChange}
          placeholder="Start drafting your response here..."
          rows={12}
          className="w-full resize-y rounded-xl border border-transparent bg-white/80 px-4 py-3 text-base leading-7 text-gray-800 shadow-inner outline-none transition-colors duration-300 ease-in-out focus:border-brand focus:ring-0 dark:bg-[#12151d]/90 dark:text-gray-100"
        />
        <p className="mt-2 text-xs text-gray-500 transition-colors duration-300 ease-in-out dark:text-gray-400">
          Autosaves locally every few seconds.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="submit"
          disabled={loading}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {loading ? "Evaluating..." : "Submit for Evaluation"}
        </button>
        <button
          type="button"
          onClick={() => onClear?.()}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand transition-all duration-300 ease-in-out hover:bg-brand hover:text-white sm:w-auto"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
        <button
          type="button"
          onClick={() => onRandom?.()}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full border border-transparent bg-white/80 px-6 py-3 text-sm font-semibold text-gray-700 shadow-soft transition-all duration-300 ease-in-out hover:border-brand hover:bg-brand/10 hover:text-brand dark:bg-[#0f1218]/80 dark:text-gray-200 dark:hover:bg-brand/20 sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          New Random Question
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand/40 px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-300 ease-in-out hover:border-brand hover:bg-brand/10 hover:text-brand dark:border-white/20 dark:text-gray-200 dark:hover:bg-brand/20 sm:w-auto"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Draft
        </button>
      </div>
      {savedHint && (
        <p className="text-sm font-medium text-brand">{savedHint}</p>
      )}
    </form>
  );
}

