import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Eye } from "lucide-react";

const PublicationsList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const currentUserId = user?.id || user?._id;

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
    domain: "",
    fromDate: "",
    toDate: "",
  });
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchPublications();
  }, [filters]);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/publications?${params}`);
      const visible = isAdmin
        ? res.data
        : res.data.filter((p) => (p.userId?._id || p.userId) === currentUserId);
      setPublications(visible);
    } catch (err) {
      console.error(err);
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DATE HELPERS ---------------- */
  const getTableDate = (pub) =>
    pub.publishedDate ? new Date(pub.publishedDate).toLocaleDateString() : "-";

  const getReportDate = (pub) => {
    if (pub.type === "conference") {
      const presented = pub.presentedDate
        ? `Presented: ${new Date(pub.presentedDate).toLocaleDateString()}`
        : "";
      const published = pub.publishedDate
        ? `Published: ${new Date(pub.publishedDate).toLocaleDateString()}`
        : "";
      return presented && published
        ? `${presented}, ${published}`
        : presented || published || "-";
    }
    return pub.publishedDate
      ? new Date(pub.publishedDate).toLocaleDateString()
      : "-";
  };

  /* ---------------- PUBLISHER ---------------- */
  const getPublisher = (pub) => {
    if (pub.type === "bookchapter") return pub.publisher || "-";
    return pub.publisherName || "-";
  };

  /* ---------------- GROUP & SORT ---------------- */
  const groupByType = () => {
    const grouped = { journal: [], conference: [], bookchapter: [] };
    publications.forEach((pub) => {
      if (grouped[pub.type]) grouped[pub.type].push(pub);
    });
    return grouped;
  };

  const sortByAuthor = (pubs) =>
    pubs.slice().sort((a, b) => {
      const a1 = a.authors?.[0] || "";
      const b1 = b.authors?.[0] || "";
      return a1.localeCompare(b1);
    });

  /* ---------------- PDF ---------------- */
  const generatePDF = () => {
    if (!publications.length) return alert("No data to generate report");

    const doc = new jsPDF();
    doc.text("Publications Report", 14, 15);
    let y = 25;

    const grouped = groupByType();

    Object.entries(grouped).forEach(([type, pubs]) => {
      if (!pubs.length) return;

      doc.text(type.toUpperCase(), 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [["Title", "Authors", "Publisher", "Date", "Domain"]],
        body: sortByAuthor(pubs).map((pub) => [
          pub.title,
          pub.authors.join(", "),
          getPublisher(pub),
          getReportDate(pub),
          pub.domain || "-",
        ]),
      });

      y = doc.lastAutoTable.finalY + 10;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("Publications_Report.pdf");
  };

  /* ---------------- DOC ---------------- */
  const generateDOC = () => {
    if (!publications.length) return alert("No data to generate report");

    let html = `<h2>Publications Report</h2><hr/>`;
    const grouped = groupByType();

    Object.entries(grouped).forEach(([type, pubs]) => {
      if (!pubs.length) return;
      html += `<h3>${type}</h3><table border="1" width="100%">`;
      html += `<tr><th>Title</th><th>Authors</th><th>Publisher</th><th>Date</th><th>Domain</th></tr>`;

      sortByAuthor(pubs).forEach((pub) => {
        html += `<tr>
          <td>${pub.title}</td>
          <td>${pub.authors.join(", ")}</td>
          <td>${getPublisher(pub)}</td>
          <td>${getReportDate(pub)}</td>
          <td>${pub.domain || "-"}</td>
        </tr>`;
      });

      html += `</table><br/>`;
    });

    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Publications_Report.doc";
    link.click();
  };

  const handleClearFilters = () => {
    setFilters({
      type: "",
      search: "",
      domain: "",
      fromDate: "",
      toDate: "",
    });
  };

  const sortedPublications = publications
    .slice()
    .sort((a, b) => {
      const ad = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const bd = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return sortOrder === "asc" ? ad - bd : bd - ad;
    });

  /* ---------------- STYLES ---------------- */
  const mainContentStyle = {
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  };

  return (
    <div style={mainContentStyle}>
      <h1>Publications</h1>

      {/* FILTERS */}
      <div style={{ background: "#fff", padding: 12, marginBottom: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "nowrap", alignItems: "center", overflowX: "auto" }}>
          <input
            placeholder="Search by title/author"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            style={{ flex: "0 0 200px" }}
          />
          <input
            placeholder="Domain"
            value={filters.domain}
            onChange={(e) =>
              setFilters({ ...filters, domain: e.target.value })
            }
            style={{ flex: "0 0 160px" }}
          />
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value })
            }
            style={{ flex: "0 0 170px" }}
          >
            <option value="">All Types</option>
            <option value="journal">Journal</option>
            <option value="conference">Conference</option>
            <option value="bookchapter">Book Chapter</option>
          </select>
          <label style={{ fontSize: 14 }}>From</label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters({ ...filters, fromDate: e.target.value })
            }
            style={{ flex: "0 0 150px" }}
          />
          <label style={{ fontSize: 14 }}>To</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) =>
              setFilters({ ...filters, toDate: e.target.value })
            }
            style={{ flex: "0 0 150px" }}
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ flex: "0 0 160px" }}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          <button onClick={handleClearFilters}>Clear Filters</button>

          {isAdmin && (
            <>
              <button onClick={generatePDF}>
                <FileText size={14} /> PDF
              </button>
              <button onClick={generateDOC}>
                <FileText size={14} /> DOC
              </button>
            </>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: "#fff", padding: 15 }}>
        {loading ? (
          <p>Loading...</p>
        ) : sortedPublications.length === 0 ? (
          <p>No publications found.</p>
        ) : (
          <table width="100%" border="1" cellPadding="6">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Authors</th>
                <th>Publisher</th>
                <th>Date</th>
                <th>Domain</th>
                {isAdmin && <th>Proof</th>}
              </tr>
            </thead>
            <tbody>
              {sortedPublications.map((pub) => (
                <tr key={pub._id}>
                  <td>{pub.type}</td>
                  <td>{pub.title}</td>
                  <td>{pub.authors.join(", ")}</td>
                  <td>{getPublisher(pub)}</td>
                  <td>{getTableDate(pub)}</td>
                  <td>{pub.domain || "-"}</td>

                  {isAdmin && (
                    <td>
                      {pub.proofFileId ? (
                        <a
                          href={`/api/files/${pub.proofFileId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#1b2a44",
                          }}
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

export default PublicationsList;
