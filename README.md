# CELPIP Writing Practice (Next.js + Tailwind + Gemini/Groq)

Practice CELPIP Task 1 and Task 2 writing with a modern, elegant workspace:

- Live word count + autosave
- Countdown timer (27 min for Task 1, 26 min for Task 2)
- Instant AI evaluation (Gemini primary with Groq fallback)
- Structured feedback: band score, category breakdown, top errors, actionable drills
- Local history only (no accounts, no external storage)

---

## Project Structure

```
celpip-writing-practice/
├─ components/
│  ├─ EvaluationResults.js   # Framer Motion accordion, error summaries, revised answer card
│  ├─ Layout.js              # App shell with accent header + dark-mode toggle
│  ├─ TaskSelector.js        # Task cards, hover lift, random prompt action
│  ├─ ThemeProvider.js       # Theme context with prefers-color-scheme + localStorage
│  ├─ ThemeToggle.js         # Accessible toggle button (Sun/Moon)
│  ├─ Timer.js               # Countdown timer with persistence
│  └─ WritingEditor.js       # Autosave editor with timer bar, prompt highlight, CTA row
├─ lib/
│  ├─ prompts.js             # Prompt catalog + random helpers (Task 1/Task 2)
│  └─ storage.js             # localStorage helpers (load/save JSON)
├─ pages/
│  ├─ api/
│  │  └─ evaluate.js         # Gemini/Groq dual-provider API route
│  ├─ _app.js                # Theme provider + layout wrapper
│  ├─ history.js             # History archive UI (cards, clearing)
│  ├─ index.js               # Landing page hero + quick start form
│  └─ practice.js            # Practice experience (selector → editor → results)
├─ styles/
│  └─ globals.css            # Base styles, fonts, transitions, dark-mode helpers
├─ tailwind.config.js        # Theme tokens, brand colors, custom shadows
├─ package.json
└─ README.md
```

---

## Setup

1. **Clone the project**
   ```bash
   git clone <your-repo-url> celpip-writing-practice
   cd celpip-writing-practice
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create `.env.local`**
   ```bash
   GEMINI_API_KEY=your-gemini-key
   GROQ_API_KEY=your-groq-key
   # Optional overrides
   # LLM_PRIMARY=gemini      # or groq
   # GEMINI_MODEL=gemini-2.5-pro
   # GROQ_MODEL=llama3-70b-8192
   ```
   Supply at least one API key. When both are provided the app tries the primary provider first and automatically falls back to the other on failure.
4. **Run locally**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000, choose a task, and start writing.

---

## Deploy to Vercel

1. Push the repository to GitHub (or any Git provider).
2. Import the project on [Vercel](https://vercel.com/).
3. In Project Settings → Environment Variables add:
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY` (optional but recommended for fallback)
   - optional: `LLM_PRIMARY`, `GEMINI_MODEL`, `GROQ_MODEL`
4. Deploy. The Pages Router + API route work on the free tier.

---

## Key Features

- **Writing workspace**: `components/WritingEditor.js` autoloads any saved draft (task + name scoped), tracks word count, surfaces prompt context, and offers clear actions (Submit, Clear, Random, Save Draft).

- **Timer**: `components/Timer.js` keeps a persistent countdown with Start/Pause/Reset buttons styled for accessibility.

- **Rich evaluation**: `/api/evaluate` uses the official Google Generative AI SDK for Gemini (default `gemini-2.5-pro`, smart fallbacks to flash models) and retries with Groq (`llama3-70b-8192` by default) if needed. The response includes band score, category breakdown, top errors, “How to Solve” steps/drills/checklist, a revised answer, and metadata.

- **Randomised practice**: `lib/prompts.js` exposes helpers to surface a rotating subset of Task 1/Task 2 prompts plus `getRandomTask1/Task2`. The practice page shows three prompts at a time and offers a “New Random Question” action.

- **Local history**: Results are stored in `localStorage` (`celpip:history`). The refreshed history page highlights band scores and lets you clear everything with one click.

- **Modern theming**: Accent colour `#baa86b` is baked into Tailwind tokens. Light/dark mode persists via `ThemeProvider`, buttons expose focus outlines, and backgrounds shift between #f9f9f6 and #0b0d10.

---

## Modifying Prompts & Timing

- Edit `lib/prompts.js` to add/remove prompt objects. Each task now ships with 10 samples.
- Update the `minutes` property per task to adjust the default timer (27 for Task 1, 26 for Task 2 by default).

---

## Sample API Response

```json
{
  "band": 9,
  "scores": {
    "task_response": 9,
    "coherence": 8,
    "lexis": 9,
    "grammar": 8,
    "register": 9
  },
  "top_errors": [
    {
      "title": "Article usage",
      "explanation": "Use 'a' before consonant sounds and 'an' before vowel sounds.",
      "before": "I bought an book at the store.",
      "after": "I bought a book at the store."
    }
  ],
  "how_to_solve": {
    "steps": ["Plan your email with bullet points"],
    "drills": ["Rewrite sentences to remove comma splices"],
    "checklist": ["All task requirements addressed"]
  },
  "revised_answer": "...revised response...",
  "meta": {
    "task_type": "task1",
    "word_count": 210
  }
}
```

---

## Troubleshooting

- **Missing keys**: “Missing GEMINI_API_KEY or GROQ_API_KEY” → update `.env.local`, restart `npm run dev`.
- **Provider errors**: Check quota in Google AI Studio / Groq console. The API route logs provider-specific error messages to the terminal.
- **Strict JSON**: Gemini is configured with `responseMimeType: "application/json"` and Groq uses `response_format: { type: "json_object" }`. Any malformed payload triggers a descriptive parsing error.

---

## License

This project is provided as-is for educational purposes.

