import { useRouter } from "next/router";
import { useState } from "react";
import { TASKS } from "../lib/prompts";

const FEATURE_CARDS = [
  {
    title: "Timed practice",
    description: "Preset timers for Task 1 and Task 2 with pause and reset controls.",
  },
  {
    title: "Detailed feedback",
    description: "Band prediction, category scores, top errors, and a revised sample answer.",
  },
  {
    title: "Local history",
    description: "All drafts and evaluations stay on your device—no login required.",
  },
];

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [taskKey, setTaskKey] = useState("task1");

  const task = TASKS[taskKey];

  const startPractice = () => {
    router.push({
      pathname: "/practice",
      query: { name: name || "", task: taskKey },
    });
  };

  return (
    <div className="space-y-16">
      <section className="rounded-2xl border border-brand-light/70 bg-white/80 p-8 shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#0f1218]/80">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Master the writing section</p>
            <h1 className="text-4xl font-display font-semibold leading-tight">CELPIP Writing Practice, elevated.</h1>
            <p className="max-w-3xl text-base text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
              Build exam confidence with a beautiful workspace, randomised prompts, autosave, and instant AI-powered evaluations aligned with CELPIP band descriptors.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
            <div className="space-y-4">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 transition-colors duration-300 ease-in-out dark:text-gray-200">
                Your name (optional)
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Alex"
                className="focus-ring w-full rounded-2xl border border-brand-light/80 bg-white/90 px-4 py-3 text-base text-gray-800 shadow-soft transition-colors duration-300 ease-in-out placeholder:text-gray-400 dark:border-white/10 dark:bg-[#12151d]/80 dark:text-gray-100"
              />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 transition-colors duration-300 ease-in-out dark:text-gray-200">Choose your task</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(TASKS).map(([key, item]) => {
                    const active = taskKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTaskKey(key)}
                        className={`focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ease-in-out ${
                          active
                            ? "bg-brand text-white shadow-soft"
                            : "border border-brand/60 text-brand hover:bg-brand/10"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 transition-colors duration-300 ease-in-out dark:text-gray-400">
                  Timer preset: {task.minutes} minutes
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startPractice}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-brand-hover"
                >
                  Start practicing
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/history")}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand transition-all duration-300 ease-in-out hover:bg-brand/10"
                >
                  View history
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-light/60 bg-brand-light/30 p-6 text-sm leading-relaxed text-gray-700 shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
              <h2 className="mb-3 text-lg font-display font-semibold text-gray-900 transition-colors duration-300 ease-in-out dark:text-gray-100">What to expect</h2>
              <ol className="space-y-2 list-decimal pl-5">
                <li>Pick Task 1 or Task 2 and receive a curated random prompt.</li>
                <li>Write in the distraction-free editor with live word count and timer.</li>
                <li>Submit for AI evaluation to see your estimated band and targeted advice.</li>
                <li>Revisit attempts anytime from the local history panel.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {FEATURE_CARDS.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-brand-light/70 bg-white/80 p-5 shadow-soft transition-colors duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#0f1218]/80"
          >
            <h3 className="text-lg font-display font-semibold text-gray-900 transition-colors duration-300 ease-in-out dark:text-gray-100">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-brand-light/70 bg-white/60 p-6 shadow-soft transition-colors duration-300 ease-in-out dark:border-white/10 dark:bg-[#10131a]/80">
        <h2 className="text-xl font-display font-semibold">Performance-focused design</h2>
        <p className="mt-2 text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
          Built for modern browsers, the workspace adapts gracefully to desktops, tablets, and mobile screens. All progress stays on your device, and dark mode keeps long sessions comfortable.
        </p>
      </section>
    </div>
  );
}
