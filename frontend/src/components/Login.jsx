import React, { useState, useEffect } from "react";
import "./Login.css";
import { useAuth } from "../context/AuthContext";
import { Lock, User, AlertCircle, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [adminCreds, setAdminCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError("");
  }, [adminCreds.username, adminCreds.password]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

  const handleStudentLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(adminCreds),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.token) {
          localStorage.setItem("authToken", data.token);
          if (data?.role) {
            setUser({
              id: data.id || data.user?.id,
              role: data.role,
              username: data.username || data.user?.username,
            });
          } else if (data?.user?.role) {
            setUser({
              id: data.user.id,
              role: data.user.role,
              username: data.user.username,
            });
          }
        }
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid admin credentials");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell single">
        <div className="auth-panel auth-card">
          <div className="login-brand">
            <span className="brand-pill">R&amp;D Portal</span>
            <h2 className="auth-title">Login</h2>
            <p className="auth-subtitle">Use your institutional email to continue</p>
          </div>

          <div className="auth-section">
            <h3>Student Access</h3>
            <button className="google-btn" type="button" onClick={handleStudentLogin}>
              <GraduationCap size={18} />
              Continue with Google
            </button>
          </div>

          <div className="auth-section">
            <h3>Admin Access</h3>
            {error && (
              <div className="auth-error">
                <AlertCircle size={16} style={{ marginRight: 6 }} />
                {error}
              </div>
            )}
            <form onSubmit={handleAdminLogin}>
              <div className="auth-field">
                <label>Username</label>
                <div className="input-row">
                  <User size={16} />
                  <input
                    type="text"
                    value={adminCreds.username}
                    onChange={(e) =>
                      setAdminCreds({ ...adminCreds, username: e.target.value })
                    }
                    placeholder="admin"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>Password</label>
                <div className="input-row">
                  <Lock size={16} />
                  <input
                    type="password"
                    value={adminCreds.password}
                    onChange={(e) =>
                      setAdminCreds({ ...adminCreds, password: e.target.value })
                    }
                    placeholder="Enter password"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="primary-btn">
                {isLoading ? "Signing In..." : "Login as Admin"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
