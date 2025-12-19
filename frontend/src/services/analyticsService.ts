// Analytics service for tracking practice sessions

export interface AssessmentQuestion {
    difficulty: 'easy' | 'medium' | 'hard'
    isCorrect: boolean
}

export interface AssessmentResult {
    questions: AssessmentQuestion[]
    totalCorrect: number
    initialMastery: number
    completedAt: string
}

export interface TopicPerformance {
    questions: number
    correct: number
    mastery: number
    subject?: string
    module?: string
    assessmentCompleted?: boolean
    assessmentResult?: AssessmentResult
}

export interface PracticeStats {
    totalQuestions: number
    correctAnswers: number
    totalTimeSpent: number // in seconds
    currentStreak: number
    lastPracticeDate: string
    topicStats: {
        [topic: string]: {
            questions: number
            correct: number
            mastery: number
        }
    }
    // Hierarchical tracking: subject -> module -> topic -> stats
    subjectModuleTopicStats?: {
        [subject: string]: {
            [module: string]: {
                [topic: string]: TopicPerformance
            }
        }
    }
    // Assessment tracking
    assessments?: {
        [topic: string]: AssessmentResult
    }
}

const STORAGE_KEY = 'prepx_analytics'

// Get analytics from localStorage
export const getAnalytics = (userId: string): PracticeStats => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
    if (stored) {
        return JSON.parse(stored)
    }

    return {
        totalQuestions: 0,
        correctAnswers: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        lastPracticeDate: '',
        topicStats: {},
        subjectModuleTopicStats: {},
        assessments: {}
    }
}

// Save analytics to localStorage
export const saveAnalytics = (userId: string, stats: PracticeStats): void => {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(stats))
}

// Record a practice question
export const recordQuestion = (
    userId: string,
    topic: string,
    isCorrect: boolean,
    mastery: number,
    timeSpent: number,
    subject?: string,
    module?: string
): PracticeStats => {
    const stats = getAnalytics(userId)

    // Update overall stats
    stats.totalQuestions++
    if (isCorrect) {
        stats.correctAnswers++
    }
    stats.totalTimeSpent += timeSpent

    // Update streak
    const today = new Date().toDateString()
    if (stats.lastPracticeDate !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        if (stats.lastPracticeDate === yesterday.toDateString()) {
            stats.currentStreak++
        } else {
            stats.currentStreak = 1
        }
        stats.lastPracticeDate = today
    }

    // Update topic stats (backward compatibility)
    if (!stats.topicStats[topic]) {
        stats.topicStats[topic] = {
            questions: 0,
            correct: 0,
            mastery: 0
        }
    }

    stats.topicStats[topic].questions++
    if (isCorrect) {
        stats.topicStats[topic].correct++
    }
    stats.topicStats[topic].mastery = mastery

    // Update hierarchical stats if subject and module are provided
    if (subject && module) {
        if (!stats.subjectModuleTopicStats) {
            stats.subjectModuleTopicStats = {}
        }
        if (!stats.subjectModuleTopicStats[subject]) {
            stats.subjectModuleTopicStats[subject] = {}
        }
        if (!stats.subjectModuleTopicStats[subject][module]) {
            stats.subjectModuleTopicStats[subject][module] = {}
        }
        if (!stats.subjectModuleTopicStats[subject][module][topic]) {
            stats.subjectModuleTopicStats[subject][module][topic] = {
                questions: 0,
                correct: 0,
                mastery: 0,
                subject,
                module
            }
        }

        const topicPerf = stats.subjectModuleTopicStats[subject][module][topic]
        topicPerf.questions++
        if (isCorrect) {
            topicPerf.correct++
        }
        topicPerf.mastery = mastery
    }

    saveAnalytics(userId, stats)
    return stats
}

// Get accuracy rate
export const getAccuracyRate = (stats: PracticeStats): number => {
    if (stats.totalQuestions === 0) return 0
    return Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
}

// Get time spent in hours
export const getTimeSpentHours = (stats: PracticeStats): string => {
    const hours = Math.floor(stats.totalTimeSpent / 3600)
    const minutes = Math.floor((stats.totalTimeSpent % 3600) / 60)

    if (hours === 0) {
        return `${minutes}m`
    }
    return `${hours}h ${minutes}m`
}

// Reset all analytics for a user
export const resetAnalytics = (userId: string): void => {
    localStorage.removeItem(`${STORAGE_KEY}_${userId}`)
}

// Get accuracy rate for a specific topic
export const getTopicAccuracy = (topicPerf: TopicPerformance): number => {
    if (topicPerf.questions === 0) return 0
    return Math.round((topicPerf.correct / topicPerf.questions) * 100)
}

// Classify topic as strength, developing, or weakness
export const getTopicClassification = (accuracy: number): 'strength' | 'developing' | 'weakness' => {
    if (accuracy >= 70) return 'strength'
    if (accuracy >= 50) return 'developing'
    return 'weakness'
}

// Get all subjects from analytics
export const getSubjects = (stats: PracticeStats): string[] => {
    if (!stats.subjectModuleTopicStats) return []
    return Object.keys(stats.subjectModuleTopicStats)
}

// Get all modules for a subject
export const getModulesForSubject = (stats: PracticeStats, subject: string): string[] => {
    if (!stats.subjectModuleTopicStats || !stats.subjectModuleTopicStats[subject]) return []
    return Object.keys(stats.subjectModuleTopicStats[subject])
}

// Get all topics for a module
export const getTopicsForModule = (stats: PracticeStats, subject: string, module: string): Array<{ name: string; performance: TopicPerformance }> => {
    if (!stats.subjectModuleTopicStats ||
        !stats.subjectModuleTopicStats[subject] ||
        !stats.subjectModuleTopicStats[subject][module]) {
        return []
    }

    const topics = stats.subjectModuleTopicStats[subject][module]
    return Object.entries(topics).map(([name, performance]) => ({ name, performance }))
}

