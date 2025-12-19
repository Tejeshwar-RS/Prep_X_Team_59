import React, { useState, useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { PracticeQuestion } from '../components/PracticeQuestion'
import { AssessmentMode } from '../components/AssessmentMode'
import { isAssessmentCompleted } from '../services/analyticsService'
import '../styles/Practice.css'

export const Practice: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)

    // Get topic, module, and subject from navigation state
    const initialTopic = location.state?.topic || ''
    const module = location.state?.module || ''
    const subject = location.state?.subject || ''
    const [topic, setTopic] = useState(initialTopic)
    const [customTopic, setCustomTopic] = useState('')
    const [isCustomMode, setIsCustomMode] = useState(!initialTopic)
    const [needsAssessment, setNeedsAssessment] = useState(false)
    const [showAssessment, setShowAssessment] = useState(false)
    const [initialMastery, setInitialMastery] = useState<number | undefined>(undefined)

    // Check if topic needs assessment
    useEffect(() => {
        if (user && topic && !isCustomMode) {
            const assessed = isAssessmentCompleted(user.uid, topic)
            setNeedsAssessment(!assessed)
            setShowAssessment(!assessed)
        }
    }, [user, topic, isCustomMode])

    const handleStartPractice = () => {
        if (customTopic.trim()) {
            setTopic(customTopic)
            setIsCustomMode(false)
            // Check if custom topic needs assessment
            if (user) {
                const assessed = isAssessmentCompleted(user.uid, customTopic)
                setNeedsAssessment(!assessed)
                setShowAssessment(!assessed)
            }
        }
    }

    const handleAssessmentComplete = (mastery: number) => {
        setInitialMastery(mastery)
        setShowAssessment(false)
        setNeedsAssessment(false)
    }

    const handleBackToHome = () => {
        navigate('/home')
    }

    const handleChangeTopic = () => {
        setIsCustomMode(true)
        setTopic('')
        setCustomTopic('')
    }

    if (!user) {
        return <div>Please log in to practice</div>
    }

    return (
        <div className="practice-page">
            <div className="practice-header">
                <button className="back-btn" onClick={handleBackToHome}>
                    ← Back to Home
                </button>
                <h1 className="practice-title">🎯 Practice Mode</h1>
            </div>

            {isCustomMode || !topic ? (
                <div className="topic-selection-container">
                    <div className="topic-selection-card">
                        <h2>Choose a Topic to Practice</h2>
                        <p>Enter any topic you'd like to practice</p>

                        <input
                            type="text"
                            className="topic-input"
                            placeholder="e.g., Data Structures, Machine Learning, etc."
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleStartPractice()}
                        />

                        <button
                            className="start-practice-btn"
                            onClick={handleStartPractice}
                            disabled={!customTopic.trim()}
                        >
                            Start Practice →
                        </button>
                    </div>
                </div>
            ) : (
                <div className="practice-content">
                    <div className="practice-controls">
                        <button className="change-topic-btn" onClick={handleChangeTopic}>
                            Change Topic
                        </button>
                    </div>

                    {showAssessment ? (
                        <AssessmentMode
                            userId={user.uid}
                            topic={topic}
                            subject={subject}
                            module={module}
                            onComplete={handleAssessmentComplete}
                        />
                    ) : (
                        <PracticeQuestion
                            userId={user.uid}
                            topic={topic}
                            subject={subject}
                            module={module}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
