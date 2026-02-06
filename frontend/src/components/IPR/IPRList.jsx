// src/components/IPR/IPRList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import UtilityForm from './UtilityForm';
import DesignForm from './DesignForm';
import { FileText, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const IPRList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const currentUserId = user?.id || user?._id;

  const [iprs, setIprs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [iprType, setIprType] = useState('');
  const [editingIPR, setEditingIPR] = useState(null);

  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
    domain: ''
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchIPRs(), 400);
    return () => clearTimeout(delayDebounce);
  }, [filters]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') params.append(key, value.trim());
    });
    return params.toString();
  };

  const fetchIPRs = async () => {
    setLoading(true);
    try {
      const qs = buildQueryString();
      const res = await api.get(`/ipr?${qs}`);
      setIprs(res.data || []);
    } catch (err) {
      console.error("Error fetching IPRs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingIPR(null);
    fetchIPRs();
  };

  const renderForm = () => {
    const props = { ipr: editingIPR, onClose: handleFormClose };
    if (iprType === "utility") return <UtilityForm {...props} />;
    if (iprType === "design") return <DesignForm {...props} />;
    return null;
  };

  const visibleIPRs = isAdmin
    ? iprs
    : iprs.filter(ipr => (ipr?.userId?._id || ipr?.userId) === currentUserId);

  // On-screen date (submissionDate)
  const getDisplayDate = (ipr) => ipr.submissionDate ? new Date(ipr.submissionDate).toLocaleDateString() : "-";

  // For report, same submission date
  const getReportDate = (ipr) => getDisplayDate(ipr);

  /* ---------------- REPORT ---------------- */
  const generateReport = (format) => {
    if (!visibleIPRs.length) { alert("No data to generate report"); return; }
    if (format === "pdf") generatePDF();
    else generateDOC();
  };

  const groupByTypeStatus = () => {
    const grouped = {};
    visibleIPRs.forEach(ipr => {
      const type = ipr.type || "Other";
      const status = ipr.status || "submitted";
      grouped[type] = grouped[type] || {};
      grouped[type][status] = grouped[type][status] || [];
      grouped[type][status].push(ipr);
    });
    return grouped;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("IPR Report", 14, 15);
    let y = 25;

    const grouped = groupByTypeStatus();

    Object.entries(grouped).forEach(([type, statuses]) => {
      doc.setFontSize(14);
      doc.text(type.toUpperCase(), 14, y);
      y += 8;

      Object.entries(statuses).forEach(([status, iprs]) => {
        doc.setFontSize(13);
        doc.text(`Status: ${status}`, 14, y);
        y += 6;

        autoTable(doc, {
          startY: y,
          head: [["Patent/Design Number", "Title", "Holders", "Domain", "Submission Date"]],
          body: iprs.map(ipr => [
            ipr.patentNumber || ipr.designNumber || "-",
            ipr.title,
            Array.isArray(ipr.holders) ? ipr.holders.join(", ") : "-",
            ipr.domain || "-",
            getReportDate(ipr)
          ]),
          styles: { fontSize: 9 },
          theme: "grid"
        });

        y = doc.lastAutoTable.finalY + 8;
        if (y > 260) { doc.addPage(); y = 20; }
      });
      y += 8;
    });

    doc.save("IPR_Report.pdf");
  };

  const generateDOC = () => {
    const grouped = groupByTypeStatus();
    let html = `<h2>IPR Report</h2><hr/>`;

    Object.entries(grouped).forEach(([type, statuses]) => {
      html += `<h3>${type.toUpperCase()}</h3>`;
      Object.entries(statuses).forEach(([status, iprs]) => {
        html += `<h4>Status: ${status}</h4>`;
        html += `<table border="1" cellpadding="5" cellspacing="0" width="100%">
          <tr>
            <th>Patent Number</th>
            <th>Title</th>
            <th>Holders</th>
            <th>Domain</th>
            <th>Submission Date</th>
          </tr>`;
        iprs.forEach(ipr => {
          html += `<tr>
            <td>${ipr.patentNumber || ipr.designNumber || "-"}</td>
            <td>${ipr.title}</td>
            <td>${Array.isArray(ipr.holders) ? ipr.holders.join(", ") : "-"}</td>
            <td>${ipr.domain || "-"}</td>
            <td>${getReportDate(ipr)}</td>
          </tr>`;
        });
        html += `</table><br/>`;
      });
    });

    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "IPR_Report.doc";
    link.click();
  };

  return (
    <div style={containerStyle}>
      <h1>Intellectual Property Rights (IPR)</h1>

      {/* Filters + Report Buttons */}
      <div style={filterCardStyle}>
        <div style={filterRowStyle}>
          <input
            type="text"
            placeholder="Search by title, patent/design number, or holder..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={inputFieldStyle}
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={selectFieldStyle}
          >
            <option value="">All Types</option>
            <option value="utility">Utility</option>
            <option value="design">Design</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={selectFieldStyle}
          >
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="granted">Granted</option>
          </select>
          <input
            type="text"
            placeholder="Domain..."
            value={filters.domain}
            onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
            style={inputFieldStyle}
          />
          <button onClick={() => setFilters({ type:'', status:'', search:'', domain:'' })} style={navButtonStyle}>Clear Filters</button>
          {isAdmin && (
            <>
              <button onClick={() => generateReport("pdf")} style={navButtonStyle}><FileText size={16}/> PDF</button>
              <button onClick={() => generateReport("doc")} style={navButtonStyle}><FileText size={16}/> DOC</button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={tableWrapperStyle}>
        {loading ? <p>Loading...</p> :
          visibleIPRs.length === 0 ? <p style={{ textAlign: "center", padding: "20px" }}>No IPR records found.</p> :
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Patent Number</th>
                <th>Title</th>
                <th>Holders</th>
                <th>Domain</th>
                <th>Submission Date</th>
                {isAdmin && <th>Proof</th>}
              </tr>
            </thead>
            <tbody>
              {visibleIPRs.map(ipr => (
                <tr key={ipr._id}>
                  <td>{ipr.type}</td>
                  <td>{ipr.status}</td>
                  <td>{ipr.patentNumber || ipr.designNumber || "-"}</td>
                  <td>{ipr.title}</td>
                  <td>{Array.isArray(ipr.holders) ? ipr.holders.join(", ") : "-"}</td>
                  <td>{ipr.domain || "-"}</td>
                  <td>{getDisplayDate(ipr)}</td>
                  {isAdmin && (
                    <td>
                      {ipr.proofFileId ? (
                        <a
                          href={`http://localhost:5000/api/files/${ipr.proofFileId}`}
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
        }
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={modalOverlayStyle} onClick={() => setShowForm(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            {renderForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default IPRList;

/* ---------------- Styles ---------------- */
const containerStyle = { padding: "20px", minHeight: "100vh", backgroundColor: "#f8f9fa" };
const filterCardStyle = { padding: "12px", marginBottom: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
const filterRowStyle = { display: "flex", flexWrap: "nowrap", gap: "8px", alignItems: "center", overflowX: "auto" };
const inputFieldStyle = { flex: "0 0 200px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "15px" };
const selectFieldStyle = { flex: "0 0 160px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "15px", color: "#111827", backgroundColor: "#fff", appearance: "none" };
const navButtonStyle = { padding:"6px 12px", fontSize:"14px", borderRadius:"6px", cursor:"pointer", backgroundColor:"#5a0000", color:"#fff", border:"none", display:"flex", alignItems:"center", gap:"6px", whiteSpace:"nowrap", transition:"all 0.3s ease" };
const tableWrapperStyle = { overflowX: "auto", backgroundColor: "#fff", borderRadius: "8px", padding: "15px" };
const tableStyle = { width:"100%", borderCollapse:"collapse", minWidth:"900px" };
const modalOverlayStyle = { position:"fixed", top:0, left:0, width:"100%", height:"100%", backgroundColor:"rgba(0,0,0,0.4)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:999 };
const modalStyle = { backgroundColor:"#fff", borderRadius:"10px", padding:"20px", width:"90%", maxWidth:"900px", maxHeight:"90%", overflowY:"auto" };
