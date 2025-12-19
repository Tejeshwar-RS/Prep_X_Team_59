import React, { useState, useEffect } from 'react'
import { generateQuestion, submitAnswer } from '../services/practiceService'
import {
    AssessmentQuestion,
    getNextAssessmentDifficulty,
    completeAssessment
} from '../services/analyticsService'
import { Question } from '../types/types'
import '../styles/AssessmentMode.css'

interface AssessmentModeProps {
    userId: string
    topic: string
    subject?: string
    module?: string
    onComplete: (initialMastery: number) => void
}

const TOTAL_QUESTIONS = 5

export const AssessmentMode: React.FC<AssessmentModeProps> = ({
    userId,
    topic,
    subject,
    module,
    onComplete
}) => {
    const [currentQuestion, setCurrentQuestion] = useState(1)
    const [question, setQuestion] = useState<Question | null>(null)
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [showFeedback, setShowFeedback] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([])
    const [showResults, setShowResults] = useState(false)
    const [results, setResults] = useState<{ initialMastery: number; classification: string } | null>(null)
    const [showIntro, setShowIntro] = useState(true)

    useEffect(() => {
        if (!showIntro && !showResults) {
            loadQuestion()
        }
    }, [currentQuestion, showIntro, showResults])

    const loadQuestion = async () => {
        setLoading(true)
        setError(null)
        setShowFeedback(false)
        setSelectedOption(null)

        try {
            const response = await generateQuestion(userId, topic)
            setQuestion(response.question)
            setDifficulty(response.difficulty as 'easy' | 'medium' | 'hard')
        } catch (err: any) {
            console.error('Error loading question:', err)
            setError('Failed to load question. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedOption || !question) return

        setLoading(true)
        try {
            const response = await submitAnswer(
                userId,
                topic,
                selectedOption,
                question.correct_answer
            )

            setIsCorrect(response.correct)
            setShowFeedback(true)

            // Record this assessment question
            const newAssessmentQuestion: AssessmentQuestion = {
                difficulty,
                isCorrect: response.correct
            }
            const updatedQuestions = [...assessmentQuestions, newAssessmentQuestion]
            setAssessmentQuestions(updatedQuestions)

            // If this was the last question, show results
            if (currentQuestion === TOTAL_QUESTIONS) {
                setTimeout(() => {
                    const assessmentResults = completeAssessment(
                        userId,
                        topic,
                        updatedQuestions,
                        subject,
                        module
                    )
                    setResults(assessmentResults)
                    setShowResults(true)
                }, 2000) // Show feedback for 2 seconds before results
            }
        } catch (err: any) {
            console.error('Error submitting answer:', err)
            setError('Failed to submit answer. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        // Calculate next difficulty
        const nextDifficulty = getNextAssessmentDifficulty(
            currentQuestion + 1,
            isCorrect,
            difficulty
        )
        setDifficulty(nextDifficulty)
        setCurrentQuestion(currentQuestion + 1)
    }

    const handleStartAssessment = () => {
        setShowIntro(false)
    }

    const handleStartPractice = () => {
        if (results) {
            onComplete(results.initialMastery)
        }
    }

    if (showIntro) {
        return (
            <div className="assessment-container">
                <div className="assessment-intro">
                    <div className="intro-icon">🎯</div>
                    <h2>Let's Assess Your Knowledge</h2>
                    <p className="intro-subtitle">Topic: <strong>{topic}</strong></p>

                    <div className="intro-content">
                        <p>Before we start practicing, let's determine your current skill level.</p>

                        <div className="intro-features">
                            <div className="intro-feature">
                                <span className="feature-icon">📝</span>
                                <span>Answer 5 adaptive questions</span>
                            </div>
                            <div className="intro-feature">
                                <span className="feature-icon">🎚️</span>
                                <span>Difficulty adjusts based on your answers</span>
                            </div>
                            <div className="intro-feature">
                                <span className="feature-icon">⚡</span>
                                <span>Takes only 5-10 minutes</span>
                            </div>
                            <div className="intro-feature">
                                <span className="feature-icon">🎓</span>
                                <span>Get personalized question difficulty</span>
                            </div>
                        </div>

                        <button className="start-assessment-btn" onClick={handleStartAssessment}>
                            Start Assessment →
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (showResults && results) {
        const totalCorrect = assessmentQuestions.filter(q => q.isCorrect).length

        return (
            <div className="assessment-container">
                <div className="assessment-results">
                    <div className="results-icon">🎉</div>
                    <h2>Assessment Complete!</h2>

                    <div className="results-stats">
                        <div className="result-stat">
                            <span className="stat-label">Correct Answers</span>
                            <span className="stat-value">{totalCorrect}/{TOTAL_QUESTIONS}</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Accuracy</span>
                            <span className="stat-value">{Math.round((totalCorrect / TOTAL_QUESTIONS) * 100)}%</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Initial Mastery</span>
                            <span className="stat-value">{results.initialMastery}%</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Level</span>
                            <span className={`stat-value level-${results.classification.toLowerCase()}`}>
                                {results.classification}
                            </span>
                        </div>
                    </div>

                    <div className="mastery-visualization">
                        <div className="mastery-bar-container">
                            <div
                                className="mastery-bar-fill"
                                style={{ width: `${results.initialMastery}%` }}
                            ></div>
                        </div>
                        <p className="mastery-label">{results.initialMastery}% Mastery</p>
                    </div>

                    <p className="results-message">
                        Great job! We've set your starting level. You're ready to begin practicing!
                    </p>

                    <button className="start-practice-btn" onClick={handleStartPractice}>
                        Start Practice →
                    </button>
                </div>
            </div>
        )
    }

    if (loading && !question) {
        return (
            <div className="assessment-container">
                <div className="loading-state">
                    <div className="spinner-large"></div>
                    <p>Generating assessment question...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="assessment-container">
                <div className="error-state">
                    <p>⚠️ {error}</p>
                    <button onClick={loadQuestion} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!question) return null

    return (
        <div className="assessment-container">
            <div className="assessment-header">
                <div className="assessment-progress">
                    <div className="progress-text">
                        Question {currentQuestion} of {TOTAL_QUESTIONS}
                    </div>
                    <div className="progress-bar">
                        {Array.from({ length: TOTAL_QUESTIONS }).map((_, index) => (
                            <div
                                key={index}
                                className={`progress-step ${index < currentQuestion ? 'completed' : ''} ${index === currentQuestion - 1 ? 'active' : ''}`}
                            ></div>
                        ))}
                    </div>
                </div>
                <div className="difficulty-badge">
                    <span className={`difficulty-indicator ${difficulty}`}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </span>
                </div>
            </div>

            <div className="assessment-question-card">
                <h3 className="question-text">{question.question}</h3>

                <div className="options-container">
                    {Object.entries(question.options).map(([key, value]) => (
                        <button
                            key={key}
                            className={`option-btn ${selectedOption === key ? 'selected' : ''} ${showFeedback
                                ? key === question.correct_answer
                                    ? 'correct'
                                    : selectedOption === key
                                        ? 'incorrect'
                                        : ''
                                : ''
                                }`}
                            onClick={() => !showFeedback && setSelectedOption(key)}
                            disabled={showFeedback}
                        >
                            <span className="option-letter">{key}</span>
                            <span className="option-text">{value}</span>
                        </button>
                    ))}
                </div>

                {!showFeedback ? (
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={!selectedOption || loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Answer'}
                    </button>
                ) : (
                    <div className="feedback-section">
                        <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
                            {isCorrect ? (
                                <>
                                    <span className="feedback-icon">✅</span>
                                    <span>Correct! Well done!</span>
                                </>
                            ) : (
                                <>
                                    <span className="feedback-icon">❌</span>
                                    <span>Incorrect. The correct answer is {question.correct_answer}.</span>
                                </>
                            )}
                        </div>

                        <div className="explanation-box">
                            <h4>Explanation:</h4>
                            <p>{question.explanation}</p>
                        </div>

                        {currentQuestion < TOTAL_QUESTIONS && (
                            <>
                                <div className="adaptive-feedback">
                                    {isCorrect && difficulty !== 'hard' && (
                                        <p>📈 Great! Moving to a harder question</p>
                                    )}
                                    {!isCorrect && difficulty !== 'easy' && (
                                        <p>📉 Let's try an easier question</p>
                                    )}
                                </div>
                                <button className="next-btn" onClick={handleNext}>
                                    Next Question →
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
