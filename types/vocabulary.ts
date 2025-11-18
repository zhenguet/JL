export type WordType = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other'

export interface WordExplanation {
  title?: string
  content: string[]
}

export interface VocabularyWord {
  id: string
  kanji: string
  hiragana: string
  en: string
  vi: string
  type: WordType
  explanation?: WordExplanation
}

export type VocabularyData = {
  [key: number]: VocabularyWord[]
}

