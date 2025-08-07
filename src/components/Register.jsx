import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
} from "firebase/auth";
import app from "../firebase/firebase.config";
import { FaGithub, FaGoogle } from "react-icons/fa";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const auth = getAuth(app);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);
      await signOut(auth); // force logout after registration

      setMessage(
        "Registration successful! A verification email has been sent. Please verify your email before logging in."
      );
    } catch (err) {
      console.error("Registration error:", err.message);
      setError(" Registration failed: " + err.message);
    }
  };

  const handleSocialSignup = async (providerName) => {
    setError("");
    setMessage("");

    let provider =
      providerName === "google"
        ? new GoogleAuthProvider()
        : new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log(`${providerName} signup successful:`, result.user);
      navigate("/");
    } catch (err) {
      console.error(`${providerName} signup error:`, err.message);
      setError(`${providerName} signup failed: ${err.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Register
        </h2>

        {message && (
          <p className="pl-2 text-sm italic text-green-600 border-l-4 border-green-400">
            {message}
          </p>
        )}

        {error && (
          <p className="pl-2 text-sm italic text-red-600 border-l-4 border-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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

          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>

        {/* Social Signup */}
        <div className="space-y-4 text-center">
          <p className="text-gray-600">Or sign up with</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleSocialSignup("google")}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              <FaGoogle /> <span>Google</span>
            </button>

            <button
              onClick={() => handleSocialSignup("github")}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-gray-800 rounded hover:bg-gray-900"
            >
              <FaGithub /> <span>GitHub</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
