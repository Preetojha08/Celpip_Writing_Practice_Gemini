import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronDown, Copy, ListChecks } from "lucide-react";

const SCORE_DESCRIPTIONS = {
  task_response: "Addresses the task, covers bullet points, and develops ideas.",
  coherence: "Organizes ideas logically with clear paragraphs and transitions.",
  lexis: "Demonstrates range and precision of vocabulary.",
  grammar: "Shows control of grammatical structures and sentence variety.",
  register: "Maintains appropriate tone, formality, and voice for the audience.",
};

export default function EvaluationResults({ result }) {
  const [copied, setCopied] = useState(false);
  const [openPanel, setOpenPanel] = useState("task_response");

  const data = useMemo(() => {
    if (!result) return null;
    const scores = result.scores || result.categories || {};
    const items = [
      { key: "task_response", label: "Task Response", value: scores.task_response ?? 0 },
      { key: "coherence", label: "Coherence", value: scores.coherence ?? 0 },
      { key: "lexis", label: "Lexis", value: scores.lexis ?? 0 },
      { key: "grammar", label: "Grammar", value: scores.grammar ?? 0 },
      { key: "register", label: "Register", value: scores.register ?? 0 },
    ];
    return {
      band: result.band ?? null,
      scores: items,
      errors: result.top_errors || result.errors || [],
      howTo: result.how_to_solve || { steps: [], drills: [], checklist: [] },
      revisedAnswer: result.revised_answer || "",
      meta: result.meta || {},
    };
  }, [result]);

  if (!data) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.revisedAnswer || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy revised answer", error);
    }
  };

  return (
    <section aria-labelledby="evaluation-heading" className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-light/80 bg-white/80 p-6 shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#0f1218]/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Assessment summary</p>
            <h2 id="evaluation-heading" className="text-2xl font-display font-semibold">Your Results</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="rounded-full bg-brand/15 px-4 py-1 text-sm font-semibold text-brand">Band score</span>
            <span className="text-3xl font-bold text-gray-900 transition-colors duration-300 ease-in-out dark:text-gray-100">
              {data.band ?? "-"}
            </span>
          </div>
        </div>
        {data.meta?.word_count != null && (
          <p className="text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
            Evaluated {data.meta.word_count} words · Task type: {data.meta.task_type}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          {data.scores.map((item) => (
            <AccordionItem
              key={item.key}
              item={item}
              description={SCORE_DESCRIPTIONS[item.key]}
              isOpen={openPanel === item.key}
              onToggle={() => setOpenPanel((prev) => (prev === item.key ? null : item.key))}
            />
          ))}
        </div>

        <motion.div
          layout
          className="space-y-4 rounded-2xl border border-brand-light/60 bg-white/80 p-5 shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#0f1116]/80"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Top Errors</h3>
          </div>
          <AnimatePresence initial={false}>
            {data.errors.length === 0 && (
              <motion.p
                key="no-errors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300"
              >
                No major issues were highlighted.
              </motion.p>
            )}
            {data.errors.map((error, index) => (
              <motion.div
                key={`${error.title}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-brand-light/60 bg-white/90 p-4 text-sm shadow-sm transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#11151d]"
              >
                <p className="font-semibold text-gray-800 transition-colors duration-300 ease-in-out dark:text-gray-100">
                  {error.title || `Issue ${index + 1}`}
                </p>
                {error.explanation && (
                  <p className="mt-2 text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">{error.explanation}</p>
                )}
                {(error.before || error.after) && (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {error.before && (
                      <div className="rounded-lg border border-brand-light/60 bg-brand-light/30 p-3 text-xs text-gray-700 transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                        <p className="font-semibold uppercase tracking-wide text-brand">Before</p>
                        <p className="whitespace-pre-wrap">{error.before}</p>
                      </div>
                    )}
                    {error.after && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-gray-700 transition-colors duration-300 ease-in-out dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-gray-200">
                        <p className="font-semibold uppercase tracking-wide text-brand">After</p>
                        <p className="whitespace-pre-wrap">{error.after}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.section
        layout
        className="space-y-4 rounded-2xl border border-brand-light/70 bg-white/80 p-6 shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#0f1218]/80"
      >
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-brand" aria-hidden="true" />
          <h3 className="text-lg font-semibold">How to Solve This Problem</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Checklist title="Steps" items={data.howTo.steps} />
          <Checklist title="Drills" items={data.howTo.drills} />
          <Checklist title="Checklist" items={data.howTo.checklist} />
        </div>
      </motion.section>

      <motion.section
        layout
        className="rounded-2xl border border-brand-light/70 bg-white/80 p-6 shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#10131a]/80"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Updated Answer (Revised)</h3>
            <p className="text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
              Review and study this refined version for structure and tone.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-all duration-300 ease-in-out hover:bg-brand hover:text-white"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        {data.revisedAnswer ? (
          <pre className="mt-4 max-h-[400px] overflow-auto whitespace-pre-wrap rounded-xl border border-brand-light/60 bg-white/90 p-4 text-sm leading-relaxed text-gray-700 transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#0f1116]/80 dark:text-gray-300">
            {data.revisedAnswer}
          </pre>
        ) : (
          <p className="mt-4 text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
            No revised answer was provided.
          </p>
        )}
      </motion.section>
    </section>
  );
}

function AccordionItem({ item, description, isOpen, onToggle }) {
  const percentage = Math.round(Math.min(100, Math.max(0, (Number(item.value || 0) / 12) * 100)));
  return (
    <motion.div
      layout
      className={`rounded-2xl border border-brand-light/70 bg-white/80 shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#0f1218]/80 ${
        isOpen ? "ring-1 ring-brand" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${item.key}-panel`}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">{item.label}</p>
          <p className="mt-1 text-xl font-display font-semibold text-gray-900 transition-colors duration-300 ease-in-out dark:text-gray-100">
            {Number(item.value || 0).toFixed(1)} / 12
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-24 rounded-full bg-brand-light/60">
            <div className="h-2 rounded-full bg-brand" style={{ width: `${percentage}%` }} />
          </div>
          <ChevronDown
            className={`h-5 w-5 text-brand transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${item.key}-panel`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden px-5 pb-5"
          >
            <p className="text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Checklist({ title, items = [] }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-brand-light/70 bg-white/60 p-4 text-sm text-gray-500 transition-colors duration-300 ease-in-out dark:border-white/15 dark:bg-[#0f1218]/60 dark:text-gray-400">
        No suggestions provided.
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">{title}</p>
      <ul className="space-y-2 text-sm text-gray-700 transition-colors duration-300 ease-in-out dark:text-gray-200">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

