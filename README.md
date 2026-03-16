# EXAMIO

Final exam study planner. Add exams with dates and study windows, track topics by difficulty, and manage homework with due dates. The planner can generate a daily to-do from your exams and homework.

**Stack:** Next.js 14, Firebase (Auth), optional Ollama-compatible API for the AI planner.

**Run:** `npm install` then `npm run dev`. Set Firebase env vars in `.env.local` (see `.env.local.example`). For the AI planner, either use the default remote API or set `OLLAMA_HOST` and `OLLAMA_MODEL` for local Ollama.
