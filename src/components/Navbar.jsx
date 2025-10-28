import { Link, useLocation } from "react-router-dom";
import '../assets/common.css'; // สมมติว่าเรามีไฟล์ CSS สำหรับสไตล์ของ Navbar

function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="navbar">
      <div className="logo">Diversition  - Image Slide</div>
      <ul className="nav-links my-0">
        <li>
          <Link to="/" className={currentPath === "/" ? "active" : ""}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/upload" className={currentPath === "/upload" ? "active" : ""}>
            Upload
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
