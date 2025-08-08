import React, { useEffect, useMemo, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import NoteEditorModal from "./NoteEditorModal";

/* Helpers */
const toDrivePreview = (raw) => {
  try {
    const url = new URL(raw);
    const id = url.searchParams.get("id");
    if (id) return `https://drive.google.com/file/d/${id}/view`;
    const m1 = url.pathname.match(/\/file\/d\/([^/]+)/);
    if (m1?.[1]) return `https://drive.google.com/file/d/${m1[1]}/view`;
    const m2 = url.pathname.match(/\/d\/([^/]+)/);
    if (m2?.[1]) return `https://drive.google.com/file/d/${m2[1]}/view`;
    return raw;
  } catch {
    return raw;
  }
};

const TERM_LEVELS = [
  { value: "L1T1", label: "Level 1 · Term I" },
  { value: "L1T2", label: "Level 1 · Term II" },
  { value: "L2T1", label: "Level 2 · Term I" },
  { value: "L2T2", label: "Level 2 · Term II" },
  { value: "L3T1", label: "Level 3 · Term I" },
  { value: "L3T2", label: "Level 3 · Term II" },
  { value: "L4T1", label: "Level 4 · Term I" },
  { value: "L4T2", label: "Level 4 · Term II" },
];

const BATCHES = [
  "12","13","14","15","16","17","18",
];

const ManageNotes = () => {
  const db = getFirestore();

  // separate streams (new + legacy) so merges never “jump back”
  const [notesNew, setNotesNew] = useState([]);     // uploadedByRole == "admin"
  const [notesLegacy, setNotesLegacy] = useState([]); // role == "admin" (old)

  const [editing, setEditing] = useState(null); // note object for modal

  // tiny filter/search state
  const [termFilter, setTermFilter] = useState("");   // e.g., "L1T1" or ""
  const [batchFilter, setBatchFilter] = useState(""); // e.g., "13" or ""
  const [qText, setQText] = useState("");

  useEffect(() => {
    const colRef = collection(db, "notes");
    const qNew = query(colRef, where("uploadedByRole", "==", "admin"));
    const qLegacy = query(colRef, where("role", "==", "admin"));

    const unsubNew = onSnapshot(qNew, (snap) => {
      setNotesNew(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubLegacy = onSnapshot(qLegacy, (snap) => {
      setNotesLegacy(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubNew();
      unsubLegacy();
    };
  }, [db]);

  // merge + dedupe + sort desc
  const allNotes = useMemo(() => {
    const map = new Map();
    [...notesNew, ...notesLegacy].forEach((n) => map.set(n.id, n));
    return Array.from(map.values()).sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
  }, [notesNew, notesLegacy]);

  // apply filters
  const filtered = useMemo(() => {
    const q = qText.trim().toLowerCase();
    return allNotes.filter((n) => {
      // term filter: prefer termLevel, fallback to legacy "term"
      if (termFilter) {
        const t = n.termLevel || ""; // new docs
        if (t !== termFilter) return false;
      }
      if (batchFilter) {
        if ((n.batch || "") !== batchFilter) return false;
      }
      if (q) {
        const hay = `${n.title || ""} ${n.subject || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allNotes, termFilter, batchFilter, qText]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this note permanently?")) return;
    try {
      await deleteDoc(doc(db, "notes", id));
      // onSnapshot removes it automatically — no manual setState needed
    } catch (err) {
      console.error(err);
      alert(`Delete failed: ${err.message || err}`);
    }
  };

  return (
    <div className="p-5">
      <h2 className="mb-2 text-xl font-semibold">🛠️ Manage Notes</h2>
      <p className="mb-4 text-sm text-gray-600">Edit or delete notes you’ve uploaded.</p>

      {/* Filters */}
      <div className="grid items-end gap-3 mb-5 sm:grid-cols-3">
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">Level / Term</label>
          <select
            className="w-full p-2 border rounded"
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
          >
            <option value="">All</option>
            {TERM_LEVELS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">Batch</label>
          <select
            className="w-full p-2 border rounded"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="">All</option>
            {BATCHES.map((b) => (
              <option key={b} value={b}>
                {b}th Batch
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">Search</label>
          <input
            className="w-full p-2 border rounded"
            placeholder="Title or subject…"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No notes match the current filters.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => {
            const preview = toDrivePreview(n.fileUrl);
            const termText = n.termLabel || n.termLevel || n.term || "—";
            const batchText = n.batchLabel || (n.batch ? `${n.batch}th Batch` : "—");

            return (
              <div
                key={n.id}
                className="overflow-hidden bg-white border shadow-sm rounded-xl"
              >
                <div className="relative w-full border-b h-28">
                  {n.coverImageUrl ? (
                    <img
                      src={n.coverImageUrl}
                      alt={`${n.title} cover`}
                      className="absolute inset-0 object-cover w-full h-full"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(59,130,246,.15), rgba(16,185,129,.15))",
                      }}
                    />
                  )}
                </div>

                <div className="px-4 py-4">
                  <h3 className="text-base font-semibold line-clamp-2">{n.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {n.university || "—"} • {termText} • {batchText}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{n.subject || "—"}</p>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <a
                      href={preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-gray-700 rounded hover:bg-gray-800"
                      title="Open preview"
                    >
                      PREVIEW
                    </a>
                    <a
                      href={n.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-teal-600 rounded hover:bg-teal-700"
                      title="Direct download"
                    >
                      DOWNLOAD
                    </a>
                    <button
                      onClick={() => setEditing(n)}
                      className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      EDIT
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(n.id)}
                    className="w-full px-3 py-2 mt-2 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <NoteEditorModal note={editing} onClose={() => setEditing(null)} />}
    </div>
  );
};

export default ManageNotes;
