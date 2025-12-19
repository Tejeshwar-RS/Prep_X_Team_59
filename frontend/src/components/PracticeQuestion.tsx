import React, { useState, useEffect } from 'react'
import { generateQuestion, submitAnswer } from '../services/practiceService'
import { recordQuestion } from '../services/analyticsService'
import { Question } from '../types/types'
import '../styles/PracticeQuestion.css'

interface PracticeQuestionProps {
    userId: string
    topic: string
    subject?: string
    module?: string
}

export const PracticeQuestion: React.FC<PracticeQuestionProps> = ({ userId, topic, subject, module }) => {
    const [question, setQuestion] = useState<Question | null>(null)
    const [difficulty, setDifficulty] = useState<string>('')
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [showFeedback, setShowFeedback] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [mastery, setMastery] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

    useEffect(() => {
        loadQuestion()
    }, [topic])

    const loadQuestion = async () => {
        setLoading(true)
        setError(null)
        setShowFeedback(false)
        setSelectedOption(null)
        setQuestionStartTime(Date.now())

        try {
            const response = await generateQuestion(userId, topic)
            setQuestion(response.question)
            setDifficulty(response.difficulty)
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
            setMastery(response.updated_mastery)
            setShowFeedback(true)

            // Record analytics
            const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
            recordQuestion(userId, topic, response.correct, response.updated_mastery, timeSpent, subject, module)
        } catch (err: any) {
            console.error('Error submitting answer:', err)
            setError('Failed to submit answer. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        loadQuestion()
    }

    if (loading && !question) {
        return (
            <div className="practice-question-container">
                <div className="loading-state">
                    <div className="spinner-large"></div>
                    <p>Generating your question...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="practice-question-container">
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
        <div className="practice-question-container">
            <div className="question-header">
                <h3 className="topic-name">📖 {topic}</h3>
                <span className={`difficulty-indicator ${difficulty.toLowerCase()}`}>
                    {difficulty}
                </span>
            </div>

            <div className="question-card">
                <h2 className="question-text">{question.question}</h2>

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

                        <div className="mastery-display">
                            <span>Current Mastery:</span>
                            <div className="mastery-bar">
                                <div
                                    className="mastery-fill"
                                    style={{ width: `${mastery}%` }}
                                ></div>
                            </div>
                            <span className="mastery-percentage">{mastery.toFixed(1)}%</span>
                        </div>

                        <button className="next-btn" onClick={handleNext}>
                            Next Question →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
