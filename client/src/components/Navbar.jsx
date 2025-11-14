import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in (token in localStorage)
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    // Close dropdown if clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-white shadow-md z-20 relative">
      {/* Logo / Site Name */}
      <Link to="/" className="font-bold text-2xl text-indigo-700">
        GameBit Marketplace
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-8">
        <Link
          to="/catalogue"
          className="text-gray-700 font-semibold hover:text-indigo-700"
        >
          Catalogue
        </Link>
        <Link
          to="/become-seller"
          className="text-gray-700 font-semibold hover:text-indigo-700"
        >
          Become a Seller
        </Link>

        {/* If logged in → show profile dropdown */}
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center text-gray-700 hover:text-indigo-700 focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaUserCircle size={28} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border">
                <Link
                  to="/account"
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  View Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="text-gray-700 font-semibold hover:text-indigo-700"
          >
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
