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
    total: string
    word: string
    grammarPoint: string
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
    invalidType: string
    typeNotFound: string
    fillWordQuestion: string
    translateQuestion: string
    kanjiQuestion: string
    kanjiQuestionNoHiragana: string
    correctKanjiHiragana: string
    answerCanBe: string
    orKanji: string
    orHiragana: string
    readingResult: string
    readingQuestions: string
    aiError: string
    correctHiraganaReading: string
    correctReading: string
    empty: string
    whatIs: string
    readAs: string
    aiGenerated: string
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
    typeNoun: string
    typeVerb: string
    typeAdjective: string
    typeAdverb: string
    typeOther: string
  }
  grammar: {
    title: string
    noData: string
    total: string
    point: string
    titleHeader: string
    structure: string
    example: string
    details: string
    collapse: string
    viewDetails: string
    explanation: string
    examples: string
    notes: string
  }
  quiz: {
    title: string
    result: string
    noData: string
    loading: string
    quizTitle: string
    resultHeader: string
    showHiragana: string
    hideHiragana: string
    questionList: string
    correct: string
    incorrect: string
    shuffleTooltip: string
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
    pleaseAnswerAll: string
  }
  home: {
    selectLesson: string
    lesson: string
  }
  alphabet: {
    title: string
    basicTable: string
    combinedTable: string
    viewAlphabet: string
  }
}
