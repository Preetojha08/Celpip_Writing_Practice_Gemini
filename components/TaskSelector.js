import { motion } from "framer-motion";
import { PenLine } from "lucide-react";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function TaskSelector({ tasks, currentTask, onTaskChange, onRandomPrompt }) {
  return (
    <section aria-labelledby="task-selector-heading" className="space-y-6">
      <div className="flex items-center gap-3">
        <PenLine className="h-5 w-5 text-brand" aria-hidden="true" />
        <h2 id="task-selector-heading" className="text-xl font-semibold">Choose your writing task</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => {
          const isActive = task.key === currentTask;
          return (
            <motion.button
              key={task.key}
              type="button"
              initial="initial"
              animate="animate"
              variants={cardVariants}
              whileHover={{ y: -4 }}
              onClick={() => onTaskChange?.(task.key)}
              aria-pressed={isActive}
              className={`group flex flex-col gap-2 rounded-2xl border border-brand-light/60 bg-white/80 p-6 text-left shadow-soft transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-brand focus:outline-none dark:border-white/15 dark:bg-[#10131a]/80 dark:hover:ring-brand ${
                isActive ? "ring-2 ring-brand" : "ring-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand">{task.label}</p>
                <span className="rounded-full bg-brand-light/60 px-3 py-1 text-xs font-medium text-gray-700 group-hover:bg-brand group-hover:text-white dark:bg-white/10 dark:text-gray-200 dark:group-hover:bg-brand dark:group-hover:text-gray-900">
                  {task.minutes} min
                </span>
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-900 transition-colors duration-300 ease-in-out dark:text-gray-100">
                {task.title}
              </h3>
              <p className="text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
                {task.description}
              </p>
            </motion.button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onRandomPrompt?.()}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-all duration-300 ease-in-out hover:bg-brand hover:text-white dark:border-brand/80 dark:text-brand-light"
        >
          New Random Question
        </button>
        <p className="text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
          Shuffle through the prompt bank for fresh practice each session.
        </p>
      </div>
    </section>
  );
}
