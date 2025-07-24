import { Link, useLocation } from "react-router-dom";
import "@/styles/Navbar.css"; // optional if you're styling it

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/feeds/foryou" className={pathname === "/feeds/foryou" ? "active" : ""}>
            For You
          </Link>
        </li>
        <li>
          <Link to="/feeds/friends" className={pathname === "/feeds/friends" ? "active" : ""}>
            Friends
          </Link>
        </li>
        <li>
          <Link to="/feeds/explore" className={pathname === "/feeds/explore" ? "active" : ""}>
            Explore
          </Link>
        </li>
        <li>
          <Link to="/feeds/upload" className={pathname === "/feeds/upload" ? "active" : ""}>
            Upload
          </Link>
        </li>
        <li>
          <Link to="/profile" className={pathname === "/profile" ? "active" : ""}>
            Profile
          </Link>
        </li>
        <li>
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
