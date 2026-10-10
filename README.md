# Interview AI (GenAI Master)

An intelligent, AI-powered career preparation platform designed to help candidates ace technical and behavioral interviews.

---

## 🌟 Key Features

1. **AI Resume Day-by-Day Preparation Planner**
   - Upload your resume (PDF or text).
   - Generates a personalized daily study roadmap with actionable tasks and milestones.
   - Interactive checklist to track preparation progress.
   - Powered by Google Gemini 2.5 Flash via `@google/genai`.

2. **Real-Time AI Mock Interviewer**
   - Adaptive technical and behavioral interview simulation.
   - Dynamic follow-up questions tailored to your target role and resume context.
   - Built-in speech-to-text voice input using the Web Speech API.
   - Instant rubric-based scoring (0–100), key strengths, improvements, and ideal answers.
   - Comprehensive hiring committee assessment report upon completion.

3. **Secure Authentication & History**
   - JWT-based authentication with HTTP-only cookies and bcrypt password hashing.
   - Token blacklisting on logout.
   - Complete past interview session history and readiness tracking.

---

## 🏗️ Architecture & Tech Stack

- **Backend**: Node.js, Express 5, MongoDB (Mongoose), JWT, Bcrypt, Multer, `pdf-parse`, Google GenAI SDK (`@google/genai`).
- **Frontend**: React 19, Vite, React Router, SCSS, Axios, Lucide Icons, Web Speech API.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance
- Google Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_API_KEY=your_gemini_api_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.
