import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { currentUser } = useAuth();
  console.log(currentUser);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-sm p-6 space-y-4 bg-white rounded-md shadow-md">
        <h1 className="text-3xl font-bold text-center">User Profile Card</h1>
        <h2 className="text-center">
          Welcome, <span className="font-semibold">{currentUser?.displayName || 'User'}</span>
        </h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Email:</strong> {currentUser?.email || 'N/A'}</p>

          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="User"
              className="object-cover w-20 h-20 mx-auto border rounded-full"
            />
          ) : (
            <p>No photo available</p>
          )}

          <p>
            <strong>Email Verified:</strong> {currentUser?.emailVerified ? 'Yes' : 'No'}
          </p>
          <p><strong>User ID:</strong> {currentUser?.uid}</p>
        </div>

        <div className="pt-4 text-center">
          <Link
            to="/update-user"
            className="inline-block px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
