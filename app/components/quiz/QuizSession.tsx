'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Question, AnswerRecord } from '@/types'

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const

interface Props {
  topicId: string | null
  bloomMax: number
  difficulty: string | null
  onReset: () => void
}

export default function QuizSession({ topicId, bloomMax, difficulty, onReset }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase.rpc('get_quiz_questions', {
        p_topic_id: topicId ?? null,
        p_bloom_max: bloomMax,
        p_difficulty: difficulty ?? null,
        p_limit: 10,
      })

      if (rpcError) {
        setError(rpcError.message)
      } else if (!data || data.length === 0) {
        setError('No questions found for these filters. Try adjusting the Bloom level or difficulty.')
      } else {
        setQuestions(data as Question[])
      }

      setLoading(false)
    }

    load()
  }, [topicId, bloomMax, difficulty])

  function handleSelect(answer: 'A' | 'B' | 'C' | 'D') {
    if (selected) return // already answered
    const q = questions[index]
    const isCorrect = answer === q.correct_answer
    setSelected(answer)
    setAnswers((prev) => [
      ...prev,
      { questionId: q.id, selectedAnswer: answer, isCorrect, bloomLevel: q.bloom_level, bloomLabel: q.bloom_label },
    ])
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading questions…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center space-y-4">
        <p className="text-red-600">{error}</p>
        <button onClick={onReset} className="rounded-lg bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700">
          Back
        </button>
      </div>
    )
  }

  if (finished) {
    return <ResultsScreen answers={answers} questions={questions} onReset={onReset} />
  }

  const q = questions[index]
  const optionValues: Record<'A' | 'B' | 'C' | 'D', string> = {
    A: q.option_a,
    B: q.option_b,
    C: q.option_c,
    D: q.option_d,
  }

  return (
    <div className="mx-auto max-w-lg p-4 space-y-4">
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400">
        {q.component_name} › {q.unit_name} › {q.topic_name}
      </p>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          {index + 1} / {questions.length}
        </span>
      </div>

      {/* Bloom badge */}
      <div className="flex gap-2">
        <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-medium text-indigo-700">
          {q.bloom_label}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600 capitalize">
          {q.difficulty}
        </span>
      </div>

      {/* Stem */}
      <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
        <p className="text-base font-medium leading-relaxed text-gray-800">{q.stem}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {OPTION_KEYS.map((key) => {
          const isCorrect = key === q.correct_answer
          const isSelected = key === selected
          let bg = 'bg-white border-gray-200 text-gray-800 hover:border-indigo-400 hover:bg-indigo-50'

          if (selected) {
            if (isCorrect) bg = 'bg-green-50 border-green-500 text-green-800'
            else if (isSelected) bg = 'bg-red-50 border-red-400 text-red-800'
            else bg = 'bg-white border-gray-200 text-gray-400'
          }

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={!!selected}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${bg} disabled:cursor-default`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                {key}
              </span>
              <span>{optionValues[key]}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation + Next */}
      {selected && (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 text-sm ${selected === q.correct_answer ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-semibold mb-1">{selected === q.correct_answer ? '✓ Correct' : '✗ Incorrect'}</p>
            {q.explanation && <p>{q.explanation}</p>}
          </div>
          <button
            onClick={handleNext}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700 active:scale-95 transition-transform"
          >
            {index + 1 >= questions.length ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Results screen ────────────────────────────────────────────────────────────

function ResultsScreen({
  answers,
  questions,
  onReset,
}: {
  answers: AnswerRecord[]
  questions: Question[]
  onReset: () => void
}) {
  const score = answers.filter((a) => a.isCorrect).length
  const total = answers.length
  const pct = Math.round((score / total) * 100)

  // Bloom breakdown
  const bloomGroups = [1, 2, 3, 4].map((level) => {
    const group = answers.filter((a) => a.bloomLevel === level)
    const correct = group.filter((a) => a.isCorrect).length
    const label = group[0]?.bloomLabel ?? `Level ${level}`
    return { level, label, correct, total: group.length }
  }).filter((g) => g.total > 0)

  return (
    <div className="mx-auto max-w-lg p-4 space-y-6">
      <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center space-y-2">
        <p className="text-4xl font-bold text-indigo-700">{score}/{total}</p>
        <p className="text-lg font-medium text-gray-700">{pct}%</p>
        <p className="text-sm text-gray-500">
          {pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort — keep revising.' : 'Keep practising — you\'ll get there!'}
        </p>
      </div>

      {/* Bloom breakdown */}
      <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-gray-700">Bloom Level Breakdown</p>
        {bloomGroups.map((g) => (
          <div key={g.level} className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{g.label}</span>
              <span>{g.correct}/{g.total}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: g.total > 0 ? `${(g.correct / g.total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow hover:bg-indigo-700 active:scale-95 transition-transform"
      >
        Choose Another Topic
      </button>
    </div>
  )
}
