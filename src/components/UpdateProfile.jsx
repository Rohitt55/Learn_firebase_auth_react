import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UpdateProfile = () => {
  const { currentUser, updateUserProfile } = useAuth();

  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      await updateUserProfile({
        displayName: name || currentUser.displayName,
        photoURL: photoURL || currentUser.photoURL,
      });
      alert('Profile updated successfully');
      setSuccessMessage('Profile updated successfully');
      setErrorMessage('');
    } catch (error) {
      console.error('Profile update failed:', error.message);
      setErrorMessage('Failed to update profile');
      setSuccessMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-center">Update Your Profile</h1>

        <div className="space-y-2 text-center">
          <p>
            <span className="font-medium">Current Name:</span>{' '}
            {currentUser?.displayName || 'Not Set'}
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="font-medium">Current Photo:</p>
            {currentUser?.photoURL ? (
              <img
                src={currentUser?.photoURL}
                alt="Profile"
                className="object-cover w-20 h-20 border rounded-full"
              />
            ) : (
              <span className="text-sm text-gray-500">No image found</span>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">New Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Set new name"
              className="w-full px-4 py-2 border rounded outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">New Photo URL</label>
            <input
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              type="text"
              placeholder="Paste image URL"
              className="w-full px-4 py-2 border rounded outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {photoURL && (
            <div className="text-center">
              <p className="mb-1 text-sm text-gray-600">Preview:</p>
              <img
                src={photoURL}
                alt="Preview"
                className="object-cover w-20 h-20 mx-auto border rounded-full"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Update Profile
          </button>

          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
