import type { MouseEvent } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFilm,
  faUsers,
  faStar,
  faUser,
  faRightFromBracket,
  faChevronLeft,
  faChevronRight,
  faClone,
  faUserGroup,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { totalUnread } = useNotifications();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigation = (e: MouseEvent<HTMLAnchorElement>, destination: string) => {
    e.preventDefault();
    navigate(destination);
  };

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { path: "/home", label: "Home", short: "Home", icon: faHouse },
    { path: "/log", label: "Watch Log", short: "Log", icon: faFilm },
    { path: "/community", label: "Community Hub", short: "Community", icon: faUsers },
    { path: "/recommendations", label: "Recommendations", short: "Recs", icon: faStar },
    { path: "/comparison", label: "Side-by-Side Comparison", short: "Compare", icon: faClone},
    { path: "/social-connection-hub", label: "Social Connection Hub", short: "Connect", icon: faUserGroup },
    { path: "/messages", label: "Messages", short: "Chats", icon: faCommentDots },
    { path: "/profile", label: "My Profile", short: "Profile", icon: faUser },

  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="brand-block">
          <img src="/Big Pop.png" alt="Binge Buddies" className="brand-mark" />
          <div className="brand-copy">
            <span className="brand-label">Binge Buddies</span>
            <span className="brand-note">Your binge companion</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleNavigation(e, item.path)}
              className={`nav-item ${isActive ? "active" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="nav-icon">
                <FontAwesomeIcon icon={item.icon} />
                {item.path === "/messages" && totalUnread > 0 && (
                  <span className="nav-unread-badge">{totalUnread > 9 ? "9+" : totalUnread}</span>
                )}
              </span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-label-mobile">{item.short}</span>
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button 
          type="button" 
          className="logout-btn" 
          onClick={handleLogout}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <span className="logout-icon">
            <FontAwesomeIcon icon={faRightFromBracket} />
          </span>
          <span className="logout-text">Sign Out</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="toggle-btn"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="toggle-icon">
            <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
          </span>
          <span className="toggle-text">
            {isCollapsed ? "Expand" : "Collapse"}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;