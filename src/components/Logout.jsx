import React from 'react';
import { getAuth, signOut } from "firebase/auth";
import app from '../firebase/firebase.config';
import { useAuth } from '../context/AuthContext';

const Logout = () => {
  const { currentUser, loading } = useAuth(); // ✅ include loading state
  const auth = getAuth(app);

  const handleLogout = () => {
    console.log("Logout clicked");
    signOut(auth)
      .then(() => {
        alert("User signed out successfully!");
      })
      .catch((error) => {
        console.log("Logout error:", error.message);
      });
  };

  if (loading) return <p>Checking auth status...</p>;
  if (!currentUser) return <p className="my-4 text-gray-600">You are not logged in.</p>;

  return (
    <div className='my-8'>
      <p className='mb-3 font-medium'>
        User: {currentUser.displayName || currentUser.email || "Not set yet"}
      </p>
      <button
        onClick={handleLogout}
        className='px-5 py-2 font-semibold text-white bg-red-600 rounded'
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;
