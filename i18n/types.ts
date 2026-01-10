export type Locale = 'vi' | 'en' | 'ja'

export interface Translations {
  common: {
    lesson: string
    loading: string
    continue: string
    check: string
    next: string
    prev: string
    shuffle: string
    correct: string
    incorrect: string
    answer: string
    submit: string
    reset: string
    close: string
  }
  navigation: {
    vocabulary: string
    grammar: string
    flashcard: string
    exercise: string
    quiz: string
    usage: string
  }
  flashcard: {
    title: string
    viewMeaning: string
    fillMeaning: string
    clickToView: string
    hideMeaning: string
    enterMeaning: string
    checked: string
    noData: string
  }
  exercise: {
    title: string
    fill: string
    fillKanjiHiragana: string
    fillHiraganaFromKanji: string
    score: string
    streak: string
    checking: string
    correctAnswer: string
    enterAnswer: string
    correctPoints: string
    wrongAnswer: string
    practicedWords: string
    noData: string
    generating: string
    noExercise: string
  }
  vocabulary: {
    title: string
    kanji: string
    hiragana: string
    meaning: string
    details: string
    expand: string
    collapse: string
    explanation: string
    noData: string
  }
  grammar: {
    title: string
    noData: string
  }
  quiz: {
    title: string
    result: string
    noData: string
  }
  usage: {
    title: string
    intro: string
    noData: string
  }
  reading: {
    passage: string
    questions: string
    question: string
    submit: string
  }
}
