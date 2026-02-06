import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header.jsx";

// Auth
import Login from "./components/Login";
import Profile from "./components/Profile.jsx";

// Admin Dashboard
import Dashboard from "./components/AdminDashboard.jsx";

// IPR
import DesignForm from "./components/IPR/DesignForm.jsx";
import UtilityForm from "./components/IPR/UtilityForm.jsx";
import IPRList from "./components/IPR/IPRList.jsx";

// PhD Scholars
import ScholarForm from "./components/PhDScholars/ScholarForm.jsx";
import ScholarList from "./components/PhDScholars/ScholarsList.jsx";

// Project Proposals
import ProjectProposalForm from "./components/ProjectProposals/ProjectProposalForm.jsx";
import ProposalList from "./components/ProjectProposals/ProposalsList.jsx";

// Publications
import ConferenceForm from "./components/Publications/ConferenceForm.jsx";
import BookChapterForm from "./components/Publications/BookChapterForm.jsx";
import JournalForm from "./components/Publications/JournalForm.jsx";
import PublicationList from "./components/Publications/PublicationsList.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

function AppContent() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const showSidebar = Boolean(user && !loading);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-100">Loading...</div>;
  }

  return (
    <div className="font-sans">
      <Header
        showToggle={showSidebar}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
      />
      {showSidebar && (
        <Sidebar
          user={user}
          isAdmin={isAdmin}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            index
            element={
              user ? (
                <Navigate to={isAdmin ? "/dashboard" : "/publications/list"} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          <Route path="/ipr/design-form" element={<ProtectedRoute><DesignForm /></ProtectedRoute>} />
          <Route path="/ipr/utility-form" element={<ProtectedRoute><UtilityForm /></ProtectedRoute>} />
          <Route path="/ipr/list" element={<ProtectedRoute><IPRList /></ProtectedRoute>} />

          <Route path="/phdscholars/form" element={<ProtectedRoute><ScholarForm /></ProtectedRoute>} />
          <Route path="/phdscholars/list" element={<ProtectedRoute><ScholarList /></ProtectedRoute>} />

          <Route path="/proposals/form" element={<ProtectedRoute><ProjectProposalForm /></ProtectedRoute>} />
          <Route path="/proposals/list" element={<ProtectedRoute><ProposalList /></ProtectedRoute>} />
          <Route path="/proposals/edit/:id" element={<ProtectedRoute><ProjectProposalForm /></ProtectedRoute>} />

          <Route path="/publications/conference-form" element={<ProtectedRoute><ConferenceForm /></ProtectedRoute>} />
          <Route path="/publications/bookchapter-form" element={<ProtectedRoute><BookChapterForm /></ProtectedRoute>} />
          <Route path="/publications/journal-form" element={<ProtectedRoute><JournalForm /></ProtectedRoute>} />
          <Route path="/publications/list" element={<ProtectedRoute><PublicationList /></ProtectedRoute>} />

          <Route
            path="*"
            element={
              <Navigate to={user ? (isAdmin ? "/dashboard" : "/publications/list") : "/login"} replace />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
