import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
})

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        // const token = localStorage.getItem('token')
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`
        // }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.data)

            // Handle specific error codes
            if (error.response.status === 401) {
                // Handle unauthorized
                console.error('Unauthorized access')
            } else if (error.response.status === 500) {
                console.error('Server error')
            }
        } else if (error.request) {
            // Request made but no response
            console.error('No response from server')
        } else {
            // Error in request setup
            console.error('Request error:', error.message)
        }

        return Promise.reject(error)
    }
)

export default api
