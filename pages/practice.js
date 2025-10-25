import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import TaskSelector from "../components/TaskSelector";
import WritingEditor from "../components/WritingEditor";
import EvaluationResults from "../components/EvaluationResults";
import {
  TASKS,
  PROMPT_DISPLAY_COUNT,
  getPromptById,
  getPromptSelection,
  getPrompts,
  getRandomPrompt,
} from "../lib/prompts";
import { loadJSON, saveJSON } from "../lib/storage";

export default function Practice() {
  const router = useRouter();
  const { name = "", task: taskQuery } = router.query || {};

  const [taskKey, setTaskKey] = useState("task1");
  const [promptId, setPromptId] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [promptOptions, setPromptOptions] = useState(() => getPromptSelection("task1", null, PROMPT_DISPLAY_COUNT));

  useEffect(() => {
    if (!router.isReady) return;
    const nextTask = TASKS[taskQuery] ? taskQuery : "task1";
    setTaskKey(nextTask);
  }, [router.isReady, taskQuery]);

  const selectionKey = useMemo(
    () => `celpip:selection:${taskKey}:${name || "guest"}`,
    [taskKey, name]
  );

  useEffect(() => {
    const saved = loadJSON(selectionKey);
    const includeId = saved?.promptId && getPromptById(taskKey, saved.promptId) ? saved.promptId : null;
    const options = getPromptSelection(taskKey, includeId, PROMPT_DISPLAY_COUNT);
    setPromptOptions(options);
    setPromptId(includeId ?? options[0]?.id ?? null);
    setText("");
    setResult(null);
  }, [taskKey, selectionKey]);

  useEffect(() => {
    if (!promptId) return;
    saveJSON(selectionKey, { promptId });
    setPromptOptions(getPromptSelection(taskKey, promptId, PROMPT_DISPLAY_COUNT));
  }, [promptId, taskKey, selectionKey]);

  const selectedPrompt = useMemo(() => {
    return (
      getPromptById(taskKey, promptId) ||
      promptOptions[0] ||
      getPrompts(taskKey)[0] || {
        id: "fallback",
        title: "Prompt unavailable",
        text: "No prompt found.",
      }
    );
  }, [taskKey, promptId, promptOptions]);

  const timerMinutes = TASKS[taskKey]?.minutes ?? 27;
  const timerStorageKey = `celpip:timer:${taskKey}:${name || "guest"}`;

  const handleTaskChange = (nextTask) => {
    setTaskKey(nextTask);
    router.replace(
      {
        pathname: "/practice",
        query: { ...router.query, task: nextTask, name },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleRandomPrompt = () => {
    const next = getRandomPrompt(taskKey, promptId);
    if (next) setPromptId(next.id);
  };

  const handleClear = () => {
    setText("");
  };

  const handleSaveDraft = (currentText) => {
    saveJSON(`celpip:draft:${taskKey}:${name || "guest"}`, {
      text: currentText,
      promptId,
      savedAt: new Date().toISOString(),
    });
    return "Draft saved locally ✅";
  };

  const handleEvaluate = async () => {
    if (!selectedPrompt?.text?.trim()) {
      alert("Please select a prompt before evaluating.");
      return;
    }
    if (!text.trim()) {
      alert("Please write your answer before evaluating.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          taskType: taskKey,
          prompt: selectedPrompt.text,
          answer: text,
          wordCount,
        }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const payload = await response.json();
      setResult(payload);

      const history = loadJSON("celpip:history", []);
      history.unshift({
        id: `${Date.now()}`,
        at: new Date().toISOString(),
        name: name || "",
        task: taskKey,
        prompt: selectedPrompt.text,
        answer: text,
        result: payload,
      });
      saveJSON("celpip:history", history.slice(0, 100));
    } catch (error) {
      console.error(error);
      alert("Evaluation failed. Please check your Gemini/Groq API keys and try again.");
    } finally {
      setLoading(false);
    }
  };

  const taskCards = useMemo(
    () =>
      Object.entries(TASKS).map(([key, item]) => ({
        key,
        label: item.label,
        title: key === "task1" ? "Formal correspondence" : "Structured opinion",
        description: item.description,
        minutes: item.minutes,
      })),
    []
  );

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Practice session</p>
        <h1 className="text-3xl font-display font-semibold">Sharpen your CELPIP writing</h1>
        <p className="max-w-3xl text-base text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
          Choose a task, draft your response, and receive tailored feedback aligned with CELPIP band descriptors. Hello {name || "Guest"}! Ready when you are.
        </p>
      </header>

      <TaskSelector
        tasks={taskCards}
        currentTask={taskKey}
        onTaskChange={handleTaskChange}
        onRandomPrompt={handleRandomPrompt}
      />

      <WritingEditor
        taskKey={taskKey}
        name={name}
        prompt={selectedPrompt}
        value={text}
        onChange={setText}
        timerMinutes={timerMinutes}
        timerStorageKey={timerStorageKey}
        onSubmit={handleEvaluate}
        loading={loading}
        onClear={handleClear}
        onRandom={handleRandomPrompt}
        onSaveDraft={handleSaveDraft}
      />

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 transition-colors duration-300 ease-in-out dark:text-gray-300">
        <span>Need to compare past attempts?</span>
        <button
          type="button"
          onClick={() => router.push("/history")}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 font-semibold text-brand transition-all duration-300 ease-in-out hover:bg-brand hover:text-white"
        >
          View History
        </button>
      </div>

      {result && <EvaluationResults result={result} />}
    </div>
  );
}

