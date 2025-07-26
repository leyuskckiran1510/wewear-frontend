import { Link, useLocation } from "react-router-dom";
import "@/styles/Navbar.css";

const Navbar = () => {
  const { pathname } = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <ul className="navbar-list">
          <li className="navbar-item">
            <Link 
              to="/feeds/foryou" 
              className={`navbar-link ${pathname === "/feeds/foryou" ? "navbar-link-active" : ""}`}
            >
              <div className="navbar-icon">
                <svg className="navbar-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span className="navbar-text">For You</span>
            </Link>
          </li>
          
          <li className="navbar-item">
            <Link 
              to="/feeds/friends" 
              className={`navbar-link ${pathname === "/feeds/friends" ? "navbar-link-active" : ""}`}
            >
              <div className="navbar-icon">
                <svg className="navbar-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4.5c0-1.1.9-2 2-2s2 .9 2 2V18h4v-7.5c0-1.1.9-2 2-2s2 .9 2 2V18h4c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1h1z"/>
                </svg>
              </div>
              <span className="navbar-text">Friends</span>
            </Link>
          </li>
          
          <li className="navbar-item">
            <Link 
              to="/feeds/explore" 
              className={`navbar-link ${pathname === "/feeds/explore" ? "navbar-link-active" : ""}`}
            >
              <div className="navbar-icon">
                <svg className="navbar-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="navbar-text">Explore</span>
            </Link>
          </li>
          
          <li className="navbar-item navbar-item-special">
            <Link 
              to="/feeds/upload" 
              className={`navbar-link navbar-link-upload ${pathname === "/feeds/upload" ? "navbar-link-active" : ""}`}
            >
              <div className="navbar-icon navbar-upload-icon">
                <svg className="navbar-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  <path d="M12 15V12H10V10H12V7L15 10L12 13V15H10V13H12Z"/>
                </svg>
              </div>
              <span className="navbar-text">Upload</span>
            </Link>
          </li>
          
          <li className="navbar-item">
            <Link 
              to="/profile" 
              className={`navbar-link ${pathname === "/profile" ? "navbar-link-active" : ""}`}
            >
              <div className="navbar-icon">
                <svg className="navbar-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span className="navbar-text">Profile</span>
            </Link>
          </li>
          
          <li className="navbar-item">
            <Link to="/logout" className="navbar-link navbar-link-logout">
              <div className="navbar-icon">
                <svg className="navbar-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </div>
              <span className="navbar-text">Logout</span>
            </Link>
          </li>
        </ul>
      </div>
      
      {/* Active indicator */}
      <div className="navbar-active-indicator"></div>
    </nav>
  );
};

export default Navbar;