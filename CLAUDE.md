# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Next.js dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # ESLint via Next.js
```

## Stack

- **Next.js 16** (App Router, `app/` directory) — TypeScript, React 19
- **Tailwind CSS v4** — configured via `postcss.config.mjs` using `@tailwindcss/postcss`; import is `@import "tailwindcss"` in `globals.css` (no `tailwind.config.ts` needed)
- **Supabase** — client at `@/lib/supabase.ts`; env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

## Architecture

### Database (Supabase / PostgreSQL)
Schema lives in `supabase/migrations/`. Hierarchy: `components → units → topics → questions`. Student responses go in `student_answers` with RLS scoped to `auth.uid()`.

The `get_quiz_questions` RPC (`supabase/migrations/20260401000001_get_quiz_questions_rpc.sql`) accepts `p_topic_id`, `p_bloom_max`, `p_difficulty`, `p_limit` and returns random questions joined with breadcrumb fields (`topic_name`, `unit_name`, `component_name`).

### App structure
```
app/
  layout.tsx            # root layout, imports globals.css
  globals.css           # @import "tailwindcss"
  quiz/page.tsx         # main quiz page — composes TopicSelector + QuizSession
  components/quiz/
    TopicSelector.tsx   # fetches component→unit→topic tree; bloom slider; difficulty toggle
    QuizSession.tsx     # calls get_quiz_questions RPC; one-question-at-a-time; results screen
lib/
  supabase.ts           # createClient singleton
types/
  index.ts              # shared TypeScript interfaces (Component, Unit, Topic, Question, AnswerRecord, ComponentNode…)
```

### Data flow
`QuizPage` (`app/quiz/page.tsx`) owns `topicId`, `bloomMax`, `difficulty` state. `TopicSelector` calls the three callbacks to update them and triggers `onTopicSelect` to switch to quiz phase. `QuizSession` receives those values as props and calls the RPC on mount.

Bloom levels 1–4 map to: Remember, Understand, Apply, Analyse. Difficulty is `'foundation'` | `'higher'` | `null` (both).
