export interface Component {
  id: string
  name: string
  code: string
  created_at: string
}

export interface Unit {
  id: string
  component_id: string
  name: string
  code: string
  created_at: string
}

export interface Topic {
  id: string
  unit_id: string
  name: string
  created_at: string
}

export interface Question {
  id: string
  topic_id: string
  stem: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  bloom_level: number
  bloom_label: string
  difficulty: 'foundation' | 'higher'
  marks: number
  explanation?: string
  created_at: string
  // joined via RPC
  topic_name: string
  unit_name: string
  unit_code: string
  component_name: string
  component_code: string
}

export interface AnswerRecord {
  questionId: string
  selectedAnswer: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  bloomLevel: number
  bloomLabel: string
}

export type Difficulty = 'foundation' | 'higher' | null

// Hierarchy used by TopicSelector
export interface TopicNode {
  id: string
  name: string
}

export interface UnitNode {
  id: string
  name: string
  code: string
  topics: TopicNode[]
}

export interface ComponentNode {
  id: string
  name: string
  code: string
  units: UnitNode[]
}
