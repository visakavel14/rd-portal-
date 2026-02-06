import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const Sidebar = ({ open, onClose }) => {
  const [openMenus, setOpenMenus] = useState({});
  const { user, logout, isAdmin } = useAuth();

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const menuItems = [
    { name: "Profile", path: "/profile" },
    ...(isAdmin ? [{ name: "Dashboard", path: "/dashboard" }] : []),
    {
      name: "Publications",
      path: "/publications/list",
      subItems: [
        ...(!isAdmin
          ? [
              { name: "Conference", path: "/publications/conference-form" },
              { name: "Book Chapter", path: "/publications/bookchapter-form" },
              { name: "Journal", path: "/publications/journal-form" },
            ]
          : []),
        { name: "Publication List", path: "/publications/list" },
      ],
    },
    {
      name: "IPR",
      path: "/ipr/list",
      subItems: [
        ...(!isAdmin
          ? [
              { name: "Design Form", path: "/ipr/design-form" },
              { name: "Utility Form", path: "/ipr/utility-form" },
            ]
          : []),
        { name: "IPR List", path: "/ipr/list" },
      ],
    },
    {
      name: "Project Proposals",
      path: "/proposals/list",
      subItems: [
        ...(!isAdmin ? [{ name: "Add Proposal", path: "/proposals/form" }] : []),
        { name: "Proposal List", path: "/proposals/list" },
      ],
    },
    {
      name: "PhD Scholars",
      path: "/phdscholars/list",
      subItems: [
        ...(!isAdmin ? [{ name: "Add Scholar", path: "/phdscholars/form" }] : []),
        { name: "Scholar List", path: "/phdscholars/list" },
      ],
    },
  ];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`sidebar${open ? " open" : ""}`}>
      <div className="sidebar-header">
        <h2>R&D Portal</h2>
        <p>
          Logged in as: <strong>{user?.name || user?.username || "Guest"}</strong>
        </p>
        {isAdmin && (
          <p className="admin-label">
            <strong>Admin</strong>
          </p>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.name} className="nav-item-container">
            {item.subItems ? (
              <>
                <div className={`nav-item ${openMenus[item.name] ? "active" : ""}`}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-link${isActive ? " active" : ""}`
                    }
                  >
                    {item.name}
                  </NavLink>
                  <button
                    type="button"
                    className="nav-toggle"
                    onClick={() => toggleMenu(item.name)}
                  >
                    {openMenus[item.name] ? "–" : "+"}
                  </button>
                </div>

                {openMenus[item.name] &&
                  item.subItems.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `nav-subitem${isActive ? " active" : ""}`
                      }
                    >
                      {sub.name}
                    </NavLink>
                  ))}
              </>
            ) : (
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
              >
                {item.name}
              </NavLink>
            )}
          </div>
        ))}
        {user && (
          <button
            type="button"
            className="nav-item"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            Logout
          </button>
        )}
      </nav>

      <div className="sidebar-footer" />
    </div>
    </>
  );
};

export default Sidebar;