// Calculate subject-level progress
export const getSubjectProgress = (stats: PracticeStats, subject: string): { totalQuestions: number; correctAnswers: number; accuracy: number } => {
    if (!stats.subjectModuleTopicStats || !stats.subjectModuleTopicStats[subject]) {
        return { totalQuestions: 0, correctAnswers: 0, accuracy: 0 }
    }

    let totalQuestions = 0
    let correctAnswers = 0

    Object.values(stats.subjectModuleTopicStats[subject]).forEach(module => {
        Object.values(module).forEach(topic => {
            totalQuestions += topic.questions
            correctAnswers += topic.correct
        })
    })

    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    return { totalQuestions, correctAnswers, accuracy }
}

// Calculate module-level progress
export const getModuleProgress = (stats: PracticeStats, subject: string, module: string): { totalQuestions: number; correctAnswers: number; accuracy: number } => {
    if (!stats.subjectModuleTopicStats ||
        !stats.subjectModuleTopicStats[subject] ||
        !stats.subjectModuleTopicStats[subject][module]) {
        return { totalQuestions: 0, correctAnswers: 0, accuracy: 0 }
    }

    let totalQuestions = 0
    let correctAnswers = 0

    Object.values(stats.subjectModuleTopicStats[subject][module]).forEach(topic => {
        totalQuestions += topic.questions
        correctAnswers += topic.correct
    })

    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    return { totalQuestions, correctAnswers, accuracy }
}

// ============ ASSESSMENT FUNCTIONS ============

// Check if a topic has been assessed
export const isAssessmentCompleted = (userId: string, topic: string): boolean => {
    const stats = getAnalytics(userId)
    return stats.assessments?.[topic]?.completedAt !== undefined
}

// Get assessment result for a topic
export const getAssessmentResult = (userId: string, topic: string): AssessmentResult | null => {
    const stats = getAnalytics(userId)
    return stats.assessments?.[topic] || null
}

// Calculate initial mastery from assessment questions
// Weighted scoring: Easy=1.0, Medium=1.5, Hard=2.0
export const calculateInitialMastery = (questions: AssessmentQuestion[]): number => {
    if (questions.length === 0) return 0

    const weights = {
        easy: 1.0,
        medium: 1.5,
        hard: 2.0
    }

    let totalPoints = 0
    let maxPoints = 0

    questions.forEach(q => {
        const weight = weights[q.difficulty]
        maxPoints += weight
        if (q.isCorrect) {
            totalPoints += weight
        }
    })

    return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0
}

// Complete assessment and store results
export const completeAssessment = (
    userId: string,
    topic: string,
    questions: AssessmentQuestion[],
    subject?: string,
    module?: string
): { initialMastery: number; classification: string } => {
    const stats = getAnalytics(userId)

    const totalCorrect = questions.filter(q => q.isCorrect).length
    const initialMastery = calculateInitialMastery(questions)

    const assessmentResult: AssessmentResult = {
        questions,
        totalCorrect,
        initialMastery,
        completedAt: new Date().toISOString()
    }

    // Store in assessments
    if (!stats.assessments) {
        stats.assessments = {}
    }
    stats.assessments[topic] = assessmentResult

    // Initialize topic stats with assessment mastery
    if (!stats.topicStats[topic]) {
        stats.topicStats[topic] = {
            questions: 0,
            correct: 0,
            mastery: initialMastery
        }
    } else {
        stats.topicStats[topic].mastery = initialMastery
    }

    // Initialize hierarchical stats if subject/module provided
    if (subject && module) {
        if (!stats.subjectModuleTopicStats) {
            stats.subjectModuleTopicStats = {}
        }
        if (!stats.subjectModuleTopicStats[subject]) {
            stats.subjectModuleTopicStats[subject] = {}
        }
        if (!stats.subjectModuleTopicStats[subject][module]) {
            stats.subjectModuleTopicStats[subject][module] = {}
        }
        if (!stats.subjectModuleTopicStats[subject][module][topic]) {
            stats.subjectModuleTopicStats[subject][module][topic] = {
                questions: 0,
                correct: 0,
                mastery: initialMastery,
                subject,
                module,
                assessmentCompleted: true,
                assessmentResult
            }
        } else {
            stats.subjectModuleTopicStats[subject][module][topic].mastery = initialMastery
            stats.subjectModuleTopicStats[subject][module][topic].assessmentCompleted = true
            stats.subjectModuleTopicStats[subject][module][topic].assessmentResult = assessmentResult
        }
    }

    saveAnalytics(userId, stats)

    // Classify based on mastery
    let classification = 'Beginner'
    if (initialMastery >= 70) {
        classification = 'Advanced'
    } else if (initialMastery >= 40) {
        classification = 'Intermediate'
    }

    return { initialMastery, classification }
}

// Get next difficulty for assessment based on previous answer
export const getNextAssessmentDifficulty = (
    questionNumber: number,
    previousCorrect: boolean,
    currentDifficulty: 'easy' | 'medium' | 'hard'
): 'easy' | 'medium' | 'hard' => {
    // First question is always medium
    if (questionNumber === 1) {
        return 'medium'
    }

    // Adapt based on previous answer
    if (previousCorrect) {
        // Move up in difficulty
        if (currentDifficulty === 'easy') return 'medium'
        if (currentDifficulty === 'medium') return 'hard'
        return 'hard' // Stay at hard
    } else {
        // Move down in difficulty
        if (currentDifficulty === 'hard') return 'medium'
        if (currentDifficulty === 'medium') return 'easy'
        return 'easy' // Stay at easy
    }
}

