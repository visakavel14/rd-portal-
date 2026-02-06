import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import ProjectProposalForm from "./ProjectProposalForm";
import { FileText, Eye } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ProposalsList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const currentUserId = user?.id || user?._id;

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    domain: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    fetchProposals();
  }, [filters]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/proposals?${params}`);
      const visible = isAdmin
        ? res.data
        : res.data.filter((p) => (p.userId?._id || p.userId) === currentUserId);
      setProposals(visible);
    } catch (err) {
      console.error(err);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProposal(null);
    fetchProposals();
  };

  /* ---------------- REPORT GENERATOR ---------------- */
  const generateReport = (format) => {
    if (!proposals.length) {
      alert("No data to generate report");
      return;
    }
    if (format === "pdf") generatePDF();
    else generateDOC();
  };

  /* ---------------- PDF ---------------- */
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Project Proposals Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        ["Title", "Domain", "Status", "Agency", "Date", "PI", "Co-PI(s)"]
      ],
      body: proposals.map((p) => [
        p.title,
        p.domain || "-",
        p.status || "-",
        p.agency || "-",
        p.date ? new Date(p.date).toLocaleDateString() : "-",
        p.pi || "-",
        p.copi?.length ? p.copi.join(", ") : "-",
      ]),
      styles: { fontSize: 10 },
      theme: "grid",
    });

    doc.save("Project_Proposals_Report.pdf");
  };

  /* ---------------- DOC ---------------- */
  const generateDOC = () => {
    let html = `<h2>Project Proposals Report</h2><hr/>
      <table border="1" cellpadding="5" cellspacing="0" width="100%">
        <tr>
          <th>Title</th>
          <th>Domain</th>
          <th>Status</th>
          <th>Agency</th>
          <th>Date</th>
          <th>PI</th>
          <th>Co-PI(s)</th>
        </tr>`;

    proposals.forEach((p) => {
      html += `<tr>
        <td>${p.title}</td>
        <td>${p.domain || "-"}</td>
        <td>${p.status || "-"}</td>
        <td>${p.agency || "-"}</td>
        <td>${p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
        <td>${p.pi || "-"}</td>
        <td>${p.copi?.length ? p.copi.join(", ") : "-"}</td>
      </tr>`;
    });
    html += `</table>`;

    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Project_Proposals_Report.doc";
    link.click();
  };

  /* ---------------- INLINE SELECT STYLING ---------------- */
  const selectFieldStyle = {
    flex: "0 0 160px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
    color: "#111827",
    backgroundColor: "#fff",
    appearance: "none",
  };

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1>Project Proposals</h1>

      {/* ---------------- FILTER + BUTTONS ---------------- */}
      <div
        style={{
          padding: "12px",
          marginBottom: "20px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "nowrap",
            alignItems: "center",
            overflowX: "auto",
            justifyContent: "flex-start",
          }}
        >
          <input
            placeholder="Search..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            style={{
              flex: "0 0 200px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "15px",
            }}
          />
          <input
            placeholder="Domain"
            value={filters.domain}
            onChange={(e) =>
              setFilters({ ...filters, domain: e.target.value })
            }
            style={{
              flex: "0 0 160px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "15px",
            }}
          />
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            style={selectFieldStyle}
          >
            <option value="">
              All Status
            </option>
            <option value="submitted">
              Submitted
            </option>
            <option value="granted">
              Granted
            </option>
          </select>
          <label style={{ margin: "0 4px", fontSize: "14px", fontWeight: 500 }}>
            From:
          </label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters({ ...filters, fromDate: e.target.value })
            }
            style={{
              flex: "0 0 150px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "15px",
            }}
          />
          <label style={{ margin: "0 4px", fontSize: "14px", fontWeight: 500 }}>
            To:
          </label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) =>
              setFilters({ ...filters, toDate: e.target.value })
            }
            style={{
              flex: "0 0 150px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "15px",
            }}
          />

          {/* ---------------- NAV/REPORT BUTTONS ---------------- */}
          <button
            onClick={() =>
              setFilters({
                search: "",
                domain: "",
                status: "",
                fromDate: "",
                toDate: "",
              })
            }
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              cursor: "pointer",
              backgroundColor: "#5a0000",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
              transition: "all 0.3s ease",
            }}
          >
            Clear Filters
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => generateReport("pdf")}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: "#1b2a44",
                  color: "#fff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s ease",
                }}
              >
                <FileText size={16} /> PDF
              </button>
              <button
                onClick={() => generateReport("doc")}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: "#1b2a44",
                  color: "#fff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s ease",
                }}
              >
                <FileText size={16} /> DOC
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div
        style={{
          overflowX: "auto",
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "15px",
        }}
      >
        {loading ? (
          <p>Loading...</p>
        ) : proposals.length === 0 ? (
          <p>No proposals found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Domain</th>
                <th>Status</th>
                <th>Agency</th>
                <th>Date</th>
                <th>PI</th>
                <th>Co-PI(s)</th>
                {isAdmin && <th>Proof</th>}
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.domain || "-"}</td>
                  <td>{p.status || "-"}</td>
                  <td>{p.agency || "-"}</td>
                  <td>{p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
                  <td>{p.pi || "-"}</td>
                  <td>{p.copi?.length ? p.copi.join(", ") : "-"}</td>
                  {isAdmin && (
                    <td>
                      {p.proofFileId ? (
                        <a
                          href={`http://localhost:5000/api/files/${p.proofFileId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#1b2a44" }}
                        >
                          <Eye size={14} /> View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "280px",
            width: "calc(100% - 280px)",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              background: "#fff",
              margin: "40px auto",
              padding: "20px",
              width: "700px",
              borderRadius: "10px",
            }}
          >
            <ProjectProposalForm
              proposal={editingProposal}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsList;
