import { GoogleGenerativeAI } from "@google/generative-ai";

// API route: receives { name, taskType, prompt, answer, wordCount }
// Calls Gemini or Groq (with automatic fallback) and returns structured JSON compatible with the UI.

const CELPIP_SCHEMA_PROMPT = `You are a CELPIP writing examiner. Evaluate the response strictly and return ONLY valid JSON matching this schema:
{
  "band": number (4-12),
  "scores": {
    "task_response": number (1-12),
    "coherence": number (1-12),
    "lexis": number (1-12),
    "grammar": number (1-12),
    "register": number (1-12)
  },
  "errors": [
    {
      "title": string,
      "explanation": string,
      "before": string,
      "after": string
    }
  ],
  "how_to_solve": {
    "steps": string[],
    "drills": string[],
    "checklist": string[]
  },
  "revised_answer": string,
  "meta": {
    "task_type": "task1" | "task2",
    "word_count": number
  }
}
Return JSON only. Do not wrap in markdown or prose.`;

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "llama3-70b-8192";
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const GEMINI_FALLBACK_MODELS = [
  DEFAULT_GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name = "", taskType = "task1", prompt = "", answer = "", wordCount = 0 } = req.body || {};
  if (!prompt?.trim() || !answer?.trim()) {
    return res.status(400).json({ error: "Missing prompt or answer" });
  }

  const availableProviders = getProviderOrder();
  if (availableProviders.length === 0) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY or GROQ_API_KEY" });
  }

  const payload = buildUserPayload({ name, taskType, prompt, answer });
  const context = { taskType, wordCount };

  for (const provider of availableProviders) {
    try {
      const raw = provider === "gemini"
        ? await callGemini(payload)
        : await callGroq(payload);

      const normalized = normalizeResult(raw, context);
      normalized.meta = Object.assign({}, normalized.meta || {}, {
        task_type: taskType,
        word_count: wordCount,
        provider,
      });
      normalized.top_errors = normalized.top_errors || normalized.errors || [];
      normalized.errors = normalized.errors || normalized.top_errors;
      return res.status(200).json(normalized);
    } catch (error) {
      console.error(`[evaluate][${provider}]`, error);
      // Try the next provider
    }
  }

  return res.status(502).json({ error: "All LLM providers failed" });
}

function buildUserPayload({ name, taskType, prompt, answer }) {
  return `Name: ${name || "(Anonymous)"}\nTask: ${taskType}\nPrompt: ${prompt}\nAnswer:\n${answer}`;
}

function getProviderOrder() {
  const keys = {
    gemini: process.env.GEMINI_API_KEY,
    groq: process.env.GROQ_API_KEY,
  };
  const primary = (process.env.LLM_PRIMARY || "gemini").toLowerCase();
  const order = primary === "groq" ? ["groq", "gemini"] : ["gemini", "groq"];
  return order.filter((provider) => Boolean(keys[provider]));
}

async function callGemini(userContent) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const uniqueModels = Array.from(new Set(GEMINI_FALLBACK_MODELS.filter(Boolean)));
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  let lastError;
  for (const model of uniqueModels) {
    try {
      return await requestGeminiModel(client, userContent, model);
    } catch (error) {
      lastError = error;
      const msg = String(error?.message || "");
      const notFound = msg.includes("NOT_FOUND") || msg.includes("is not found") || msg.includes("INVALID_ARGUMENT");
      if (!notFound) {
        break;
      }
    }
  }

  throw lastError || new Error("Gemini request failed");
}

async function requestGeminiModel(client, userContent, modelId) {
  const model = client.getGenerativeModel({
    model: modelId,
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
      topK: 40,
      responseMimeType: "application/json",
    },
  });

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: CELPIP_SCHEMA_PROMPT },
          { text: userContent },
        ],
      },
    ],
  });

  const text = response?.response?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  return safeParseJSON(text);
}

async function callGroq(userContent) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const body = {
    model: DEFAULT_GROQ_MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: CELPIP_SCHEMA_PROMPT },
      { role: "user", content: userContent },
    ],
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned empty response");
  }

  return safeParseJSON(text);
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Unable to parse JSON response: ${error.message}`);
  }
}

function normalizeResult(payload, context) {
  if (!payload || typeof payload !== "object") {
    throw new Error("LLM returned invalid payload");
  }

  const sourceScores = payload.scores || payload.categories || {};
  const normalizedScores = {
    task_response: coerceScore(sourceScores.task_response),
    coherence: coerceScore(sourceScores.coherence),
    lexis: coerceScore(sourceScores.lexis),
    grammar: coerceScore(sourceScores.grammar),
    register: coerceScore(sourceScores.register),
  };

  const topErrors = Array.isArray(payload.top_errors)
    ? payload.top_errors
    : Array.isArray(payload.errors)
      ? payload.errors
      : [];

  const solve = payload.how_to_solve || {};

  const normalized = {
    band: typeof payload.band === "number" ? payload.band : Number(payload.band) || null,
    scores: normalizedScores,
    categories: normalizedScores,
    errors: topErrors,
    top_errors: topErrors,
    how_to_solve: {
      steps: toArrayOfStrings(solve.steps),
      drills: toArrayOfStrings(solve.drills),
      checklist: toArrayOfStrings(solve.checklist),
    },
    revised_answer: payload.revised_answer || payload.updated_answer || "",
    meta: Object.assign({}, payload.meta || {}, context),
  };

  return normalized;
}

function coerceScore(value) {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return Math.max(0, Math.min(12, num));
  }
  return 0;
}

function toArrayOfStrings(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  return [String(value)];
}
