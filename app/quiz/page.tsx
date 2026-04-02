'use client'

import { useState } from 'react'
import TopicSelector from '@/app/components/quiz/TopicSelector'
import QuizSession from '@/app/components/quiz/QuizSession'

type Phase = 'select' | 'quiz'

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>('select')
  const [topicId, setTopicId] = useState<string | null>(null)
  const [bloomMax, setBloomMax] = useState(4)
  const [difficulty, setDifficulty] = useState<string | null>(null)

  function handleTopicSelect(id: string | null) {
    setTopicId(id)
    setPhase('quiz')
  }

  function handleReset() {
    setPhase('select')
    setTopicId(null)
  }

  if (phase === 'quiz') {
    return (
      <main className="min-h-screen py-8">
        <QuizSession
          topicId={topicId}
          bloomMax={bloomMax}
          difficulty={difficulty}
          onReset={handleReset}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8">
      <TopicSelector
        onTopicSelect={handleTopicSelect}
        onBloomChange={setBloomMax}
        onDifficultyChange={setDifficulty}
      />
    </main>
  )
}
