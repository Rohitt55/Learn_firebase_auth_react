// src/App.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom"; // <-- correct package
import Logout from "./components/Logout";
import { useAuth } from "./context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded transition ${
    isActive
      ? "text-white bg-blue-600"
      : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
  }`;

const App = () => {
  const { currentUser } = useAuth();

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container flex flex-wrap items-center justify-between gap-3 px-4 py-3 mx-auto">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center font-bold text-white bg-blue-600 rounded-lg w-9 h-9">
              UN
            </div>
            <span className="text-lg font-semibold">
              University <span className="text-blue-600">NoteBank</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="flex flex-wrap items-center justify-center order-3 w-full gap-2 md:order-2 md:w-auto">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>

            {currentUser && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/user-profile" className={navLinkClass}>
                  Profile
                </NavLink>
                <NavLink to="/reset-password" className={navLinkClass}>
                  Reset Password
                </NavLink>
                <NavLink to="/update-user" className={navLinkClass}>
                  Update Password
                </NavLink>
              </>
            )}
          </nav>

          {/* Right side: email + auth buttons */}
          <div className="flex items-center order-2 min-w-0 gap-3 md:order-3">
            {currentUser && (
              <span
                className="hidden sm:block text-sm text-gray-600 max-w-[220px] truncate"
                title={currentUser.email || ""}
              >
                User: {currentUser.email}
              </span>
            )}

            {!currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-blue-700 rounded bg-blue-50 hover:bg-blue-100"
                >
                  Register
                </Link>
              </div>
            ) : (
              <Logout />
            )}
          </div>
        </div>
      </header>

      {/* Simple hero / homepage body */}
      <main className="container px-4 py-12 mx-auto">
        <section className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold">
            Welcome to <span className="text-blue-600">University NoteBank</span>
          </h1>
          <p className="mt-3 text-gray-600">
            Browse and download admin-curated notes, organized by level & term.
          </p>

          {!currentUser && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Link
                to="/register"
                className="px-5 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 text-blue-700 rounded bg-blue-50 hover:bg-blue-100"
              >
                Sign In
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default App;
