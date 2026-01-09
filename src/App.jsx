import React, { useContext } from 'react';
import HomePage from './pages/HomePage'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ContestList from './pages/ContestList'
import ContestPage from './pages/ContestPage'
import ProblemPage from './pages/ProblemPage'
import LeaderboardPage from './pages/LeaderboardPage'   
import Navbar from './components/Navbar'
import { AuthContext, AuthProvider } from './context/AuthContext';


  function PrivateRoute({ children }) {
    const { token } = useContext(AuthContext); 
    if (!token) {
      
      return <Navigate to="/login" replace />;
    }
      return children;
  }



  function PublicRoute({ children}){
    const {token} = useContext(AuthContext);
    if(token) {
      
      return <Navigate to="/home" replace />;
    }
    return children;
  }

export default function App(){
  return (
    <AuthProvider>
      <Navbar />
      <div className="w-full overflow-x-hidden">
        <Routes>

          <Route path="/" element={<Navigate to="/home" replace />} />
          
          <Route path="/login" element={ <PublicRoute>  <LoginPage/>  </PublicRoute> } />
          <Route path="/register" element={<PublicRoute>  <RegisterPage/>  </PublicRoute>} />
          
          <Route path="/home" element={<HomePage/>} />
          <Route path="/contest" element={<ContestList/>} />
          
          <Route path="/contest/:id" element={<PrivateRoute><ContestPage/></PrivateRoute>} />
          <Route path="/contest/:id/leaderboard" element={<PrivateRoute><LeaderboardPage/></PrivateRoute>} />
          <Route path="/contest/:id/problem/:pid" element={<PrivateRoute><ProblemPage/></PrivateRoute>} />
        
        </Routes>
      </div>
    </AuthProvider>
  )
}
