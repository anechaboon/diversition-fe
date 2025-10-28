import React from 'react';
import '../assets/common.css'; // สมมติว่าเรามีไฟล์ CSS สำหรับสไตล์ของ Navbar

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">React Router</div>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/upload">Upload</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;