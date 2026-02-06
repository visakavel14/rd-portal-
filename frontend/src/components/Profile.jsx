import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    department: "",
    designation: "",
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [changing, setChanging] = useState(false);
  const isAdmin = user?.role === "admin";
  const loadedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      if (loadedRef.current) return;
      loadedRef.current = true;
      try {
        const [meRes, statsRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/users/stats"),
        ]);
        setProfile(meRes.data);
        setForm({
          name: meRes.data.name || "",
          department: meRes.data.department || "",
          designation: meRes.data.designation || "",
        });
        setStats(statsRes.data);
        setUser({
          id: meRes.data.id,
          role: meRes.data.role,
          name: meRes.data.name,
          email: meRes.data.email,
          department: meRes.data.department,
          designation: meRes.data.designation,
          username: meRes.data.username,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, setUser]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChanging(true);
    setError("");
    try {
      await api.put("/users/change-password", passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setChanging(false);
    }
  };

  if (!user) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2>Profile</h2>
          <p>Please log in to view your profile.</p>
          <button style={primaryBtn} onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>No profile data available.</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={gridStyle}>
        <div style={cardStyle}>
          <h2>{isAdmin ? "Admin" : "User"} Profile</h2>
          <p style={{ color: "#666" }}>
            {profile.name || profile.username || "User"} •{" "}
            {profile.email || "No email"}
          </p>
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}
          <div style={sectionStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Name</label>
              <input
                value={form.name}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              <input value={profile.email || ""} disabled style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Department</label>
              <input
                value={form.department}
                disabled={!editing}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Designation</label>
              <input
                value={form.designation}
                disabled={!editing}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {!editing ? (
                <button
                  style={primaryBtn}
                  type="button"
                  onClick={() => {
                    setSuccess("");
                    setEditing(true);
                  }}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    style={primaryBtn}
                    type="button"
                    onClick={async () => {
                      setError("");
                      setSuccess("");
                      try {
                        const res = await api.put("/users/profile", {
                          name: form.name,
                          department: form.department,
                          designation: form.designation,
                        });
                        setProfile(res.data);
                        setUser({
                          id: res.data.id,
                          role: res.data.role,
                          name: res.data.name,
                          email: res.data.email,
                          department: res.data.department,
                          designation: res.data.designation,
                          username: res.data.username,
                        });
                        setEditing(false);
                        setSuccess("Profile saved successfully.");
                      } catch (err) {
                        setError(
                          err.response?.data?.message || "Failed to save profile"
                        );
                      }
                    }}
                  >
                    Save Profile
                  </button>
                  <button
                    style={secondaryBtn}
                    type="button"
                    onClick={() => {
                      setForm({
                        name: profile.name || "",
                        department: profile.department || "",
                        designation: profile.designation || "",
                      });
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h3>Uploads</h3>
          {stats ? (
            <ul style={statListStyle}>
              <li>Publications: <strong>{stats.publications}</strong></li>
              <li>Projects: <strong>{stats.proposals}</strong></li>
              <li>PhD Scholars: <strong>{stats.scholars}</strong></li>
              <li>Patents/IPR: <strong>{stats.iprs}</strong></li>
            </ul>
          ) : (
            <p>No stats available</p>
          )}

          {isAdmin && (
            <div style={sectionStyle}>
              <h3>Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Current Password</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    style={inputStyle}
                  />
                </div>
                <button style={primaryBtn} type="submit" disabled={changing}>
                  {changing ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

const pageStyle = {
  padding: "24px",
  minHeight: "100vh",
  backgroundColor: "#f6f7fb",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  pointerEvents: "auto",
};

const sectionStyle = {
  marginTop: "16px",
  paddingTop: "12px",
  borderTop: "1px solid #eee",
};

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" };
const labelStyle = { fontSize: "13px", fontWeight: 600 };
const inputStyle = { height: "40px", borderRadius: "8px", border: "1px solid #ddd", padding: "0 10px", color: "#1b1e2b", background: "#fff", caretColor: "#1b1e2b", pointerEvents: "auto" };
const primaryBtn = { height: "42px", borderRadius: "8px", border: "none", background: "#1b2a44", color: "#fff", fontWeight: 600, cursor: "pointer", padding: "0 14px" };
const secondaryBtn = { height: "42px", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", color: "#333", fontWeight: 600, cursor: "pointer", padding: "0 14px" };
const errorStyle = { background: "#fdecec", border: "1px solid #f4b7b7", color: "#8b1d2c", padding: "8px 10px", borderRadius: "8px", marginTop: "10px" };
const successStyle = { background: "#e6f5ea", border: "1px solid #b7e0c2", color: "#1f5f2d", padding: "8px 10px", borderRadius: "8px", marginTop: "10px" };
const statListStyle = { listStyle: "none", padding: 0, margin: "10px 0 0 0", display: "grid", gap: "8px" };
