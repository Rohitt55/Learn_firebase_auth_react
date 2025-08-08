import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import app from "../firebase/firebase.config";
import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const auth = getAuth(app);
  const navigate = useNavigate();

  // Email/Password Registration
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
      setMessage(
        "Registration successful! A verification email has been sent to your address."
      );
      console.log("Verification email sent to:", user.email);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err.message);
      setError("Registration failed: " + err.message);
    }
  };

  // Social Registration/Login Handler
  const handleSocialSignup = async (providerName) => {
    setError("");
    setMessage("");

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
          Please Register
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
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
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
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>

        {/* Social signup buttons */}
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
              onClick={() => handleSocialSignup("facebook")}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              <FaFacebook /> <span>Facebook</span>
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
