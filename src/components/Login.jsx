import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import app from "../firebase/firebase.config";

import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const auth = getAuth(app);
  const navigate = useNavigate();

  // Generic Error Handler
  const handleError = (provider, err) => {
    console.error(`${provider} login error:`, err.message);
    if (err.code === "auth/account-exists-with-different-credential") {
      setError(
        "An account already exists with a different login method. Try a different one."
      );
    } else {
      setError(`${provider} login failed. Please try again.`);
    }
  };

  // Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Email/Password login:", userCredential.user);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.message);
      setError("Invalid email or password. Please try again.");
    }
  };

  // Social Login Handler
  const handleSocialLogin = async (providerName) => {
    let provider;

    switch (providerName) {
      case "google":
        provider = new GoogleAuthProvider();
        break;
      case "facebook":
        provider = new FacebookAuthProvider();
        break;
      case "github":
        provider = new GithubAuthProvider();
        break;
      default:
        return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      console.log(`${providerName} login successful:`, result.user);
      navigate("/");
    } catch (err) {
      handleError(providerName, err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Please Login
        </h2>

        {/* Email/Password Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password:
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && <p className="text-sm italic text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        {/* Social Login Buttons */}
        <div className="space-y-4 text-center">
          <p className="text-gray-600">Or login with</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleSocialLogin("google")}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              <FaGoogle /> <span>Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin("facebook")}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              <FaFacebook /> <span>Facebook</span>
            </button>

            <button
              onClick={() => handleSocialLogin("github")}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-gray-800 rounded hover:bg-gray-900"
            >
              <FaGithub /> <span>GitHub</span>
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
