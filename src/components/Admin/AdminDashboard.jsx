import React, { useState } from "react";
import AddNoteForm from "./AddNoteForm";
import ManageNotes from "./ManageNotes";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState("add"); // "add" | "manage"

  return (
    <div className="max-w-6xl px-4 py-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-2 mb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-600">
            {currentUser?.email ? (
              <>Signed in as <span className="font-medium">{currentUser.email}</span></>
            ) : (
              "Signed in"
            )}
          </p>
        </div>

        {/* Tabs */}
        <div className="inline-flex overflow-hidden border rounded-lg">
          <button
            onClick={() => setTab("add")}
            className={`px-4 py-2 text-sm font-semibold ${
              tab === "add"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            + Add Note
          </button>
          <button
            onClick={() => setTab("manage")}
            className={`px-4 py-2 text-sm font-semibold border-l ${
              tab === "manage"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Manage Notes
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white border shadow-sm rounded-2xl">
        {tab === "add" ? (
          <AddNoteForm />
        ) : (
          <ManageNotes />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
