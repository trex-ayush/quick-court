import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { base } from "../helper";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("qc_user");
    setUser(stored ? JSON.parse(stored) : null);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post(`${base}/users/logout`, {}, { withCredentials: true });
    } catch (_) {
      // ignore; just clear locally
    } finally {
      localStorage.removeItem("qc_user");
      setUser(null);
      navigate("/login");
    }
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className="px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-white hover:bg-white/10"
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  );

  const canCreate = user && (user.role === "owner" || user.role === "admin");

  return (
    <nav className="w-full backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/30 border-b border-white/10 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <Link to="/" className="text-white font-bold tracking-wide">
              QUICKCOURT
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/">Venues</NavLink>
            {canCreate && <NavLink to="/venues/new">Add Venue</NavLink>}
            <NavLink to="/Profile">Profile</NavLink>
            {user ? (
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-red-600/80 hover:bg-red-600 text-white"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login">Login</NavLink>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-green-600/80 hover:bg-green-600 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10"
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink to="/">Venues</NavLink>
            {canCreate && <NavLink to="/venues/new">Add Venue</NavLink>}
            <NavLink to="/Profile">Profile</NavLink>
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-red-600/80 hover:bg-red-600 text-white"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <NavLink to="/login">Login</NavLink>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-green-600/80 hover:bg-green-600 text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
