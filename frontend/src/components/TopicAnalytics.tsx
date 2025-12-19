import React, { useState } from 'react'
import {
    PracticeStats,
    TopicPerformance,
    getSubjects,
    getModulesForSubject,
    getTopicsForModule,
    getTopicAccuracy,
    getTopicClassification,
    getSubjectProgress,
    getModuleProgress
} from '../services/analyticsService'
import '../styles/TopicAnalytics.css'

interface TopicAnalyticsProps {
    stats: PracticeStats
}

export const TopicAnalytics: React.FC<TopicAnalyticsProps> = ({ stats }) => {
    const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
    const [sortBy, setSortBy] = useState<'name' | 'accuracy' | 'mastery'>('name')

    const subjects = getSubjects(stats)

    const toggleSubject = (subject: string) => {
        const newExpanded = new Set(expandedSubjects)
        if (newExpanded.has(subject)) {
            newExpanded.delete(subject)
        } else {
            newExpanded.add(subject)
        }
        setExpandedSubjects(newExpanded)
    }

    const toggleModule = (moduleKey: string) => {
        const newExpanded = new Set(expandedModules)
        if (newExpanded.has(moduleKey)) {
            newExpanded.delete(moduleKey)
        } else {
            newExpanded.add(moduleKey)
        }
        setExpandedModules(newExpanded)
    }

    const sortTopics = (topics: Array<{ name: string; performance: TopicPerformance }>) => {
        return [...topics].sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name)
            } else if (sortBy === 'accuracy') {
                return getTopicAccuracy(b.performance) - getTopicAccuracy(a.performance)
            } else {
                return b.performance.mastery - a.performance.mastery
            }
        })
    }

    const getClassificationBadge = (accuracy: number) => {
        const classification = getTopicClassification(accuracy)
        const badges = {
            strength: { icon: '🟢', label: 'Strength', className: 'badge-strength' },
            developing: { icon: '🟡', label: 'Developing', className: 'badge-developing' },
            weakness: { icon: '🔴', label: 'Weakness', className: 'badge-weakness' }
        }
        return badges[classification]
    }

    if (subjects.length === 0) {
        return (
            <div className="topic-analytics-container">
                <div className="analytics-header">
                    <h2>📊 Topic-Wise Analytics</h2>
                    <p className="analytics-subtitle">Analyze your strengths and weaknesses</p>
                </div>
                <div className="empty-analytics">
                    <p>No analytics data available yet.</p>
                    <p>Start practicing with a syllabus to see your topic-wise performance!</p>
                </div>
            </div>
        )
    }

    return (
        <div className="topic-analytics-container">
            <div className="analytics-header">
                <h2>📊 Topic-Wise Analytics</h2>
                <p className="analytics-subtitle">Analyze your strengths and weaknesses per topic</p>

                <div className="analytics-controls">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                        <option value="name">Topic Name</option>
                        <option value="accuracy">Accuracy</option>
                        <option value="mastery">Mastery</option>
                    </select>
                </div>
            </div>

            <div className="legend">
                <span className="legend-item">
                    <span className="badge-strength">🟢 Strength</span>
                    <span className="legend-desc">≥70% accuracy</span>
                </span>
                <span className="legend-item">
                    <span className="badge-developing">🟡 Developing</span>
                    <span className="legend-desc">50-69% accuracy</span>
                </span>
                <span className="legend-item">
                    <span className="badge-weakness">🔴 Weakness</span>
                    <span className="legend-desc">&lt;50% accuracy</span>
                </span>
            </div>

            <div className="subjects-container">
                {subjects.map((subject) => {
                    const subjectProgress = getSubjectProgress(stats, subject)
                    const modules = getModulesForSubject(stats, subject)
                    const isExpanded = expandedSubjects.has(subject)

                    return (
                        <div key={subject} className="subject-card">
                            <div
                                className="subject-header"
                                onClick={() => toggleSubject(subject)}
                            >
                                <div className="subject-info">
                                    <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                                    <h3>{subject}</h3>
                                    <span className="module-count">{modules.length} modules</span>
                                </div>
                                <div className="subject-stats">
                                    <span className="stat-item">
                                        <span className="stat-label">Questions:</span>
                                        <span className="stat-value">{subjectProgress.totalQuestions}</span>
                                    </span>
                                    <span className="stat-item">
                                        <span className="stat-label">Accuracy:</span>
                                        <span className="stat-value">{subjectProgress.accuracy}%</span>
                                    </span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="modules-container">
                                    {modules.map((module) => {
                                        const moduleKey = `${subject}-${module}`
                                        const moduleProgress = getModuleProgress(stats, subject, module)
                                        const topics = sortTopics(getTopicsForModule(stats, subject, module))
                                        const isModuleExpanded = expandedModules.has(moduleKey)

                                        return (
                                            <div key={moduleKey} className="module-card">
                                                <div
                                                    className="module-header"
                                                    onClick={() => toggleModule(moduleKey)}
                                                >
                                                    <div className="module-info">
                                                        <span className="expand-icon">{isModuleExpanded ? '▼' : '▶'}</span>
                                                        <h4>{module}</h4>
                                                        <span className="topic-count">{topics.length} topics</span>
                                                    </div>
                                                    <div className="module-stats">
                                                        <span className="stat-item">
                                                            <span className="stat-label">Questions:</span>
                                                            <span className="stat-value">{moduleProgress.totalQuestions}</span>
                                                        </span>
                                                        <span className="stat-item">
                                                            <span className="stat-label">Accuracy:</span>
                                                            <span className="stat-value">{moduleProgress.accuracy}%</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {isModuleExpanded && (
                                                    <div className="topics-grid">
                                                        {topics.map(({ name, performance }) => {
                                                            const accuracy = getTopicAccuracy(performance)
                                                            const badge = getClassificationBadge(accuracy)

                                                            return (
                                                                <div key={name} className="topic-card">
                                                                    <div className="topic-header">
                                                                        <h5 className="topic-name">{name}</h5>
                                                                        <span className={`classification-badge ${badge.className}`}>
                                                                            {badge.icon} {badge.label}
                                                                        </span>
                                                                    </div>

                                                                    <div className="topic-stats">
                                                                        <div className="stat-row">
                                                                            <span className="stat-label">Questions Answered:</span>
                                                                            <span className="stat-value">{performance.questions}</span>
                                                                        </div>
                                                                        <div className="stat-row">
                                                                            <span className="stat-label">Correct Answers:</span>
                                                                            <span className="stat-value">{performance.correct}</span>
                                                                        </div>
                                                                        <div className="stat-row">
                                                                            <span className="stat-label">Accuracy:</span>
                                                                            <span className="stat-value">{accuracy}%</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mastery-section">
                                                                        <div className="mastery-label">
                                                                            <span>Mastery Level</span>
                                                                            <span className="mastery-percentage">{performance.mastery.toFixed(1)}%</span>
                                                                        </div>
                                                                        <div className="mastery-bar">
                                                                            <div
                                                                                className="mastery-fill"
                                                                                style={{ width: `${performance.mastery}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
