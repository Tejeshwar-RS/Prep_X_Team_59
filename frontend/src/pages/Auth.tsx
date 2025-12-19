import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase/config'
import '../styles/Auth.css'

type AuthMode = 'login' | 'signup'

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = (): boolean => {
    setError('')
    setSuccess('')

    if (mode === 'signup' && !username.trim()) {
      setError('Username is required')
      return false
    }

    if (mode === 'signup' && username.trim().length < 3) {
      setError('Username must be at least 3 characters')
      return false
    }

    if (!email.trim()) {
      setError('Email is required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        setError('Please confirm your password')
        return false
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    }

    return true
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let userCredential
      
      if (mode === 'login') {
        // Sign In
        userCredential = await signInWithEmailAndPassword(auth, email, password)
        setSuccess('Signing in...')
      } else {
        // Sign Up
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        // Save username to Firebase profile
        await updateProfile(userCredential.user, {
          displayName: username.trim()
        })
        setSuccess('Account created! Redirecting...')
      }

      if (userCredential.user) {
        setUsername('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        
        setTimeout(() => {
          navigate('/home', { replace: true })
        }, 500)
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message: string }
      
      let errorMessage = firebaseError.message || 'An error occurred'
      
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.'
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.'
      } else if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up.'
      } else if (firebaseError.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setSuccess('')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1 className="auth-title">PrepX</h1>
        </div>
        <p className="auth-subtitle">One AI, Any Exam.</p>
        
        <div className="auth-mode-indicator">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleAuth} className="auth-form">
          {mode === 'signup' && (
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                placeholder="Choose a username"
                className="input-field"
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Enter your email"
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder={mode === 'login' ? 'Enter your password' : 'Create a password (min. 6 characters)'}
                className="input-field"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Confirm your password"
                  className="input-field"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="auth-button"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="toggle-btn"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
