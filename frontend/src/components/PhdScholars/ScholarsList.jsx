import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { FileText, Eye } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ScholarsList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const currentUserId = user?.id || user?._id;

  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    domain: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchScholars(), 400);
    return () => clearTimeout(delayDebounce);
  }, [filters]);

  const fetchScholars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/phdScholars?${params}`);
      setScholars(res.data);
    } catch {
      setScholars([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ROLE-BASED VISIBILITY ---------------- */
  const visibleScholars = isAdmin
    ? scholars
    : scholars.filter(s => (s.userId?._id || s.userId) === currentUserId);

  /* ---------------- REPORT GENERATOR ---------------- */
  const generateReport = (format) => {
    if (!visibleScholars.length) {
      alert("No data to generate report");
      return;
    }
    if (format === "pdf") generatePDF();
    else generateDOC();
  };

  /* ---------------- PDF ---------------- */
  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 30;

    doc.setFontSize(16);
    doc.text("PhD Scholars – Faculty-wise Report", 14, 15);

    const grouped = groupByGuide();

    Object.entries(grouped).forEach(([guide, list]) => {
      doc.setFontSize(13);
      doc.text(`Guide : ${guide}`, 14, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        head: [["Scholar", "Joining Date", "Domain", "Progress"]],
        body: list.map(s => [
          s.scholarName,
          new Date(s.dateOfJoining).toLocaleDateString(),
          s.domain || "-",
          s.progress || "-",
        ]),
        styles: { fontSize: 9 },
        theme: "grid",
      });

      y = doc.lastAutoTable.finalY + 10;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("Faculty_Wise_PhD_Scholars_Report.pdf");
  };

  /* ---------------- DOC ---------------- */
  const generateDOC = () => {
    const grouped = groupByGuide();
    let html = `<h2>PhD Scholars – Faculty-wise Report</h2><hr/>`;

    Object.entries(grouped).forEach(([guide, list]) => {
      html += `<h3>Guide : ${guide}</h3>
        <table border="1" cellpadding="5" cellspacing="0" width="100%">
          <tr>
            <th>Scholar</th>
            <th>Joining Date</th>
            <th>Domain</th>
            <th>Progress</th>
          </tr>`;
      list.forEach(s => {
        html += `<tr>
          <td>${s.scholarName}</td>
          <td>${new Date(s.dateOfJoining).toLocaleDateString()}</td>
          <td>${s.domain || "-"}</td>
          <td>${s.progress || "-"}</td>
        </tr>`;
      });
      html += `</table><br/>`;
    });

    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Faculty_Wise_PhD_Scholars_Report.doc";
    link.click();
  };

  /* ---------------- HELPER ---------------- */
  const groupByGuide = () => {
    return visibleScholars.reduce((acc, s) => {
      const guide = s.guide || "Unassigned";
      acc[guide] = acc[guide] || [];
      acc[guide].push(s);
      return acc;
    }, {});
  };

  return (
    <div style={mainContentStyle}>
      <h1>PhD Scholars</h1>

      {/* ---------------- FILTER + BUTTONS ---------------- */}
      <div style={filterCardStyle}>
        <div style={filterRowStyle}>
          <input
            placeholder="Search by scholar / guide"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            style={inputFieldStyle}
          />
          <input
            placeholder="Domain"
            value={filters.domain}
            onChange={e => setFilters({ ...filters, domain: e.target.value })}
            style={inputFieldStyle}
          />
          <input
            type="date"
            value={filters.fromDate}
            onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
            style={dateFieldStyle}
          />
          <input
            type="date"
            value={filters.toDate}
            onChange={e => setFilters({ ...filters, toDate: e.target.value })}
            style={dateFieldStyle}
          />

          {/* ---------------- BUTTONS ---------------- */}
          <button
            onClick={() => setFilters({ search: "", domain: "", fromDate: "", toDate: "" })}
            style={navButtonStyle}
          >
            Clear Filters
          </button>

          {isAdmin && (
            <>
              <button onClick={() => generateReport("pdf")} style={navButtonStyle}>
                <FileText size={16} /> PDF
              </button>
              <button onClick={() => generateReport("doc")} style={navButtonStyle}>
                <FileText size={16} /> DOC
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div style={tableWrapperStyle}>
        {loading ? (
          <p>Loading scholars...</p>
        ) : visibleScholars.length === 0 ? (
          <p>No scholars found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Joining Date</th>
                <th>Domain</th>
                <th>Progress</th>
                <th>Guide</th>
                {isAdmin && <th>Proof</th>}
              </tr>
            </thead>
            <tbody>
              {visibleScholars.map(s => (
                <tr key={s._id}>
                  <td>{s.scholarName}</td>
                  <td>{new Date(s.dateOfJoining).toLocaleDateString()}</td>
                  <td>{s.domain || "-"}</td>
                  <td>{s.progress || "-"}</td>
                  <td>{s.guide || "-"}</td>
                  {isAdmin && (
                    <td>
                      {s.proofFileId ? (
                        <a
                          href={`http://localhost:5000/api/files/${s.proofFileId}`}
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
    </div>
  );
};

export default ScholarsList;

/* ---------------- STYLES ---------------- */
const mainContentStyle = { padding: "20px", minHeight: "100vh", backgroundColor: "#f8f9fa" };
const filterCardStyle = { padding: "12px", marginBottom: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
const filterRowStyle = { display: "flex", flexWrap: "nowrap", gap: "8px", alignItems: "center", overflowX: "auto", justifyContent: "flex-start" };
const inputFieldStyle = { flex: "0 0 200px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "15px" };
const dateFieldStyle = { flex: "0 0 150px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "15px" };
const navButtonStyle = { padding: "6px 12px", fontSize: "14px", borderRadius: "6px", cursor: "pointer", backgroundColor: "#5a0000", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", transition: "all 0.3s ease" };
const tableWrapperStyle = { overflowX: "auto", backgroundColor: "#fff", borderRadius: "8px", padding: "15px" };
