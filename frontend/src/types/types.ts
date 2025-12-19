// TypeScript interfaces for API data structures

export interface Topic {
    name: string
    difficulty_hint: 'easy' | 'medium' | 'hard'
    subtopics: string[]
}

export interface Module {
    name: string
    topics: Topic[]
}

export interface StructuredSyllabus {
    modules: Module[]
    subject?: string  // Optional subject name for analytics
}

export interface SyllabusUploadResponse {
    file_id: string
    extracted_text: string
}

export interface SyllabusStructureResponse {
    syllabus_id: string
    structured_syllabus: StructuredSyllabus
}

export interface QuestionOptions {
    A: string
    B: string
    C: string
    D: string
}

export interface Question {
    question: string
    options: QuestionOptions
    correct_answer: 'A' | 'B' | 'C' | 'D'
    explanation: string
}

export interface GenerateQuestionResponse {
    topic: string
    difficulty: string
    question: Question
}

export interface SubmitAnswerResponse {
    correct: boolean
    score: number
    updated_mastery: number
    next_difficulty: string
}

export interface PracticeSession {
    userId: string
    topic: string
    questionsAnswered: number
    correctAnswers: number
    currentMastery: number
}
