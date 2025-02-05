import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "#fff" }}>
      <Link to="/" style={{ margin: "10px", color: "white", textDecoration: "none" }}>Home</Link>
      <Link to="/chat" style={{ margin: "10px", color: "white", textDecoration: "none" }}>Chatbot</Link>
    </nav>
  );
};

export default Navbar;
