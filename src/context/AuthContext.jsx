
// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize state from localStorage so it persists on refresh
  const [token, setToken] = useState(localStorage.getItem('cp_token'));

  // Use an effect to keep localStorage in sync with the state
  useEffect(() => {
    if (token) {
      localStorage.setItem('cp_token', token);
    } else {
      localStorage.removeItem('cp_token');
    }
  }, [token]);

  // login function now just updates the state
  const login = (newToken) => {
    setToken(newToken);
  };

  // logout function now just clears the state
  const logout = () => {
    setToken(null);
  };

  const value = { token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}