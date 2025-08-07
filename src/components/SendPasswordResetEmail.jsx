import React, { useState } from "react";
import app from "../firebase/firebase.config";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const SendPasswordResetEmail = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const auth = getAuth(app);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending reset email:", error);
      if (error.code === "auth/user-not-found") {
        setMessage("❌ No user found with that email.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("❌ Invalid email address.");
      } else {
        setMessage("❌ Failed to send reset email. Try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Reset Password
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

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Send Reset Email
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendPasswordResetEmail;
