import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <div className="landing">
      {/* Background aurora glow blobs */}
      <div className="aurora-blobs">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
      </div>

      {/* Background network constellation overlay matching reference image */}
      <div className="network-overlay">
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="none">
          <defs>
            <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Top Left Cluster */}
          <line x1="80" y1="60" x2="220" y2="100" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="220" y1="100" x2="340" y2="50" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="80" y1="60" x2="150" y2="180" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="150" y1="180" x2="220" y2="100" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="220" y1="100" x2="280" y2="240" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="340" y1="50" x2="430" y2="150" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="280" y1="240" x2="430" y2="150" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="150" y1="180" x2="280" y2="240" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="430" y1="150" x2="560" y2="100" stroke="rgba(2, 132, 199, 0.08)" strokeWidth="1" />
          <line x1="340" y1="50" x2="560" y2="100" stroke="rgba(2, 132, 199, 0.08)" strokeWidth="1" />

          {/* Bottom Left / Center Floor Cluster */}
          <line x1="60" y1="780" x2="220" y2="720" stroke="rgba(2, 132, 199, 0.15)" strokeWidth="1" />
          <line x1="220" y1="720" x2="380" y2="820" stroke="rgba(2, 132, 199, 0.15)" strokeWidth="1" />
          <line x1="60" y1="780" x2="140" y2="900" stroke="rgba(2, 132, 199, 0.15)" strokeWidth="1" />
          <line x1="140" y1="900" x2="300" y2="850" stroke="rgba(2, 132, 199, 0.15)" strokeWidth="1" />
          <line x1="220" y1="720" x2="300" y2="850" stroke="rgba(2, 132, 199, 0.15)" strokeWidth="1" />
          <line x1="300" y1="850" x2="380" y2="820" stroke="rgba(2, 132, 199, 0.15)" strokeWidth="1" />
          <line x1="380" y1="820" x2="500" y2="670" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="220" y1="720" x2="500" y2="670" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="500" y1="670" x2="620" y2="790" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="380" y1="820" x2="620" y2="790" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          
          <line x1="140" y1="900" x2="240" y2="970" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="300" y1="850" x2="240" y2="970" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="300" y1="850" x2="450" y2="940" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />
          <line x1="380" y1="820" x2="450" y2="940" stroke="rgba(2, 132, 199, 0.12)" strokeWidth="1" />

          {/* Inter-cluster thin connections */}
          <line x1="280" y1="240" x2="220" y2="720" stroke="rgba(2, 132, 199, 0.05)" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="430" y1="150" x2="500" y2="670" stroke="rgba(2, 132, 199, 0.05)" strokeWidth="0.8" strokeDasharray="3 3" />

          {/* Glowing Nodes (white circles with blue outlines) */}
          <circle cx="80" cy="60" r="3.5" fill="white" stroke="#0284c7" strokeWidth="1.5" className="net-node-pulse" />
          <circle cx="220" cy="100" r="4.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="340" cy="50" r="3.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="150" cy="180" r="4" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="280" cy="240" r="4.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="430" cy="150" r="4.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="560" cy="100" r="3" fill="white" stroke="#0284c7" strokeWidth="1.5" />

          <circle cx="60" cy="780" r="3.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="220" cy="720" r="5" fill="white" stroke="#0284c7" strokeWidth="1.5" className="net-node-pulse" />
          <circle cx="380" cy="820" r="4.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="140" cy="900" r="3.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="300" cy="850" r="4.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="500" cy="670" r="5" fill="white" stroke="#0284c7" strokeWidth="1.5" className="net-node-pulse" />
          <circle cx="620" cy="790" r="4" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="240" cy="970" r="3.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="450" cy="940" r="3.5" fill="white" stroke="#0284c7" strokeWidth="1.5" />
        </svg>
      </div>

      <nav className="minimal-nav">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="InventoryPro Logo" style={{ width: "44px", height: "44px" }} />
          <h1 style={{ margin: 0 }}>InventoryPro</h1>
        </div>
        <div className="nav-buttons" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button 
            className="theme-toggle-btn-landing" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <Link to="/login" className="btn-login">
            Login
          </Link>
          <Link to="/register" className="btn-register">
            Register
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>
            Smart Inventory.<br />
            <span className="text-highlight">Stronger Business.</span>
          </h1>
          <p>
            Real-time tracking, efficient management,<br />
            and complete visibility across your inventory.
          </p>

          <div className="hero-cta" style={{ display: "flex", gap: "16px" }}>
            <Link to="/login" className="btn-get-started">
              Get Started
            </Link>
            <Link to="/register" className="btn-register-hero">
              Register
            </Link>
          </div>

          <div className="flow-steps">
            <div className="step-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="step-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h6"/>
                </svg>
              </div>
              <div className="step-info">
                <h4>Auditing</h4>
                <p>Real-time Tracking</p>
              </div>
            </div>

            <div className="step-card animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <div className="step-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div className="step-info">
                <h4>Packaging</h4>
                <p>Optimized Storage</p>
              </div>
            </div>

            <div className="step-card animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <div className="step-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div className="step-info">
                <h4>Analytics</h4>
                <p>Valuation Reports</p>
              </div>
            </div>

            <div className="step-card animate-slide-up" style={{ animationDelay: "0.7s" }}>
              <div className="step-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div className="step-info">
                <h4>Logistics</h4>
                <p>Procurement Flow</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;