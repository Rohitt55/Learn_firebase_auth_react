import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
} from "firebase/auth";
import app from "../firebase/firebase.config";
import { FaGoogle, FaGithub } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const auth = getAuth(app);
  const navigate = useNavigate();

  const handleError = (provider, err) => {
    console.error(`${provider} login error:`, err.message);
    if (err.code === "auth/account-exists-with-different-credential") {
      setError("An account exists with a different login method.");
    } else {
      setError(`${provider} login failed: ${err.message}`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth); // prevent login
        setError("Please verify your email before logging in.");
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.message);
      setError("Invalid email or password.");
    }
  };

  const handleSocialLogin = async (providerName) => {
    let provider =
      providerName === "google"
        ? new GoogleAuthProvider()
        : new GithubAuthProvider();

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
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full px-4 py-2 border rounded"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full px-4 py-2 border rounded"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-sm italic text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>

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
              onClick={() => handleSocialLogin("github")}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-gray-800 rounded hover:bg-gray-900"
            >
              <FaGithub /> <span>GitHub</span>
            </button>
          </div>
        </div>

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
