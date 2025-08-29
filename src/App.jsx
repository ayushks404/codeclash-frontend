import React, { useContext } from 'react';
import HomePage from './pages/HomePage'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/CreateContestPage'
import ContestList from './pages/ContestList'
import ContestPage from './pages/ContestPage'
import ProblemPage from './pages/ProblemPage'
import LeaderboardPage from './pages/LeaderboardPage'   // <- changed to import page wrapper
import Navbar from './components/Navbar'
import { AuthContext, AuthProvider } from './context/AuthContext';


function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext); // 3. Use token from context
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App(){
  return (
    <AuthProvider>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/contest/:id/leaderboard" element={<PrivateRoute><LeaderboardPage/></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><HomePage/></PrivateRoute>} />
          <Route path="/contest" element={<PrivateRoute><ContestList/></PrivateRoute>} />
          <Route path="/contest/:id" element={<PrivateRoute><ContestPage/></PrivateRoute>} />
          <Route path="/contest/:id/problem/:pid" element={<PrivateRoute><ProblemPage/></PrivateRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
