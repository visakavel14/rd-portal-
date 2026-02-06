// src/components/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import api from "../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setError(error.response?.data?.message || "Failed to load dashboard");
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <p style={{ padding: "16px" }}>Loading dashboard...</p>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: "16px" }}>
        <p>No data available</p>
        {error && <p style={{ color: "#8b1d2c" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <h1 style={{ marginBottom: "30px", color: "#2c3e50" }}>Admin Dashboard</h1>

      {/* ================= STAT CARDS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <StatCard
          title="Total Publications"
          value={stats.totals.publications}
          recent={stats.recent.publications}
          color="#3498db"
        />
        <StatCard
          title="Project Proposals"
          value={stats.totals.proposals}
          recent={stats.recent.proposals}
          color="#e67e22"
        />
        <StatCard
          title="PhD Scholars"
          value={stats.totals.scholars}
          recent={stats.recent.scholars}
          color="#27ae60"
        />
        <StatCard
          title="IPRs"
          value={stats.totals.iprs}
          recent={stats.recent.iprs}
          color="#9b59b6"
        />
      </div>

      {/* ================= WEEKLY CHART ================= */}
      {stats.weeklyData?.length > 0 && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "30px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minHeight: "320px",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "#333" }}>Weekly Updates</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="publications" fill="#3498db" />
              <Bar dataKey="iprs" fill="#9b59b6" />
              <Bar dataKey="proposals" fill="#e67e22" />
              <Bar dataKey="scholars" fill="#27ae60" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ================= ACTIVITY SUMMARY ================= */}
      {stats.inactivitySummary && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginBottom: "15px", color: "#333" }}>
            Activity Summary (Last 6 Months)
          </h2>

          <p style={{ fontSize: "16px", color: "#666" }}>
            Total Users: <strong>{stats.inactivitySummary.totalUsers}</strong>
          </p>
          <p style={{ fontSize: "16px", color: "#666" }}>
            Active Users: <strong>{stats.inactivitySummary.activeUsers}</strong>
          </p>
          <p style={{ fontSize: "16px", color: "#e67e22" }}>
            Users with No Recent Activity:{" "}
            <strong>{stats.inactivitySummary.usersWithNoRecentActivity}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

/* ================= STAT CARD COMPONENT ================= */
const StatCard = ({ title, value, recent, color }) => (
  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      borderLeft: `5px solid ${color}`,
    }}
  >
    <h3 style={{ marginBottom: "10px", color: "#555" }}>{title}</h3>
    <div
      style={{
        fontSize: "32px",
        fontWeight: "bold",
        color: "#333",
        marginBottom: "10px",
      }}
    >
      {value}
    </div>
    <p style={{ fontSize: "14px", color: "#888" }}>+{recent} in last 30 days</p>
  </div>
);

export default AdminDashboard;
