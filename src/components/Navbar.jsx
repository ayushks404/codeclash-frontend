// frontend/src/components/Navbar.jsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; // NOTE: useNavigate is NOT imported. This is correct.
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const logged = !!token;

  const handleLogout = () => {
    logout();
    // This is the key fix: We use window.location.href, NOT nav() or useNavigate().
    // This forces a full page reload to the login route, ensuring a clean state.
    window.location.href = '/login';
  };

  return (
    <div className="nav">
      <div style={{ fontWeight: 700 }}>CP Platform</div>
      <div>
        {logged ? (
          <>
            <Link to="/home">Home</Link>
            <Link to="/contest">All Contests</Link>
            <a style={{ cursor: 'pointer' }} onClick={handleLogout}>Logout</a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}