'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ComponentNode, Difficulty } from '@/types'

const BLOOM_LABELS = ['Remember', 'Understand', 'Apply', 'Analyse']

interface Props {
  onTopicSelect: (topicId: string | null) => void
  onBloomChange: (level: number) => void
  onDifficultyChange: (difficulty: string | null) => void
}

export default function TopicSelector({ onTopicSelect, onBloomChange, onDifficultyChange }: Props) {
  const [tree, setTree] = useState<ComponentNode[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [bloomMax, setBloomMax] = useState(4)
  const [difficultyToggle, setDifficultyToggle] = useState<'foundation' | 'higher' | 'both'>('both')

  useEffect(() => {
    async function fetchHierarchy() {
      const { data: components } = await supabase
        .from('components')
        .select('id, name, code')
        .order('code')

      const { data: units } = await supabase
        .from('units')
        .select('id, component_id, name, code')
        .order('code')

      const { data: topics } = await supabase
        .from('topics')
        .select('id, unit_id, name')
        .order('name')

      if (!components || !units || !topics) return

      const built: ComponentNode[] = components.map((c) => ({
        ...c,
        units: units
          .filter((u) => u.component_id === c.id)
          .map((u) => ({
            ...u,
            topics: topics.filter((t) => t.unit_id === u.id),
          })),
      }))

      setTree(built)
      setLoading(false)
    }

    fetchHierarchy()
  }, [])

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleBloom(value: number) {
    setBloomMax(value)
    onBloomChange(value)
  }

  function handleDifficulty(value: 'foundation' | 'higher' | 'both') {
    setDifficultyToggle(value)
    onDifficultyChange(value === 'both' ? null : value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      <h1 className="text-2xl font-bold text-indigo-700">WJEC Physics Quiz</h1>

      {/* Practise All */}
      <button
        onClick={() => onTopicSelect(null)}
        className="w-full rounded-xl bg-indigo-600 py-3 text-center font-semibold text-white shadow hover:bg-indigo-700 active:scale-95 transition-transform"
      >
        Practise All Topics
      </button>

      {/* Topic tree */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        {tree.map((component) => (
          <div key={component.id}>
            <button
              onClick={() => toggleExpand(component.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-gray-800 hover:bg-gray-50"
            >
              <span>
                <span className="mr-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-mono text-indigo-700">
                  {component.code}
                </span>
                {component.name}
              </span>
              <span className="text-gray-400">{expanded[component.id] ? '▲' : '▼'}</span>
            </button>

            {expanded[component.id] && (
              <div className="divide-y divide-gray-50">
                {component.units.map((unit) => (
                  <div key={unit.id} className="pl-4">
                    <button
                      onClick={() => toggleExpand(unit.id)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <span>
                        <span className="mr-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-500">
                          {unit.code}
                        </span>
                        {unit.name}
                      </span>
                      <span className="text-gray-400 text-xs">{expanded[unit.id] ? '▲' : '▼'}</span>
                    </button>

                    {expanded[unit.id] && (
                      <ul className="divide-y divide-gray-50 pl-4">
                        {unit.topics.map((topic) => (
                          <li key={topic.id}>
                            <button
                              onClick={() => onTopicSelect(topic.id)}
                              className="w-full px-4 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                            >
                              {topic.name}
                            </button>
                          </li>
                        ))}
                        {unit.topics.length === 0 && (
                          <li className="px-4 py-2 text-xs text-gray-400">No topics yet</li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bloom level slider */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Max Bloom Level</span>
          <span className="rounded bg-indigo-100 px-2 py-0.5 text-sm font-semibold text-indigo-700">
            {bloomMax} — {BLOOM_LABELS[bloomMax - 1]}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={4}
          value={bloomMax}
          onChange={(e) => handleBloom(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          {BLOOM_LABELS.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      {/* Difficulty toggle */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
        <span className="text-sm font-medium text-gray-700">Difficulty</span>
        <div className="mt-2 flex rounded-lg overflow-hidden border border-gray-200">
          {(['foundation', 'both', 'higher'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => handleDifficulty(opt)}
              className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                difficultyToggle === opt
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
