import React, { useState } from 'react'
import { uploadAndStructureSyllabus } from '../services/syllabusService'
import { StructuredSyllabus } from '../types/types'
import '../styles/SyllabusUpload.css'

interface SyllabusUploadProps {
    onUploadComplete: (syllabus: StructuredSyllabus, syllabusId: string) => void
}

export const SyllabusUpload: React.FC<SyllabusUploadProps> = ({ onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile)
                setError(null)
            } else {
                setError('Please upload a PDF file')
            }
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile)
                setError(null)
            } else {
                setError('Please upload a PDF file')
            }
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first')
            return
        }

        setUploading(true)
        setError(null)

        try {
            const response = await uploadAndStructureSyllabus(file)

            // Add default subject name if not present
            const syllabusWithSubject = {
                ...response.structured_syllabus,
                subject: response.structured_syllabus.subject || 'General Subject'
            }

            onUploadComplete(syllabusWithSubject, response.syllabus_id)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(
                err.response?.data?.detail ||
                'Failed to upload and process syllabus. Please try again.'
            )
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="syllabus-upload-container">
            <div
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="upload-icon">📄</div>
                <h3>Upload Your Syllabus</h3>
                <p>Drag and drop your PDF here, or click to browse</p>

                <input
                    type="file"
                    id="file-upload"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <label htmlFor="file-upload" className="browse-btn">
                    Browse Files
                </label>

                {file && (
                    <div className="file-info">
                        <span className="file-name">📎 {file.name}</span>
                        <span className="file-size">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={!file || uploading}
            >
                {uploading ? (
                    <>
                        <span className="spinner"></span>
                        Processing...
                    </>
                ) : (
                    'Upload & Process'
                )}
            </button>
        </div>
    )
}
