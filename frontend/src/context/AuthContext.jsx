import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionRes = await fetch('/auth/me', {
          credentials: 'include'
        });
        if (sessionRes.ok) {
          const sessionUser = await sessionRes.json();
          if (sessionUser.token) {
            localStorage.setItem("authToken", sessionUser.token);
          }
          setUser({
            id: sessionUser.id,
            role: sessionUser.role,
            name: sessionUser.name,
            email: sessionUser.email,
            department: sessionUser.department,
            designation: sessionUser.designation,
            username: sessionUser.username
          });
          return;
        }
      } catch {
        // Ignore session lookup errors and fall back to token
      }

      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser({ id: decoded.id, role: decoded.role });
        } catch {
          localStorage.removeItem('authToken');
        }
      }
    };

    initAuth().finally(() => setLoading(false));
  }, []);

  const logout = () => {
    fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId="339558770508-3ooj3aupmb38ql1s4irn5d7hdms300ap.apps.googleusercontent.com">
      <AuthContext.Provider
        value={{
          user,
          setUser,
          logout,
          loading,
          isAdmin: user?.role === 'admin'
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};
