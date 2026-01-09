CodeClash — Competitive Programming Platform
README — project overview, install & run instructions, API reference, architecture, and maintenance notes

Table of contents
    1. Project summary
    2. Key features
    3. Architecture & tech stack
    4. Repository layout (important files & folders)
    5. Models / database schema (overview)
    6. API endpoints (summary & examples)
    7. Frontend routes (user-facing)
    8. Install / Run (development)
    9. Environment variables (.env)
    10. AI Code Review integration (OpenRouter / Gemini via OpenRouter)
    11. Leaderboard: generation, storage & recommended flow
    12. Security, performance & operational notes
    13. Troubleshooting — common errors & fixes
    14. Testing & QA suggestions
    15. Future improvements / roadmap
    16. Contributing
    17. License

Project summary
CodeClash is a web application to host competitive programming contests. It provides:
    • contest creation and join flow,
    • problem display and in-browser code editor,
    • submission to Judge0 for automatic judging,
    • live leaderboards (generated server-side),
    • optional AI-powered post-contest code review using an LLM provider routed through OpenRouter.
This README documents backend and frontend integration points, likely runtime environment, and instructions for running and extending the project.

Key features
    • Create/join contests (with numQuestions and schedule).
    • Automatic random question assignment (on join or admin-triggered).
    • Submissions routed to Judge0 (async polling).
    • Leaderboard generation from accepted submissions.
    • Persisted user accounts with JWT authentication.
    • AI Code Review (server-side) using OpenRouter -> Gemini model or fallback.
    • Frontend SPA in React (CodeEditor, Timer components, routes for problems, contests, leaderboard).

Architecture & tech stack
    • Backend: Node.js, Express, Mongoose (MongoDB).
    • Authentication: JWT (token in Authorization header).
    • Judge: Judge0 (third-party execution API).
    • AI: OpenRouter (proxy to Google Gemini Flash experimental/free model).
    • Frontend: React, react-router, custom CodeEditor component, Tailwind/CSS.
    • Storage: MongoDB (contests, users, questions, submissions).
    • Deployment: any Node hosting (Render, DigitalOcean, Heroku), and static hosting for frontend.

Repository layout (important files & folders)

/backend
  /controllers
    contestController.js
    submissionController.js
    authController.js
  /models
    Contest.js
    Question.js
    Submission.js
    User.js
  /routes
    authRoutes.js
    questionRoutes.js
    submissionRoutes.js
    contestRoutes.js
    aiRoutes.js
  /services
    aiService.js
    judge0.js
  server.js (or app.js)
  config/db.js
  middleware/authMiddleware.js
/frontend
  /src
    /components
      Navbar.jsx
      CodeEditor.jsx
      Timer.jsx
    /pages
      HomePage.jsx
      ContestList.jsx
      ContestPage.jsx
      ProblemPage.jsx
      LeaderboardPage.jsx
    services/api.js (axios instance)
    context/AuthContext.jsx
    App.jsx

Models / database schema (overview)

User 

{
  _id,
  name,
  email,
  password,         // hashed
  joinedContests: [ObjectId], // contest ids
  createdAt,
  updatedAt
}
Question

{
  _id,
  title,
  description,      // HTML or markdown
  difficulty,        // "Easy"|"Medium"|"Hard"
  testcases,         // stored for judge or not (optional)
  createdBy,
  createdAt
}
Contest

{
  _id,
  name,
  startTime,        // Date
  endTime,          // Date
  numQuestions,     // number requested per contest
  questions: [ObjectId],  // assigned question ids
  participants: [ObjectId],
  createdBy,
  createdAt,
  leaderboard?: [{ userId, name, score, solved }] // optional persisted snapshot
}
Submission

{
  _id,
  user: ObjectId,
  contest: ObjectId,
  question: ObjectId,
  languageId,
  sourceCode,
  verdict,        // e.g., "Accepted", "Wrong Answer", "Runtime Error"
  points,         // if you assign per difficulty
  createdAt,
  judgeToken,     // token/identifier from Judge0
  resultPayload   // (optional) full result
}

API endpoints (summary & examples)
    Base: http://<server>/api
Auth
    • POST /api/auth/register — register
    • POST /api/auth/login — get JWT
Questions
    • GET /api/questions/:id — fetch one question
