import "./Header.css";

const Header = ({ onToggleSidebar, showToggle }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        {showToggle && (
          <button className="header-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <span className="burger-icon">☰</span>
          </button>
        )}
        <h1 className="header-title">TCE-R and D portal</h1>
      </div>
    </header>
  );
};

export default Header;
