PREPX PROJECT OVERVIEW

PrepX is an AI-powered exam and practice system with a React + TypeScript frontend and a FastAPI backend.

FRONTEND
- React 18 with TypeScript and Vite
- Single-page authentication flow with sign in and sign up modes
- Firebase email/password authentication
- Session persistence across refresh
- Protected routes so only authenticated users can access the main app

BACKEND
- FastAPI application exposing the PREPX API
- CORS enabled for the frontend
- Health check at /health
- Routes for syllabus upload, syllabus structuring, and practice question generation

KEY FRONTEND FEATURES
- Sign up with email, password, and confirmation
- Sign in with email and password
- Client-side form validation (email format, minimum password length, password match)
- Clear error and success messages
- Password visibility toggle
- Mobile-friendly layout

KEY FILES
- frontend/src/pages/Auth.tsx: authentication page with sign in and sign up logic
- frontend/src/context/AuthContext.tsx: authentication and session management
- frontend/src/components/ProtectedRoute.tsx: route protection based on auth state
- frontend/src/firebase/config.ts: Firebase client configuration
- backend/main.py: FastAPI app, CORS configuration, and route registration

HOW TO RUN THE FRONTEND
1. Change directory to frontend.
2. Install dependencies with npm install.
3. Start the dev server with npm run dev.
4. Open the printed localhost URL in a browser.

HOW TO RUN THE BACKEND
1. Change directory to backend.
2. Create or activate a Python virtual environment.
3. Install dependencies from requirements.txt.
4. Run the FastAPI app with uvicorn main:app --reload.

AUTHENTICATION BEHAVIOR
- New users sign up on the auth page and are redirected to the protected home page on success.
- Existing users sign in with the same form in sign in mode.
- Sessions persist so users stay logged in on refresh until they log out.

NEXT STEPS
- Add password reset and email verification.
- Extend the frontend with exam creation, practice, and analytics screens.
- Add more backend endpoints as needed for exam generation and analytics.
