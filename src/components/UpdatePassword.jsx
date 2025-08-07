import React, { useState } from "react";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";
import app from "../firebase/firebase.config";
import {
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const UpdatePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const auth = getAuth(app);
  const navigate = useNavigate();

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("❌ Password must be at least 6 characters long.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setMessage("❌ No authenticated user found.");
      return;
    }

    try {
      // Step 1: Reauthenticate
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Step 2: Update password
      await updatePassword(user, newPassword);
      setMessage("✅ Password updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("Update failed:", error.code, error.message);
      if (error.code === "auth/wrong-password") {
        setMessage("❌ Incorrect old password.");
      } else if (error.code === "auth/weak-password") {
        setMessage("❌ Password should be at least 6 characters.");
      } else {
        setMessage("❌ Failed to update password. Try again later.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Update Password
        </h2>
        {message && (
          <p
            className={`text-center p-2 ${
              message.includes("✅") ? "text-green-500" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter current password"
              required
            />
          </div>
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer bottom-3 right-3"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer bottom-3 right-3"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
