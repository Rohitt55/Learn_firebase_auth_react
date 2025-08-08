import React, { useMemo, useState } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

/* ---------- Drive helpers: detect file vs folder ---------- */
const parseDriveLink = (raw) => {
  if (!raw) return { id: "", kind: "", finalUrl: "", previewUrl: "" };

  try {
    const u = new URL(raw);

    // ?id=...
    const idParam = u.searchParams.get("id");

    // /file/d/FILE_ID/...
    const fileMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
    // /folders/FOLDER_ID
    const folderMatch = u.pathname.match(/\/folders\/([^/]+)/);
    // /d/ID (fallback for files)
    const genericMatch = u.pathname.match(/\/d\/([^/]+)/);

    if (folderMatch?.[1] || (idParam && u.pathname.includes("/folders/"))) {
      const id = folderMatch?.[1] || idParam;
      return {
        id,
        kind: "folder",
        finalUrl: `https://drive.google.com/drive/folders/${id}`,
        previewUrl: `https://drive.google.com/drive/folders/${id}`,
      };
    }

    const fileId = fileMatch?.[1] || idParam || genericMatch?.[1];
    if (fileId) {
      return {
        id: fileId,
        kind: "file",
        finalUrl: `https://drive.google.com/uc?export=download&id=${fileId}`, // direct download
        previewUrl: `https://drive.google.com/file/d/${fileId}/view`, // nice preview page
      };
    }

    // Unknown format → just return original
    return { id: "", kind: "", finalUrl: raw, previewUrl: raw };
  } catch {
    return { id: "", kind: "", finalUrl: raw, previewUrl: raw };
  }
};

/* ---------- Level/Term options ---------- */
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

/* ---------- Batch options ---------- */
const BATCHES = [
  { value: "12", label: "12th Batch" },
  { value: "13", label: "13th Batch" },
  { value: "14", label: "14th Batch" },
  { value: "15", label: "15th Batch" },
  { value: "16", label: "16th Batch" },
  { value: "17", label: "17th Batch" },
  { value: "18", label: "18th Batch" },
];

const AddNoteForm = () => {
  const [title, setTitle] = useState("");
  const [university, setUniversity] = useState("BAUST");
  const [subject, setSubject] = useState("");
  const [termLevel, setTermLevel] = useState("L1T1");
  const [batch, setBatch] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const { currentUser } = useAuth();
  const db = getFirestore();

  const parsed = useMemo(() => parseDriveLink(fileLink.trim()), [fileLink]);
  const termLabel = useMemo(
    () => TERM_LEVELS.find((t) => t.value === termLevel)?.label || "",
    [termLevel]
  );

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Please log in again.");

    if (!parsed.id) {
      alert("Paste a valid Google Drive file or folder link.");
      return;
    }
    if (!batch) {
      alert("Please select a batch.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "notes"), {
        title: title.trim(),
        university: university.trim(),
        subject: subject.trim(),

        termLevel,
        termLabel,

        batch, // e.g. "13"
        batchLabel: `${batch}th Batch`,

        // Drive fields
        fileKind: parsed.kind,        // "file" | "folder"
        fileUrl: parsed.finalUrl,     // direct download for file, folder view for folder
        previewUrl: parsed.previewUrl, // nice preview page (safe to open in new tab)

        coverImageUrl: coverUrl.trim() || "",

        uploadedBy: currentUser.uid,
        uploadedByEmail: currentUser.email ?? "",
        uploadedByRole: "admin",
        createdAt: serverTimestamp(),
      });

      alert("✅ Note added!");
      setTitle("");
      setSubject("");
      setFileLink("");
      setCoverUrl("");
      setBatch("");
    } catch (err) {
      console.error(err);
      alert(`Save failed: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5">
      <h2 className="mb-2 text-xl font-semibold">➕ Add a New Note</h2>
      <p className="mb-6 text-sm text-gray-600">
        Paste a Google Drive <b>file or folder</b> link (share as “Anyone with link → Viewer”).
        Files will save as a <i>direct download</i>; folders will save as a <i>folder view</i> link.
      </p>

      <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium">Title</label>
          <input
            className="w-full p-2 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">University</label>
          <input
            className="w-full p-2 border rounded-lg"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Level / Term</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={termLevel}
            onChange={(e) => setTermLevel(e.target.value)}
          >
            {TERM_LEVELS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Batch selection */}
        <div>
          <label className="block mb-1 text-sm font-medium">Batch</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            required
          >
            <option value="">-- Select Batch --</option>
            {BATCHES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium">Subject</label>
          <input
            className="w-full p-2 border rounded-lg"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium">
            Google Drive File/Folder Link
          </label>
          <input
            type="url"
            className="w-full p-2 border rounded-lg"
            placeholder="https://drive.google.com/file/d/FILE_ID/view  or  https://drive.google.com/drive/folders/FOLDER_ID"
            value={fileLink}
            onChange={(e) => setFileLink(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Detected:{" "}
            {parsed.kind
              ? parsed.kind === "file"
                ? "File (will be direct-download)"
                : "Folder (will open folder view)"
              : "—"}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium">
            Cover Image URL (optional)
          </label>
          <input
            type="url"
            className="w-full p-2 border rounded-lg"
            placeholder="Direct image URL (ImgBB / Cloudinary / Drive image)"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <button
            className="w-full p-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNoteForm;
