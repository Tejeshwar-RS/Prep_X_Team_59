import React from 'react'
import { StructuredSyllabus, Module, Topic } from '../types/types'
import '../styles/SyllabusDisplay.css'

interface SyllabusDisplayProps {
    syllabus: StructuredSyllabus
    onTopicSelect: (topic: string, module: string, subject?: string) => void
}

export const SyllabusDisplay: React.FC<SyllabusDisplayProps> = ({ syllabus, onTopicSelect }) => {
    return (
        <div className="syllabus-display-container">
            <h2 className="syllabus-title">📚 Your Syllabus Structure</h2>

            <div className="modules-container">
                {syllabus.modules.map((module: Module, moduleIndex: number) => (
                    <div key={moduleIndex} className="module-card">
                        <div className="module-header">
                            <h3 className="module-name">{module.name}</h3>
                            <span className="topic-count">{module.topics.length} topics</span>
                        </div>

                        <div className="topics-list">
                            {module.topics.map((topic: Topic, topicIndex: number) => (
                                <div key={topicIndex} className="topic-item">
                                    <div className="topic-header">
                                        <h4 className="topic-name">{topic.name}</h4>
                                        <span className={`difficulty-badge ${topic.difficulty_hint}`}>
                                            {topic.difficulty_hint}
                                        </span>
                                    </div>

                                    {topic.subtopics && topic.subtopics.length > 0 && (
                                        <ul className="subtopics-list">
                                            {topic.subtopics.map((subtopic: string, subIndex: number) => (
                                                <li key={subIndex} className="subtopic-item">
                                                    {subtopic}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <button
                                        className="practice-topic-btn"
                                        onClick={() => onTopicSelect(topic.name, module.name, syllabus.subject)}
                                    >
                                        Practice This Topic →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