Contests
    • GET /api/contest — list contests (used on homepage)
    • GET /api/contest/:id — metadata about contest (no questions)
    • POST /api/contest — create contest (auth required)
    • POST /api/contest/:id/join — join contest (auth required)
    • POST /api/contest/:id/assign-random — admin/creator reassign questions
    • GET /api/contest/:id/questions — fetch contest questions (visible when contest started)
Submissions
    • POST /api/submissions — create submission (routes to judge service)
    • GET /api/submissions/:id — fetch submission verdict
Leaderboard
    • GET /api/contest/:id/leaderboard — generate leaderboard from submissions (or fetch persisted)
AI (code review)
    • POST /api/ai/code-review — server-side endpoint that calls OpenRouter (protected route or public based on design)
    
    
Example: Create submission

POST /api/submissions
Authorization: Bearer <token>
{
  "language_id": 54,
  "source_code": "int main(){ return 0; }",
  "contestId": "638...",
  "questionId": "63a..."
}


Example: AI review request

POST /api/ai/code-review
Authorization: Bearer <token>
{
  "code": "...",
  "language": "C++ (g++)",
  "problem": "Problem description here"
}

Frontend routes (user-facing)
    • /home — main landing + dashboard
    • /contest — all contests
    • /contest/:id — contest details & join
    • /contest/:id/problem/:pid — problem and editor (submissions)
    • /contest/:id/leaderboard — leaderboard page (ideally protected or public as desired)
    • /login, /register
    
Note: App uses AuthContext to store JWT in localStorage (cp_token). Axios instance attaches Authorization: Bearer <token> automatically.

Install / Run (development)
Prerequisites
    • Node 18+ or 16+
    • MongoDB running
    



Backend

cd backend
npm install

npm run dev    # or `node server.js`


Frontend

cd frontend
npm install
npm run dev    # or `npm start`
Open http://localhost:3000 (or frontend dev port) and the backend at http://localhost:4000/api.

Environment variables (.env)
Create .env in backend folder:

PORT=4000
MONGO_URI=mongodb://localhost:27017/competitive_platform
JWT_SECRET=your_jwt_secret_here
# Judge0 (example - rapidapi)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=...
# OpenRouter (recommended for free access)
OPENROUTER_API_KEY=or_...
# (If you attempt direct Gemini) — not recommended for free server
GEMINI_API_KEY=...
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/...



AI Code Review integration (OpenRouter / Gemini via OpenRouter)
Why use OpenRouter: it provides OpenAI-compatible endpoints for many models (including free experimental Gemini variants). 
Backend usage (recommended)
    • Create an account on OpenRouter, obtain OPENROUTER_API_KEY.
    • Implement server-side codeReview service that posts to https://openrouter.ai/api/v1/chat/completions with payload:

{
  "model": "google/gemini-2.0-flash-exp:free",
  "messages": [{ "role": "user", "content": "<prompt text>" }],
  "temperature": 0.3,
  "max_tokens": 700
}
    • Return choices[0].message.content as review.


Frontend
    • Call /api/ai/code-review from the frontend (POST), include code, language, problem. Protect endpoint if desired.
    • Disable button and show spinner while waiting; cache results to avoid repeated calls (OpenRouter free tier has shared limits).

Leaderboard: generation, storage & recommended flow
There are two patterns:
1. Leaderboard
    • On request GET /api/contest/:id/leaderboard, backend:
        ○ Loads contest participants and questions
        ○ Fetches submissions for contest where verdict ~ accepted
        ○ Builds a scoreboard map (unique solved per user; scoring by difficulty)
        ○ Sorts and returns
Pros: Up-to-date.
Cons: Costly for many submissions; heavy DB read.

2. Persisted leaderboard snapshot
    • When contest endTime passes, run a background job or a scheduled task to:
        ○ Compute leaderboard 
        ○ Save snapshot into contest.leaderboardSnapshot
    • GET /contest/:id/leaderboard returns persisted snapshot if present;
Why this is better
    • Fast reads for public pages.
    • Avoids repeated heavy computation and DB     traffic.
    • Allows historical leaderboards.
Implementation tip
    • Add isLeaderboardFinalized: Boolean and leaderboardSnapshot to Contest schema.
    • Create an automation or cron job:
        ○ if (Date.now() > contest.endTime && !isLeaderboardFinalized) computeAndSaveLeaderboard(contestId)
