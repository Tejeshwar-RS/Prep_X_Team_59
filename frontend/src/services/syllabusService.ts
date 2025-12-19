import api from './api'
import { SyllabusUploadResponse, SyllabusStructureResponse } from '../types/types'

/**
 * Upload a PDF syllabus file
 * @param file - PDF file to upload
 * @returns Upload response with file_id and extracted text
 */
export const uploadSyllabus = async (file: File): Promise<SyllabusUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<SyllabusUploadResponse>(
        '/api/syllabus/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    )

    return response.data
}

/**
 * Structure the extracted syllabus text
 * @param syllabusText - Extracted text from PDF
 * @returns Structured syllabus with modules and topics
 */
export const structureSyllabus = async (syllabusText: string): Promise<SyllabusStructureResponse> => {
    const response = await api.post<SyllabusStructureResponse>(
        '/api/syllabus/structure',
        { syllabus_text: syllabusText }
    )

    return response.data
}

/**
 * Upload and structure a syllabus in one go
 * @param file - PDF file to upload
 * @returns Structured syllabus
 */
export const uploadAndStructureSyllabus = async (file: File): Promise<SyllabusStructureResponse> => {
    // First upload the file
    const uploadResponse = await uploadSyllabus(file)

    // Then structure the extracted text
    const structureResponse = await structureSyllabus(uploadResponse.extracted_text)

    return structureResponse
}
