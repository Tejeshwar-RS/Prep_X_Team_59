import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { SyllabusUpload } from '../components/SyllabusUpload'
import { SyllabusDisplay } from '../components/SyllabusDisplay'
import { TopicAnalytics } from '../components/TopicAnalytics'
import { StructuredSyllabus } from '../types/types'
import { getAnalytics, getAccuracyRate, getTimeSpentHours, resetAnalytics, PracticeStats } from '../services/analyticsService'
import '../styles/Home.css'

export const Home: React.FC = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [syllabus, setSyllabus] = useState<StructuredSyllabus | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [stats, setStats] = useState<PracticeStats | null>(null)

  // Load analytics when component mounts or when returning from practice
  useEffect(() => {
    if (user) {
      const analytics = getAnalytics(user.uid)
      setStats(analytics)
    }
  }, [user])

  // Refresh analytics when user returns to home (e.g., from practice)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        const analytics = getAnalytics(user.uid)
        setStats(analytics)
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleUploadComplete = (uploadedSyllabus: StructuredSyllabus, id: string) => {
    setSyllabus(uploadedSyllabus)
    // syllabusId stored for future use (e.g., saving to user profile)
    console.log('Syllabus uploaded with ID:', id)
    setShowUpload(false)
  }

  const handleTopicSelect = (topic: string, module: string, subject?: string) => {
    navigate('/practice', { state: { topic, module, subject } })
  }

  const handleCreateExam = () => {
    setShowUpload(true)
  }

  const handlePracticeNow = () => {
    navigate('/practice')
  }

  const handleDashboardClick = () => {
    setShowUpload(false)
    setSyllabus(null)
    setShowAnalytics(false)
  }

  const handleAnalyticsClick = () => {
    setShowUpload(false)
    setSyllabus(null)
    setShowAnalytics(true)
  }

  const handleResetProgress = () => {
    if (!user) return

    const confirmed = window.confirm(
      'Are you sure you want to reset all your progress? This will delete all your statistics, streaks, and practice history. This action cannot be undone.'
    )

    if (confirmed) {
      resetAnalytics(user.uid)
      const freshStats = getAnalytics(user.uid)
      setStats(freshStats)
    }
  }

  return (
    <div className="home-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-title">PrepX</span>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-section">
            <p className="menu-label">Main</p>
            <button onClick={handleDashboardClick} className="menu-item active">
              <span className="menu-icon">📊</span>
              <span className="menu-text">Dashboard</span>
            </button>
            <button onClick={handleCreateExam} className="menu-item">
              <span className="menu-icon">✨</span>
              <span className="menu-text">Create Exam</span>
            </button>
            <button onClick={handlePracticeNow} className="menu-item">
              <span className="menu-icon">📚</span>
              <span className="menu-text">Practice</span>
            </button>
          </div>

          <div className="menu-section">
            <p className="menu-label">Account</p>
            <a href="#settings" className="menu-item">
              <span className="menu-icon">⚙️</span>
              <span className="menu-text">Settings</span>
            </a>
            <button onClick={handleAnalyticsClick} className={`menu-item ${showAnalytics ? 'active' : ''}`}>
              <span className="menu-icon">📈</span>
              <span className="menu-text">Analytics</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleResetProgress} className="reset-btn-sidebar">
            <span className="menu-icon">🔄</span>
            <span className="menu-text">Reset Progress</span>
          </button>
          <button onClick={handleLogout} className="logout-btn-sidebar">
            <span className="menu-icon">🚪</span>
            <span className="menu-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="hamburger" onClick={toggleSidebar}>
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1 className="page-title">Dashboard</h1>
          </div>

          <div className="header-right">
            <div className="user-profile">
              <div className="profile-avatar">
                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="profile-info">
                <p className="profile-name">{user?.displayName || 'User'}</p>
                <p className="profile-email">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {/* Welcome Section */}
          <section className="welcome-card">
            <div className="welcome-content">
              <h2>Welcome back! 👋</h2>
              <p>Ready to master your exams with AI?</p>
              <button className="primary-btn" onClick={handleCreateExam}>
                Upload Syllabus →
              </button>
            </div>
          </section>

          {/* Show upload component when requested */}
          {showUpload && !syllabus && (
            <section className="upload-section">
              <SyllabusUpload onUploadComplete={handleUploadComplete} />
            </section>
          )}

          {/* Show syllabus when uploaded */}
          {syllabus && (
            <section className="syllabus-section">
              <SyllabusDisplay syllabus={syllabus} onTopicSelect={handleTopicSelect} />
            </section>
          )}

          {/* Features Grid - shown when no syllabus uploaded and not in analytics view */}
          {!syllabus && !showUpload && !showAnalytics && (
            <>
              {/* Quick Stats */}
              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <h3>Questions Answered</h3>
                  <p className="stat-value">{stats?.totalQuestions || 0}</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <h3>Accuracy Rate</h3>
                  <p className="stat-value">{stats ? getAccuracyRate(stats) : 0}%</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <h3>Current Streak</h3>
                  <p className="stat-value">{stats?.currentStreak || 0}</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <h3>Time Spent</h3>
                  <p className="stat-value">{stats ? getTimeSpentHours(stats) : '0m'}</p>
                </div>
              </section>

              {/* Features Grid */}
              <section className="features-grid">
                <div className="feature-card">
                  <div className="feature-header">
                    <h3>Create Custom Exams</h3>
                    <span className="feature-badge">AI Powered</span>
                  </div>
                  <p>Generate exams tailored to your subject with AI-powered question creation</p>
                  <button className="secondary-btn" onClick={handleCreateExam}>Create Exam</button>
                </div>

                <div className="feature-card">
                  <div className="feature-header">
                    <h3>Smart Analysis</h3>
                    <span className="feature-badge">Advanced</span>
                  </div>
                  <p>Get detailed insights on your performance with AI analysis and recommendations</p>
                  <button className="secondary-btn" onClick={handleAnalyticsClick}>View Analysis</button>
                </div>

                <div className="feature-card">
                  <div className="feature-header">
                    <h3>Practice Mode</h3>
                    <span className="feature-badge">Unlimited</span>
                  </div>
                  <p>Practice with unlimited questions generated by our advanced AI system</p>
                  <button className="secondary-btn" onClick={handlePracticeNow}>Practice Now</button>
                </div>
              </section>
            </>
          )}

          {/* Analytics Section */}
          {showAnalytics && stats && (
            <TopicAnalytics stats={stats} />
          )}
        </div>
      </main>
    </div>
  )
}
