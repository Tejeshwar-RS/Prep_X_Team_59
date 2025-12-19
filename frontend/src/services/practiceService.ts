import api from './api'
import { GenerateQuestionResponse, SubmitAnswerResponse } from '../types/types'

/**
 * Generate a practice question for a specific topic
 * @param userId - User ID for tracking mastery
 * @param topic - Topic to generate question for
 * @returns Question with difficulty and options
 */
export const generateQuestion = async (
    userId: string,
    topic: string
): Promise<GenerateQuestionResponse> => {
    const response = await api.post<GenerateQuestionResponse>(
        '/api/practice/generate',
        {
            user_id: userId,
            topic: topic,
        }
    )

    return response.data
}

/**
 * Submit an answer to a practice question
 * @param userId - User ID
 * @param topic - Topic of the question
 * @param selectedOption - User's selected answer (A, B, C, or D)
 * @param correctAnswer - The correct answer
 * @returns Feedback with correctness, score, and updated mastery
 */
export const submitAnswer = async (
    userId: string,
    topic: string,
    selectedOption: string,
    correctAnswer: string
): Promise<SubmitAnswerResponse> => {
    const response = await api.post<SubmitAnswerResponse>(
        '/api/practice/submit',
        {
            user_id: userId,
            topic: topic,
            selected_option: selectedOption,
            correct_answer: correctAnswer,
        }
    )

    return response.data
}
