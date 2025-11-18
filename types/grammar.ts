export interface GrammarPoint {
  id: string
  title: string
  description: string
  structure: string
  examples: {
    japanese: string
    romaji: string
    vietnamese: string
  }[]
  notes?: string[]
}

export type GrammarData = {
  [key: number]: GrammarPoint[]
}

