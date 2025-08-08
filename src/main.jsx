import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import "./index.css";

// auth + guards
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routers/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// user pages
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Blogs from "./components/Blogs";
import UserProfile from "./components/UserProfile";
import UpdateProfile from "./components/UpdateProfile";
import UpdatePassword from "./components/UpdatePassword";
import SendPasswordResetEmail from "./components/SendPasswordResetEmail.jsx";

// notes browse flow (new)
import BatchPicker from "./components/BatchPicker.jsx";
import TermPicker from "./components/TermPicker.jsx";
import NotesByTerm from "./components/NotesByTerm.jsx"; // also used by /notes/:termLevel

// admin pages
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import AdminLogin from "./components/AdminLogin";
import AdminRegister from "./components/AdminRegister";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<App />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Admin auth (public) */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-register" element={<AdminRegister />} />

          {/* User protected */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/blogs"
            element={
              <PrivateRoute>
                <Blogs />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/update-user"
            element={
              <PrivateRoute>
                <UpdateProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PrivateRoute>
                <UpdatePassword />
              </PrivateRoute>
            }
          />
          <Route
            path="/reset-password-email"
            element={
              <PrivateRoute>
                <SendPasswordResetEmail />
              </PrivateRoute>
            }
          />

          {/* 🔥 New browse flow */}
          <Route
            path="/browse"
            element={
              <PrivateRoute>
                <BatchPicker />
              </PrivateRoute>
            }
          />
          <Route
            path="/browse/:batch"
            element={
              <PrivateRoute>
                <TermPicker />
              </PrivateRoute>
            }
          />
          <Route
            path="/browse/:batch/:termLevel"
            element={
              <PrivateRoute>
                <NotesByTerm />
              </PrivateRoute>
            }
          />

          {/* (Optional legacy) Direct term-only route still works */}
          <Route
            path="/notes/:termLevel"
            element={
              <PrivateRoute>
                <NotesByTerm />
              </PrivateRoute>
            }
          />

          {/* Admin protected */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
